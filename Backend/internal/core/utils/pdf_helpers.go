package utils

import (
	"fmt"
	"image"
	"image/png"
	"log"
	"math"
	"os"
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

func CropPDFByBoundingBox(inputPath, submissionFileName, bboxType string, positionStr string, pageNumber int) (string, error) {
	position, err := ParseBoundingBoxPosition(positionStr)
	if err != nil {
		return "", fmt.Errorf("failed to parse BoundingBoxPosition: %v", err)
	}

	_, pageHeight, err := GetPDFPageSize(inputPath, pageNumber)
	if err != nil {
		return "", fmt.Errorf("failed to get PDF page size: %v", err)
	}

	convertedBox := ConvertBoundingBoxPosition(position, pageHeight)

	box := &model.Box{
		Rect: &types.Rectangle{
			LL: types.Point{X: convertedBox.X1, Y: convertedBox.Y1},
			UR: types.Point{X: convertedBox.X2, Y: convertedBox.Y2},
		},
	}
	croppedFileName := fmt.Sprintf("%s_%s.pdf", strings.TrimSuffix(submissionFileName, ".pdf"), bboxType)
	croppedFilePath := filepath.Join(os.TempDir(), croppedFileName)

	log.Printf("📌 Cropping submission file: %s (Page: %d)", inputPath, pageNumber)
	log.Printf("🔹 Bounding Box: {X1: %.2f, Y1: %.2f, X2: %.2f, Y2: %.2f}", position.X1, position.Y1, position.X2, position.Y2)
	log.Printf("📝 Saving cropped file: %s", croppedFilePath)

	err = api.CropFile(inputPath, croppedFilePath, []string{strconv.Itoa(pageNumber)}, box, nil)
	if err != nil {
		return "", fmt.Errorf("failed to crop PDF: %v", err)
	}
	return croppedFilePath, nil
}

func CropPDFToImage(inputPath, submissionFileName, bboxType string, positionStr string, pageNumber int) (string, error) {
	tempDir, err := os.MkdirTemp("", "pdf_images")
	if err != nil {
		return "", fmt.Errorf("failed to create temp directory: %v", err)
	}
	defer os.RemoveAll(tempDir)

	err = api.ExtractImagesFile(inputPath, tempDir, []string{fmt.Sprintf("%d", pageNumber)}, nil)
	if err != nil {
		return "", fmt.Errorf("failed to extract images from PDF: %v", err)
	}

	files, err := os.ReadDir(tempDir)
	if err != nil || len(files) == 0 {
		return "", fmt.Errorf("failed to find extracted images")
	}

	imageFilePath := filepath.Join(tempDir, files[0].Name())

	imgFile, err := os.Open(imageFilePath)
	if err != nil {
		return "", fmt.Errorf("failed to open extracted image: %v", err)
	}
	defer imgFile.Close()

	img, _, err := image.Decode(imgFile)
	if err != nil {
		return "", fmt.Errorf("failed to decode extracted image: %v", err)
	}

	position, err := ParseBoundingBoxPosition(positionStr)
	if err != nil {
		return "", fmt.Errorf("failed to parse bounding box: %v", err)
	}

	bounds := img.Bounds()
	if int(position.X2) > bounds.Max.X || int(position.Y2) > bounds.Max.Y ||
		int(position.X1) < 0 || int(position.Y1) < 0 {
		return "", fmt.Errorf("bounding box is out of image bounds")
	}

	rect := image.Rect(int(position.X1), int(position.Y1), int(position.X2), int(position.Y2))
	croppedImg := img.(interface {
		SubImage(r image.Rectangle) image.Image
	}).SubImage(rect)

	croppedFileName := fmt.Sprintf("%s_%s.png", strings.TrimSuffix(submissionFileName, ".pdf"), bboxType)
	croppedFilePath := filepath.Join(os.TempDir(), croppedFileName)

	outFile, err := os.Create(croppedFilePath)
	if err != nil {
		return "", fmt.Errorf("failed to create cropped image file: %v", err)
	}
	defer outFile.Close()

	err = png.Encode(outFile, croppedImg)
	if err != nil {
		return "", fmt.Errorf("failed to encode cropped image: %v", err)
	}

	return croppedFilePath, nil
}
