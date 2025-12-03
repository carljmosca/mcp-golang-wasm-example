# MCP Go WASM Server

A **Model Context Protocol (MCP)** server implementation in Go that runs in the browser via WebAssembly. This project demonstrates how to build an MCP server that can be executed client-side using WASM, enabling streamable HTTP communication without external dependencies.

## 🌟 Features

- **Pure Go Implementation**: Built using Go's standard library with no external dependencies
- **WebAssembly Support**: Runs entirely in the browser via WASM
- **MCP Protocol Compliant**: Implements the Model Context Protocol specification (version 2024-11-05)
- **JSON-RPC 2.0**: Standard JSON-RPC communication protocol
- **Example Tool**: Includes a `getCurrentTime` tool demonstrating tool implementation
- **Beautiful UI**: Modern, responsive web interface with gradient styling and animations
- **Streamable HTTP**: Efficient communication pattern suitable for browser environments

## 🏗️ Architecture

The server uses a streamable HTTP approach where:

1. **Go WASM Module**: Compiles to WebAssembly and exposes JavaScript functions
2. **JavaScript Bridge**: Handles communication between the browser and WASM
3. **JSON-RPC Protocol**: Standard request/response pattern for tool invocation
4. **MCP Compliance**: Follows the Model Context Protocol specification

## 🚀 Quick Start

### Prerequisites

- Go 1.21 or higher
- Python 3 (for local HTTP server)
- Modern web browser with WebAssembly support

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
3. **Call Tool**: Execute the `getCurrentTime` tool to get the current time in RFC3339 format

### Programmatic Usage

```javascript
// Send a JSON-RPC request to the MCP server
const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
        name: "getCurrentTime",
        arguments: {}
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

### Example Tool: getCurrentTime

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

## 🔧 Adding New Tools

To add a new tool to the server:

1. **Define the Tool** in `NewMCPServer()`:

```go
server.registerTool(Tool{
    Name:        "myNewTool",
    Description: "Description of what the tool does",
    InputSchema: map[string]interface{}{
        "type": "object",
        "properties": map[string]interface{}{
            "param1": map[string]interface{}{
                "type":        "string",
                "description": "First parameter",
            },
        },
        "required": []string{"param1"},
    },
})
```

2. **Implement the Handler** in `handleToolCall()`:

```go
case "myNewTool":
    param1 := params.Arguments["param1"].(string)
    // Your tool logic here
    result := ToolResult{
        Content: []ContentBlock{
            {
                Type: "text",
                Text: "Result from myNewTool",
            },
        },
        IsError: false,
    }
    return s.successResponse(req.ID, result)
```

3. **Rebuild** the WASM binary:

```bash
make build
```

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
