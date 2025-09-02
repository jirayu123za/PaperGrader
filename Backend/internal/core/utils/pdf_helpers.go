package utils

import (
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/types"
)

func GetPDFPageCount(filePath string) (int, error) {
	ctx, err := api.ReadContextFile(filePath)
	if err != nil {
		return 0, err
	}
	return ctx.PageCount, nil
}

func ExtractPDFPages(inputPath string, startPage, endPage int) (string, error) {
	tempDir, err := os.MkdirTemp("", "pdf_pages")
	if err != nil {
		return "", err
	}

	err = api.ExtractPagesFile(inputPath, tempDir, []string{fmt.Sprintf("%d-%d", startPage, endPage)}, nil)
	if err != nil {
		os.RemoveAll(tempDir)
		return "", err
	}

	mergedFilePath := filepath.Join(os.TempDir(), fmt.Sprintf("merged_%d_%d.pdf", startPage, endPage))

	files, err := os.ReadDir(tempDir)
	if err != nil {
		os.RemoveAll(tempDir)
		return "", err
	}

	type pageFile struct {
		name string
		path string
		key  int
	}

	reP := regexp.MustCompile(`p(\d+)`)
	var pages []pageFile

	naturalLess := func(a, b string) bool {
		sa := regexp.MustCompile(`\d+|\D+`).FindAllString(a, -1)
		sb := regexp.MustCompile(`\d+|\D+`).FindAllString(b, -1)
		for i := 0; i < len(sa) && i < len(sb); i++ {
			aa, bb := sa[i], sb[i]
			ia, ea := strconv.Atoi(aa)
			ib, eb := strconv.Atoi(bb)
			if ea == nil && eb == nil {
				if ia != ib {
					return ia < ib
				}
			} else {
				if aa != bb {
					return aa < bb
				}
			}
		}
		return len(sa) < len(sb)
	}

	for _, e := range files {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		if strings.ToLower(filepath.Ext(name)) != ".pdf" {
			continue
		}
		path := filepath.Join(tempDir, name)

		matches := reP.FindAllStringSubmatch(name, -1)
		key := 1 << 30
		if len(matches) > 0 {
			last := matches[len(matches)-1][1]
			n, _ := strconv.Atoi(last)
			if n >= startPage && n <= endPage {
				key = n
			} else {
				key = startPage + n - 1
			}
		}

		pages = append(pages, pageFile{name: name, path: path, key: key})
	}

	if len(pages) == 0 {
		os.RemoveAll(tempDir)
		return "", fmt.Errorf("no extracted PDF pages found in %s", tempDir)
	}

	sort.SliceStable(pages, func(i, j int) bool {
		if pages[i].key != pages[j].key {
			return pages[i].key < pages[j].key
		}
		return naturalLess(pages[i].name, pages[j].name)
	})

	filePaths := make([]string, 0, len(pages))
	for _, p := range pages {
		filePaths = append(filePaths, p.path)
	}

	err = api.MergeCreateFile(filePaths, mergedFilePath, false, nil)
	if err != nil {
		os.RemoveAll(tempDir)
		return "", err
	}

	os.RemoveAll(tempDir)

	return mergedFilePath, nil
}

func GetPDFPageSize(pdfPath string, pageNumber uint) (float64, float64, error) {
	ctx, err := api.ReadContextFile(pdfPath)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to read PDF context: %v", err)
	}

	pageDims, err := ctx.PageDims()
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get page dimensions: %v", err)
	}
	if pageNumber < 1 || pageNumber > uint(len(pageDims)) {
		return 0, 0, fmt.Errorf("invalid page number: %d", pageNumber)
	}

	width, height := pageDims[pageNumber-1].Width, pageDims[pageNumber-1].Height
	return width, height, nil
}

