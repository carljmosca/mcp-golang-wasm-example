.PHONY: build serve clean

# Build the WASM binary
build:
	@echo "Building WASM binary..."
	GOOS=js GOARCH=wasm go build -o main.wasm main.go
	@echo "Copying wasm_exec.js..."
	@if [ -f "$$(go env GOROOT)/lib/wasm/wasm_exec.js" ]; then \
		cp "$$(go env GOROOT)/lib/wasm/wasm_exec.js" .; \
	else \
		cp "$$(go env GOROOT)/misc/wasm/wasm_exec.js" .; \
	fi
	@echo "Building TypeScript..."
	npm run build
	@echo "Build complete!"

# Serve the application locally
serve: build
	@echo "Starting local server on http://localhost:8080"
	@echo "Press Ctrl+C to stop"
	@python3 -m http.server 8080 || python -m SimpleHTTPServer 8080

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -f main.wasm wasm_exec.js
	@echo "Clean complete!"

# Build and serve in one command
run: build serve
