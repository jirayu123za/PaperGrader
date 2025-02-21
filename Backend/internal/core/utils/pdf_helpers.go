package utils

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/pdfcpu/pdfcpu/pkg/api"
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
