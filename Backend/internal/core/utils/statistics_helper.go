package utils

import (
	"fmt"
	"math"
	"paperGrader/internal/adapters/response"
)

func BuildBins(scores []float64, min float64, max float64, binCount int) []response.GradeBin {
	if max <= min || binCount < 1 {
		return []response.GradeBin{}
	}

	width := (max - min) / float64(binCount)
	if width <= 0 {
		width = 1
	}

	bins := make([]response.GradeBin, binCount)
	for i := 0; i < binCount; i++ {
		lower := min + float64(i)*width
		upper := lower + width
		if i == binCount-1 {
			upper = max
		}
		bins[i] = response.GradeBin{
			Lower: lower,
			Upper: upper,
			Label: fmt.Sprintf("%d–%d", int(math.Ceil(lower)), int(math.Floor(upper))),
			Count: 0,
		}
	}

	for _, v := range scores {
		if v < min {
			continue
		}
		if v > max {
			continue
		}
		idx := int((v - min) / width)
		if idx >= binCount {
			idx = binCount - 1
		}
		bins[idx].Count++
	}
	return bins
}
