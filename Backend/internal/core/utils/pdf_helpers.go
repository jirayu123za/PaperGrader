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

func ExtractPDFPages(inputPath, outputPath string, startPage, endPage int) error {
	outputPath = filepath.Clean(outputPath)
	os.MkdirAll(outputPath, os.ModePerm)
	return api.ExtractPagesFile(inputPath, outputPath, []string{fmt.Sprintf("%d-%d", startPage, endPage)}, nil)
}
