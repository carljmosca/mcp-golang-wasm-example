# MCP Go WASM Server

A **Model Context Protocol (MCP)** server implementation in Go that runs in the browser via WebAssembly. This project demonstrates how to build an MCP server that can be executed client-side using WASM, enabling streamable HTTP communication without external dependencies.

## 🌟 Features

- **Pure Go Implementation**: Built using Go's standard library with no external dependencies
- **WebAssembly Support**: Runs entirely in the browser via WASM
- **MCP Protocol Compliant**: Implements the Model Context Protocol specification (version 2024-11-05)


1. **Go WASM Module**: Compiles to WebAssembly and exposes JavaScript functions
2. **JavaScript Bridge**: Handles communication between the browser and WASM
3. **JSON-RPC Protocol**: Standard request/response pattern for tool invocation
4. **MCP Compliance**: Follows the Model Context Protocol specification

## 🚀 Quick Start


### Prerequisites

- Go 1.21 or higher
- Python 3 (for local HTTP server)
- Modern web browser with WebAssembly support
- **Or use the included Dev Container for a pre-configured environment**

### Using Dev Container (Recommended)

This project includes a [Dev Container](https://containers.dev/) configuration for VS Code. You do not need to install Go or Python locally.

**Steps:**
1. Open the project in VS Code.
2. If prompted, "Reopen in Container" (or use the Command Palette: `Dev Containers: Reopen in Container`).
3. The container will build with Go and Python pre-installed, and VS Code extensions for Go and Python enabled.
4. Use the integrated terminal to run `make build` and `make serve` as described below.

This ensures a consistent development environment for all contributors.

### Build and Run

```bash
# Build the WASM binary
make build

# Serve the application (builds automatically)
make serve

# Or combine both steps
make run
```

Then open your browser to [http://localhost:8080](http://localhost:8080)

### Manual Build

```bash
# Build WASM
GOOS=js GOARCH=wasm go build -o main.wasm main.go

# Copy the Go WASM runtime
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .

# Serve with any HTTP server
python3 -m http.server 8080
```

## 📖 Usage

### Using the Web Interface

1. **Initialize Server**: Click "Initialize Server" to establish the MCP connection
2. **List Tools**: View all available tools and their schemas
3. **Call Tool**: Select a tool from the dropdown, enter parameters (space-separated), and execute the tool. For example, use `add 2 3` to get the sum of 2 and 3, or select `getCurrentTime` with no parameters.

### Programmatic Usage

```javascript
// Send a JSON-RPC request to the MCP server
const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
        name: "add",
        arguments: { a: 2, b: 3 }
    }
};

const responseJSON = mcpHandleRequest(JSON.stringify(request));
const response = JSON.parse(responseJSON);
console.log(response.result);
```

## 🛠️ MCP Protocol Implementation

### Supported Methods

| Method | Description |
|--------|-------------|
| `initialize` | Initialize the MCP server connection |
| `tools/list` | List all available tools |
| `tools/call` | Execute a specific tool |


### Example Tools

#### getCurrentTime
```json
{
    "name": "getCurrentTime",
    "description": "Returns the current time in RFC3339 format",
    "inputSchema": {
        "type": "object",
        "properties": {},
        "required": []
    }
}
```

#### add
```json
{
    "name": "add",
    "description": "Returns the sum of two numbers (a + b)",
    "inputSchema": {
        "type": "object",
        "properties": {
            "a": { "type": "number" },
            "b": { "type": "number" }
        },
        "required": ["a", "b"]
    }
}
```

## 🔧 Adding New Tools

## 🔧 Adding or Using Tools

To use a tool, select it from the dropdown in the UI and enter its parameters (space-separated). For example:

- For `add`, enter: `2 3` (returns 5)
- For `getCurrentTime`, no parameters are needed

To add a new tool to the server, define it in `NewMCPServer()` and implement its handler in `handleToolCall()`, then rebuild the WASM binary.

## 📁 Project Structure

```
.
├── main.go           # MCP server implementation
├── index.html        # Web interface
├── go.mod           # Go module definition
├── Makefile         # Build automation
└── README.md        # This file
```

## 🎨 Design Philosophy

This implementation prioritizes:

- **Simplicity**: No external dependencies, pure Go standard library
- **Efficiency**: Minimal overhead, direct JavaScript bridge
- **Idiomatic Go**: Follows Go best practices and conventions
- **Browser-First**: Designed specifically for WASM/browser environments
- **MCP Compliance**: Adheres to the Model Context Protocol specification

## 🔍 Technical Details

### WASM Bridge

The Go code exposes a single function to JavaScript:

```go
js.Global().Set("mcpHandleRequest", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
    requestJSON := args[0].String()
    response := server.HandleRequest(requestJSON)
    return response
}))
```

### JSON-RPC 2.0

All communication follows the JSON-RPC 2.0 specification:

- **Request**: `{ jsonrpc, id, method, params }`
- **Response**: `{ jsonrpc, id, result }` or `{ jsonrpc, id, error }`

### Error Codes

Standard JSON-RPC error codes:

- `-32700`: Parse error
- `-32601`: Method not found
- `-32602`: Invalid params

## 🧪 Testing

Test the server using the web interface or browser console:

```javascript
// Initialize
mcpHandleRequest('{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}')

// List tools
mcpHandleRequest('{"jsonrpc":"2.0","id":2,"method":"tools/list"}')

// Call tool
mcpHandleRequest('{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"getCurrentTime"}}')
```

## 📝 License

MIT License - feel free to use this in your own projects!

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Add new example tools
- Improve the UI
- Enhance error handling
- Add tests
- Improve documentation

## 🔗 Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Go WebAssembly Documentation](https://github.com/golang/go/wiki/WebAssembly)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)

---

Built with ❤️ using Go and WebAssembly