func getAllPageRotations(pdfPath string) ([]int, error) {
	ctx, err := api.ReadContextFile(pdfPath)
	if err != nil {
		return nil, fmt.Errorf("read pdf: %w", err)
	}
	pageCount := ctx.PageCount
	rots := make([]int, pageCount)
	for i := 0; i < pageCount; i++ {
		pageNum := i + 1
		pageDict, _, _, err := ctx.PageDict(pageNum, false)
		if err != nil {
			return nil, fmt.Errorf("failed to get page dict for page %d: %w", pageNum, err)
		}
		rot := 0
		if rotateObj, found := pageDict.Find("Rotate"); found && rotateObj != nil {
			if rotateInt, ok := rotateObj.(types.Integer); ok {
				rot = int(rotateInt) % 360
				if rot < 0 {
					rot += 360
				}
			}
		}
		rots[i] = rot
	}
	return rots, nil
}

func getPageRotation(pdfPath string, page uint) (int, error) {
	ctx, err := api.ReadContextFile(pdfPath)
	if err != nil {
		return 0, err
	}
	if int(page) < 1 || int(page) > ctx.PageCount {
		return 0, fmt.Errorf("invalid page: %d", page)
	}
	pd, _, _, err := ctx.PageDict(int(page), false)
	if err != nil {
		return 0, err
	}

	rot := 0
	if o, ok := pd.Find("Rotate"); ok && o != nil {
		if v, ok := o.(types.Integer); ok {
			rot = int(v) % 360
			if rot < 0 {
				rot += 360
			}
		}
	}
	return rot, nil
}

func NormalizePDFRotationToZero(inputPath string) (string, error) {
	tmpNorm, err := os.CreateTemp("", "normalized_rotation_*.pdf")
	if err != nil {
		return "", err
	}
	tmpNorm.Close()
	normPath := tmpNorm.Name()

	if err := copyFile(inputPath, normPath); err != nil {
		_ = os.Remove(normPath)
		return "", fmt.Errorf("copy failed: %w", err)
	}

	rots, err := getAllPageRotations(normPath)
	if err != nil {
		_ = os.Remove(normPath)
		return "", err
	}
	log.Printf("[PDF-INFO] Normalize: Rotations BEFORE = %v", rots)

	var p90, p180, p270 []string
	for i, r := range rots {
		pageStr := strconv.Itoa(i + 1)
		switch r {
		case 90:
			p90 = append(p90, pageStr)
		case 180:
			p180 = append(p180, pageStr)
		case 270:
			p270 = append(p270, pageStr)
		}
	}

	type rotJob struct {
		pages []string
		ang   int
	}

	jobs := []rotJob{
		{p90, 270},
		{p180, 180},
		{p270, 90},
	}

	workingIn := normPath
	for _, j := range jobs {
		if len(j.pages) == 0 {
			continue
		}
		log.Printf("[PDF-INFO] Normalize: rotate pages %v by %d deg", j.pages, j.ang)

		tmpOut, err := os.CreateTemp("", "norm_step_*.pdf")
		if err != nil {
			_ = os.Remove(normPath)
			return "", err
		}
		tmpOut.Close()
		outPath := tmpOut.Name()

		if err := api.RotateFile(workingIn, outPath, j.ang, j.pages, nil); err != nil {
			_ = os.Remove(outPath)
			_ = os.Remove(normPath)
			return "", fmt.Errorf("rotate failed: %w", err)
		}
		if workingIn != normPath {
			_ = os.Remove(workingIn)
		}
		workingIn = outPath
	}

	if workingIn != normPath {
		_ = os.Remove(normPath)
		if err := os.Rename(workingIn, normPath); err != nil {
			return "", err
		}
	}

	rotsAfter, err := getAllPageRotations(normPath)
	if err != nil {
		_ = os.Remove(normPath)
		return "", err
	}
	log.Printf("[PDF-INFO] Normalize: Rotations AFTER  = %v", rotsAfter)

	return normPath, nil
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}

	defer func() {
		_ = out.Close()
		if err != nil {
			_ = os.Remove(dst)
		}
	}()

	if _, err = io.Copy(out, in); err != nil {
		return err
	}
	return out.Sync()
}

