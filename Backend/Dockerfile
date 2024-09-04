FROM golang:1.22-alpine3.20

# Update and install the latest version of openssl
RUN apk update && apk upgrade && apk add --no-cache openssl

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o app ./cmd/

EXPOSE 3000

CMD ["./app"]