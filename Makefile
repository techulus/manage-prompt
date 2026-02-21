.PHONY: build run clean

build:
	go build -o bin/manageprompt ./cmd/manageprompt

run:
	go run ./cmd/manageprompt start

clean:
	rm -rf bin/