// ! new version
func CropPDFWithBoundingBox(inputPath, submissionFileName, bboxType string, bboxPage uint,
	bboxPointX float64, bboxPointY float64, bboxWidth float64, bboxHeight float64) (string, error) {

	log.Printf("Start cropping PDF: %s, Page: %d, BBox Type: %s, Position: %f, %f, %f, %f",
		inputPath, bboxPage, bboxType, bboxPointX, bboxPointY, bboxWidth, bboxHeight)

	// --- Log ก่อน normalize ---
	if err := logPageGeometry(inputPath, bboxPage, "BEFORE-NORMALIZE"); err != nil {
		log.Printf("warn: %v", err)
	}

	// หมุนเดิมของหน้า (ใช้เป็นฐาน mapping + ใช้หมุนผลลัพธ์ให้ตรงกับ UI)
	rotBefore, err := getPageRotation(inputPath, bboxPage)
	if err != nil {
		return "", fmt.Errorf("get rotate: %w", err)
	}

	// --- Normalize /Rotate = 0 ---
	normPath, err := NormalizePDFRotationToZero(inputPath)
	if err != nil {
		return "", fmt.Errorf("normalize rotation failed: %w", err)
	}
	defer os.Remove(normPath)

	if err := logPageGeometry(normPath, bboxPage, "AFTER-NORMALIZE"); err != nil {
		log.Printf("warn: %v", err)
	}

	// --- เลือกฐานพิกัดเป็น CropBox ถ้ามี ไม่งั้น MediaBox ---
	base, err := getPageBaseBox(normPath, bboxPage)
	if err != nil {
		return "", fmt.Errorf("get base box failed: %w", err)
	}
	baseW, baseH := boxDims(base)
	baseLLX := float64(base.Rect.LL.X)
	baseLLY := float64(base.Rect.LL.Y)

	// --- ขนาดหน้าในมุมมอง UI (portrait effective) ---
	effW, effH := baseW, baseH
	if rotBefore == 90 || rotBefore == 270 {
		effW, effH = baseH, baseW
	}

	// --- UI (top-left) -> UI(bottom-left) ---
	xBL := bboxPointX
	yBL := effH - bboxPointY - bboxHeight

	// --- map เป็นพิกัด PDF (LL) บนไฟล์ normalize แล้ว ---
	var llx, lly float64
	switch rotBefore {
	case 0:
		llx = baseLLX + xBL
		lly = baseLLY + yBL
	case 90:
		// สูตรที่ถูกต้องสำหรับ 90°
		llx = baseLLX + (baseW - yBL - bboxHeight)
		lly = baseLLY + xBL
	case 180:
		llx = baseLLX + (baseW - xBL - bboxWidth)
		lly = baseLLY + (baseH - yBL - bboxHeight)
	case 270:
		// สูตรที่ถูกต้องสำหรับ 270°
		llx = baseLLX + yBL
		lly = baseLLY + (baseH - xBL - bboxWidth)
	default:
		llx = baseLLX + xBL
		lly = baseLLY + yBL
	}

	// --- สลับขนาดกล่องบนแกน PDF เมื่อ 90°/270° ---
	cropW, cropH := bboxWidth, bboxHeight
	if rotBefore == 90 || rotBefore == 270 {
		cropW, cropH = bboxHeight, bboxWidth
	}

	// --- Clamp พิกัดไม่ให้ล้นขอบหน้า ---
	maxLLX := baseLLX + baseW - cropW
	maxLLY := baseLLY + baseH - cropH
	origLLX, origLLY := llx, lly
	if llx < baseLLX {
		llx = baseLLX
	}
	if lly < baseLLY {
		lly = baseLLY
	}
	if llx > maxLLX {
		llx = maxLLX
	}
	if lly > maxLLY {
		lly = maxLLY
	}
	if llx != origLLX || lly != origLLY {
		log.Printf("[CROP-DBG] CLAMPED LL from (%.2f,%.2f) to (%.2f,%.2f)", origLLX, origLLY, llx, lly)
	}

	// --- Log ตำแหน่ง crop ---
	logCropBoxPosition("CROP", bboxPage, rotBefore, base,
		bboxPointX, bboxPointY, bboxWidth, bboxHeight,
		effW, effH,
		llx, lly, cropW, cropH,
	)

	// --- ครอปหน้า ---
	box := &model.Box{Rect: types.RectForWidthAndHeight(llx, lly, cropW, cropH)}
	log.Printf("rotBefore=%d | UIeff=%.2fx%.2f | Base=%.2fx%.2f | ll=(%.2f,%.2f) wh=(%.2f,%.2f)",
		rotBefore, effW, effH, baseW, baseH, llx, lly, cropW, cropH)

	croppedPDFPath := filepath.Join(os.TempDir(),
		fmt.Sprintf("%s_%s_cropped.pdf", strings.TrimSuffix(submissionFileName, ".pdf"), bboxType))
	log.Printf("Cropped PDF path: %s", croppedPDFPath)

	if err = api.CropFile(normPath, croppedPDFPath, []string{strconv.Itoa(int(bboxPage))}, box, nil); err != nil {
		log.Printf("Failed to crop PDF: %v", err)
		return "", fmt.Errorf("failed to crop PDF: %v", err)
	}
	defer os.Remove(croppedPDFPath)

	if _, err := os.Stat(croppedPDFPath); os.IsNotExist(err) {
		return "", fmt.Errorf("cropped PDF file does not exist: %s", croppedPDFPath)
	}

	// --- หมุนผลลัพธ์ให้ตรงกับมุมมอง UI (บนหน้าที่ครอป) ---
	rotateAngle := 0
	switch rotBefore {
	case 90:
		rotateAngle = 90
	case 180:
		rotateAngle = 180
	case 270:
		rotateAngle = 270
	}

	renderPDFPath := croppedPDFPath
	if rotateAngle != 0 {
		tmpRot, err := os.CreateTemp("", "cropped_rot_*.pdf")
		if err != nil {
			return "", fmt.Errorf("create temp for rotated: %w", err)
		}
		tmpRot.Close()

		pageSpec := strconv.Itoa(int(bboxPage)) // ไฟล์ที่ครอปยังมีหลายหน้า → หมุนหน้าเดิม
		if err := api.RotateFile(croppedPDFPath, tmpRot.Name(), rotateAngle, []string{pageSpec}, nil); err != nil {
			return "", fmt.Errorf("rotate cropped pdf failed: %w", err)
		}
		defer os.Remove(tmpRot.Name())
		renderPDFPath = tmpRot.Name()
		log.Printf("[CROP-DBG] Rotated cropped PDF by %d° on page %s to match UI.", rotateAngle, pageSpec)
	}

	// --- คำนวณขนาดพิกเซลจากกรอบใน UI (pt → px) ---
	const dpi = 300
	pxW := int(math.Round(bboxWidth * float64(dpi) / 72.0))
	pxH := int(math.Round(bboxHeight * float64(dpi) / 72.0))
	if pxW < 1 {
		pxW = 1
	}
	if pxH < 1 {
		pxH = 1
	}

	// ถ้าหมุน 90/270 ตอน preview ให้สลับ outW/outH กัน
	outW, outH := pxW, pxH
	if rotateAngle == 90 || rotateAngle == 270 {
		outW, outH = pxH, pxW
	}
	log.Printf("[CROP-DBG] Rasterize at %ddpi -> %dx%d px (post-rotate)", dpi, outW, outH)

	// --- เรนเดอร์เฉพาะหน้า bboxPage ของไฟล์ที่ครอป/หมุนแล้ว ---
	outputPrefix := filepath.Join(os.TempDir(),
		fmt.Sprintf("%s_%s", strings.TrimSuffix(submissionFileName, ".pdf"), bboxType))

	cmd := exec.Command(
		"pdftoppm",
		"-cropbox",
		"-r", strconv.Itoa(dpi),
		"-scale-to-x", strconv.Itoa(outW),
		"-scale-to-y", strconv.Itoa(outH),
		"-f", strconv.Itoa(int(bboxPage)),
		"-l", strconv.Itoa(int(bboxPage)),
		"-png",
		renderPDFPath,
		outputPrefix,
	)
	if err = cmd.Run(); err != nil {
		return "", fmt.Errorf("failed to convert PDF to image using pdftoppm: %v", err)
	}

	// --- เปลี่ยนชื่อไฟล์ png ที่ได้ ---
	matches, err := filepath.Glob(fmt.Sprintf("%s-*.png", outputPrefix))
	if err != nil || len(matches) == 0 {
		return "", fmt.Errorf("converted image not found (glob): %s-*.png", outputPrefix)
	}
	originalOutputPath := matches[0]
	desiredImagePath := filepath.Join(os.TempDir(),
		fmt.Sprintf("%s_%s_cropped_%d.png",
			strings.TrimSuffix(submissionFileName, ".pdf"), bboxType, bboxPage))

	if _, err := os.Stat(originalOutputPath); os.IsNotExist(err) {
		return "", fmt.Errorf("converted image not found: %s", originalOutputPath)
	}
	if err = os.Rename(originalOutputPath, desiredImagePath); err != nil {
		return "", fmt.Errorf("failed to rename image file: %v", err)
	}

	// --- ล้างไฟล์ส่วนเกิน ---
	if extras, _ := filepath.Glob(fmt.Sprintf("%s-*.png", outputPrefix)); len(extras) > 1 {
		for _, f := range extras {
			if f != desiredImagePath {
				_ = os.Remove(f)
			}
		}
	}

	log.Printf("Final cropped image saved: %s", desiredImagePath)
	return desiredImagePath, nil
}

