package utils

import (
	"fmt"
	"math"
	"paperGrader/internal/adapters/response"
)

func BuildBins(scores []float64, min, max float64, binCount int) []response.GradeBin {
	if !(max > min) || binCount < 1 {
		return []response.GradeBin{}
	}

	width := (max - min) / float64(binCount)
	if width <= 0 {
		width = 1
	}

	prec := 0
	if width < 1 {
		prec = 1
		if width < 0.1 {
			prec = 2
		}
	}

	eps := (max - min) * 1e-9
	bins := make([]response.GradeBin, binCount)

	for i := 0; i < binCount; i++ {
		lower := min + float64(i)*width
		upper := lower + width
		if i == binCount-1 {
			upper = max
		}

		ll := roundTo(lower, prec)
		uu := roundTo(upper, prec)
		if uu <= ll {
			uu = roundTo(lower+width, prec)
			if uu <= ll {
				uu = ll
			}
		}

		label := fmt.Sprintf("%.*f–%.*f", prec, ll, prec, uu)

		bins[i] = response.GradeBin{
			Lower: lower,
			Upper: upper,
			Label: label,
			Count: 0,
		}
	}

	for _, v := range scores {
		if v < min-eps || v > max+eps {
			continue
		}
		idx := int(math.Floor((v-min)/width + eps))
		if idx < 0 {
			idx = 0
		}
		if idx >= binCount {
			idx = binCount - 1
		}
		bins[idx].Count++
	}

	return bins
}

func roundTo(x float64, prec int) float64 {
	p := math.Pow(10, float64(prec))
	return math.Round(x*p) / p
}
