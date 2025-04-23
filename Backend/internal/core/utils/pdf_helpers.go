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
	"strconv"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/types"
)

type BoundingBoxPosition struct {
	X1 float64 `json:"X1"`
	Y1 float64 `json:"Y1"`
	X2 float64 `json:"X2"`
	Y2 float64 `json:"Y2"`
}

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

	var filePaths []string
	for _, file := range files {
		filePaths = append(filePaths, filepath.Join(tempDir, file.Name()))
	}

	err = api.MergeCreateFile(filePaths, mergedFilePath, false, nil)
	if err != nil {
		os.RemoveAll(tempDir)
		return "", err
	}

	os.RemoveAll(tempDir)

	return mergedFilePath, nil
}

func ParseBoundingBoxPosition(positionStr string) (BoundingBoxPosition, error) {
	var position BoundingBoxPosition
	cleaned := strings.ReplaceAll(positionStr, "(", "")
	cleaned = strings.ReplaceAll(cleaned, ")", "")

	parts := strings.Split(cleaned, ",")
	if len(parts) != 4 {
		return position, fmt.Errorf("invalid bounding box format")
	}

	x2, err := strconv.ParseFloat(strings.TrimSpace(parts[0]), 64)
	if err != nil {
		return position, fmt.Errorf("invalid x2 value")
	}
	y2, err := strconv.ParseFloat(strings.TrimSpace(parts[1]), 64)
	if err != nil {
		return position, fmt.Errorf("invalid y2 value")
	}
	x1, err := strconv.ParseFloat(strings.TrimSpace(parts[2]), 64)
	if err != nil {
		return position, fmt.Errorf("invalid x1 value")
	}
	y1, err := strconv.ParseFloat(strings.TrimSpace(parts[3]), 64)
	if err != nil {
		return position, fmt.Errorf("invalid y1 value")
	}

	position = BoundingBoxPosition{
		X1: math.Min(x1, x2),
		Y1: math.Min(y1, y2),
		X2: math.Max(x1, x2),
		Y2: math.Max(y1, y2),
	}

	log.Printf("Parsed bounding box position: %v", position)
	return position, nil
}

func GetPDFPageSize(pdfPath string, pageNumber int) (float64, float64, error) {
	ctx, err := api.ReadContextFile(pdfPath)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to read PDF context: %v", err)
	}

	pageDims, err := ctx.PageDims()
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get page dimensions: %v", err)
	}
	if pageNumber < 1 || pageNumber > len(pageDims) {
		return 0, 0, fmt.Errorf("invalid page number: %d", pageNumber)
	}

	width, height := pageDims[pageNumber-1].Width, pageDims[pageNumber-1].Height
	return width, height, nil
}

func ConvertBoundingBoxPosition(original BoundingBoxPosition, pageHeight float64) BoundingBoxPosition {
	return BoundingBoxPosition{
		X1: original.X1,
		Y1: pageHeight - original.Y2,
		X2: original.X2,
		Y2: pageHeight - original.Y1,
	}
}

func CropPDFWithBoundingBox(inputPath, submissionFileName, bboxType string, positionStr string, pageNumber int) (string, error) {
	log.Printf("Start cropping PDF: %s, Page: %d, BBox Type: %s, Position: %s", inputPath, pageNumber, bboxType, positionStr)

	position, err := ParseBoundingBoxPosition(positionStr)
	if err != nil {
		log.Printf("Failed to parse bounding box: %v", err)
		return "", fmt.Errorf("failed to parse bounding box: %v", err)
	}
	log.Printf("Parsed bounding box: %+v", position)

	pageWidth, pageHeight, err := GetPDFPageSize(inputPath, pageNumber)
	if err != nil {
		return "", fmt.Errorf("failed to get PDF page size: %v", err)
	}
	log.Printf("PDF page size: %.2f x %.2f", pageWidth, pageHeight)

	convertedBox := ConvertBoundingBoxPosition(position, pageHeight)

	box := &model.Box{
		Rect: &types.Rectangle{
			LL: types.Point{X: convertedBox.X1, Y: convertedBox.Y1},
			UR: types.Point{X: convertedBox.X2, Y: convertedBox.Y2},
		},
	}

	croppedPDFPath := filepath.Join(os.TempDir(), fmt.Sprintf("%s_%s_cropped.pdf", strings.TrimSuffix(submissionFileName, ".pdf"), bboxType))
	log.Printf("Cropped PDF path: %s", croppedPDFPath)

	err = api.CropFile(inputPath, croppedPDFPath, []string{strconv.Itoa(pageNumber)}, box, nil)
	if err != nil {
		log.Printf("Failed to crop PDF: %v", err)
		return "", fmt.Errorf("failed to crop PDF: %v", err)
	}
	log.Printf("Successfully cropped PDF: %s", croppedPDFPath)
	defer os.Remove(croppedPDFPath)

	if _, err := os.Stat(croppedPDFPath); os.IsNotExist(err) {
		log.Printf("Cropped PDF file does not exist: %s", croppedPDFPath)
		return "", fmt.Errorf("cropped PDF file does not exist")
	}

	outputPrefix := filepath.Join(os.TempDir(), fmt.Sprintf("%s_%s_tmp", strings.TrimSuffix(submissionFileName, ".pdf"), bboxType))
	cmd := exec.Command("pdftoppm", "-cropbox", "-png", croppedPDFPath, outputPrefix)
	err = cmd.Run()
	if err != nil {
		return "", fmt.Errorf("failed to convert PDF to image using pdftoppm: %v", err)
	}

	originalOutputPath := fmt.Sprintf("%s-1.png", outputPrefix)
	desiredImagePath := filepath.Join(os.TempDir(), fmt.Sprintf("%s_%s_cropped_%d.png", strings.TrimSuffix(submissionFileName, ".pdf"), bboxType, pageNumber))

	if _, err := os.Stat(originalOutputPath); os.IsNotExist(err) {
		return "", fmt.Errorf("converted image not found: %s", originalOutputPath)
	}

	err = os.Rename(originalOutputPath, desiredImagePath)
	if err != nil {
		return "", fmt.Errorf("failed to rename image file: %v", err)
	}

	extraImages, err := filepath.Glob(fmt.Sprintf("%s-*.png", outputPrefix))
	if err == nil {
		for _, f := range extraImages {
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