// OCR process
func DownloadFileFromURL(url, filename string) error {
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to download file: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("received non-200 response code: %d", resp.StatusCode)
	}

	out, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return fmt.Errorf("failed to save file: %w", err)
	}

	return nil
}

func getPageBaseBox(pdfPath string, page uint) (*model.Box, error) {
	ctx, err := api.ReadContextFile(pdfPath)
	if err != nil {
		return nil, fmt.Errorf("read pdf: %w", err)
	}
	if int(page) < 1 || int(page) > ctx.PageCount {
		return nil, fmt.Errorf("invalid page: %d", page)
	}
	pbs, err := ctx.PageBoundaries(types.IntSet{int(page): true})
	if err != nil {
		return nil, fmt.Errorf("page boundaries: %w", err)
	}
	if len(pbs) == 0 {
		return nil, fmt.Errorf("no page boundaries")
	}
	pb := pbs[0]
	base := pb.Crop
	if base == nil {
		base = pb.Media
	}
	if base == nil {
		return nil, fmt.Errorf("no crop/media box found")
	}
	return base, nil
}

func boxDims(b *model.Box) (w, h float64) {
	r := b.Rect
	return r.UR.X - r.LL.X, r.UR.Y - r.LL.Y
}

func logPageGeometry(pdfPath string, page uint, note string) error {
	ctx, err := api.ReadContextFile(pdfPath)
	if err != nil {
		return fmt.Errorf("logPageGeometry: read pdf: %w", err)
	}
	if int(page) < 1 || int(page) > ctx.PageCount {
		return fmt.Errorf("logPageGeometry: invalid page: %d", page)
	}

	pageDims, err := ctx.PageDims()
	if err != nil {
		return fmt.Errorf("logPageGeometry: page dims: %w", err)
	}
	W := float64(pageDims[page-1].Width)
	H := float64(pageDims[page-1].Height)

	rot, err := getPageRotation(pdfPath, page)
	if err != nil {
		return fmt.Errorf("logPageGeometry: get rotate: %w", err)
	}

	pbs, err := ctx.PageBoundaries(types.IntSet{int(page): true})
	if err != nil || len(pbs) == 0 {
		return fmt.Errorf("logPageGeometry: page boundaries: %w", err)
	}
	pb := pbs[0]
	var (
		mbW, mbH float64
		cbW, cbH float64
	)
	if pb.Media != nil {
		mbW = pb.Media.Rect.UR.X - pb.Media.Rect.LL.X
		mbH = pb.Media.Rect.UR.Y - pb.Media.Rect.LL.Y
	}
	if pb.Crop != nil {
		cbW = pb.Crop.Rect.UR.X - pb.Crop.Rect.LL.X
		cbH = pb.Crop.Rect.UR.Y - pb.Crop.Rect.LL.Y
	}

	pt2mm := 25.4 / 72.0

	log.Printf("[PDF-INFO] %s | page=%d | Rotate=%d", note, page, rot)
	log.Printf("[PDF-INFO] %s | PageDims  : %.2f x %.2f pt (%.2f x %.2f mm)", note, W, H, W*pt2mm, H*pt2mm)
	log.Printf("[PDF-INFO] %s | MediaBox  : %.2f x %.2f pt (%.2f x %.2f mm)", note, mbW, mbH, mbW*pt2mm, mbH*pt2mm)
	if pb.Crop != nil {
		log.Printf("[PDF-INFO] %s | CropBox   : %.2f x %.2f pt (%.2f x %.2f mm)", note, cbW, cbH, cbW*pt2mm, cbH*pt2mm)
	} else {
		log.Printf("[PDF-INFO] %s | CropBox   : <nil> (ใช้ MediaBox)", note)
	}

	effW, effH := W, H
	if rot == 90 || rot == 270 {
		effW, effH = H, W
	}
	log.Printf("[PDF-INFO] %s | Effective  : %.2f x %.2f pt (จากมุมหมุน)", note, effW, effH)
	return nil
}

