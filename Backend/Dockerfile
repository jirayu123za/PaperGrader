# ---------- Builder ----------
FROM golang:1.23-alpine3.20 AS builder
WORKDIR /app

# Install dependencies for building + timezone data
RUN apk add --no-cache ca-certificates tzdata

COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download

COPY . .

# Build the application
ENV CGO_ENABLED=0
RUN --mount=type=cache,target=/root/.cache/go-build \
    go build -tags timetzdata -ldflags="-s -w" -o /out/app ./cmd/

# ---------- Runtime (Tesseract + Poppler) ----------
FROM alpine:3.20

# Required packages for runtime + OCR + PDF utils
RUN apk add --no-cache \
    ca-certificates tzdata \
    tesseract-ocr tesseract-ocr-data-eng tesseract-ocr-data-tha \
    poppler-utils

# Position Tesseract
ENV TESSDATA_PREFIX=/usr/share/tessdata
ENV GIN_MODE=release

WORKDIR /app

# Non-root user + tmp folder for intermediate OCR files
RUN adduser -D -u 10001 appuser \
 && mkdir -p /app/tmp \
 && chown -R appuser:appuser /app
ENV TMPDIR=/app/tmp

# Copy binary from build stage
COPY --from=builder /out/app /app/app

USER appuser
EXPOSE 3000

CMD ["/app/app"]