func logCropBoxPosition(note string, page uint, rotBefore int, base *model.Box, uiX, uiY, uiW, uiH float64, effW, effH float64, llx, lly, w, h float64) {
	baseW := base.Rect.UR.X - base.Rect.LL.X
	baseH := base.Rect.UR.Y - base.Rect.LL.Y
	urx := llx + w
	ury := lly + h
	pctLeft := 100.0 * (llx - float64(base.Rect.LL.X)) / baseW
	pctBottom := 100.0 * (lly - float64(base.Rect.LL.Y)) / baseH
	pctW := 100.0 * w / baseW
	pctH := 100.0 * h / baseH
	pt2mm := 25.4 / 72.0

	log.Printf("[CROP-DBG] %s | page=%d | rotBefore=%d", note, page, rotBefore)
	log.Printf("[CROP-DBG] UI rect (TL,w,h) = (%.2f, %.2f, %.2f, %.2f) pt | EffectivePage=%.2fx%.2f pt", uiX, uiY, uiW, uiH, effW, effH)
	log.Printf("[CROP-DBG] BaseBox: LL(%.2f, %.2f) -> UR(%.2f, %.2f) pt | Size=%.2fx%.2f pt (%.2fx%.2f mm)", base.Rect.LL.X, base.Rect.LL.Y, base.Rect.UR.X, base.Rect.UR.Y, baseW, baseH, baseW*pt2mm, baseH*pt2mm)
	log.Printf("[CROP-DBG] PDF rect: LL(%.2f, %.2f) UR(%.2f, %.2f) pt | W=%.2f H=%.2f pt (%.2fx%.2f mm)", llx, lly, urx, ury, w, h, w*pt2mm, h*pt2mm)
	log.Printf("[CROP-DBG] Percent of page (base): left=%.2f%% bottom=%.2f%% width=%.2f%% height=%.2f%%", pctLeft, pctBottom, pctW, pctH)
}
