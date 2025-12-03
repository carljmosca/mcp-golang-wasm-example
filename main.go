//go:build wasm
// +build wasm

package main

import (
	"encoding/json"
	"fmt"
	"syscall/js"
	"time"
)

// MCP Protocol Types
type JSONRPCRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      interface{}     `json:"id,omitempty"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
}

type JSONRPCResponse struct {
	JSONRPC string      `json:"jsonrpc"`
	ID      interface{} `json:"id,omitempty"`
	Result  interface{} `json:"result,omitempty"`
	Error   *RPCError   `json:"error,omitempty"`
}

type RPCError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// MCP-specific types
type Tool struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	InputSchema map[string]interface{} `json:"inputSchema"`
}

type ToolCallParams struct {
	Name      string                 `json:"name"`
	Arguments map[string]interface{} `json:"arguments,omitempty"`
}

type ToolResult struct {
	Content []ContentBlock `json:"content"`
	IsError bool           `json:"isError,omitempty"`
}

type ContentBlock struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

// MCPServer represents the MCP server instance
type MCPServer struct {
	tools map[string]Tool
}

// NewMCPServer creates a new MCP server with registered tools
func NewMCPServer() *MCPServer {
	server := &MCPServer{
		tools: make(map[string]Tool),
	}

	// Register the example tool
	server.registerTool(Tool{
		Name:        "getCurrentTime",
		Description: "Returns the current time in RFC3339 format",
		InputSchema: map[string]interface{}{
			"type":       "object",
			"properties": map[string]interface{}{},
			"required":   []string{},
		},
	})

	return server
}

func (s *MCPServer) registerTool(tool Tool) {
	s.tools[tool.Name] = tool
}

// HandleRequest processes incoming JSON-RPC requests
func (s *MCPServer) HandleRequest(requestJSON string) string {
	var req JSONRPCRequest
	if err := json.Unmarshal([]byte(requestJSON), &req); err != nil {
		return s.errorResponse(nil, -32700, "Parse error", nil)
	}

	switch req.Method {
	case "initialize":
		return s.handleInitialize(req)
	case "tools/list":
		return s.handleToolsList(req)
	case "tools/call":
		return s.handleToolCall(req)
	default:
		return s.errorResponse(req.ID, -32601, "Method not found", nil)
	}
}

func (s *MCPServer) handleInitialize(req JSONRPCRequest) string {
	result := map[string]interface{}{
		"protocolVersion": "2024-11-05",
		"serverInfo": map[string]interface{}{
			"name":    "golang-wasm-mcp-server",
			"version": "1.0.0",
		},
		"capabilities": map[string]interface{}{
			"tools": map[string]interface{}{},
		},
	}

	return s.successResponse(req.ID, result)
}

func (s *MCPServer) handleToolsList(req JSONRPCRequest) string {
	toolsList := make([]Tool, 0, len(s.tools))
	for _, tool := range s.tools {
		toolsList = append(toolsList, tool)
	}

	result := map[string]interface{}{
		"tools": toolsList,
	}

	return s.successResponse(req.ID, result)
}

func (s *MCPServer) handleToolCall(req JSONRPCRequest) string {
	var params ToolCallParams
	if err := json.Unmarshal(req.Params, &params); err != nil {
		return s.errorResponse(req.ID, -32602, "Invalid params", nil)
	}

	// Execute the tool
	switch params.Name {
	case "getCurrentTime":
		currentTime := time.Now().Format(time.RFC3339)
		result := ToolResult{
			Content: []ContentBlock{
				{
					Type: "text",
					Text: currentTime,
				},
			},
			IsError: false,
		}
		return s.successResponse(req.ID, result)
	default:
		return s.errorResponse(req.ID, -32602, fmt.Sprintf("Unknown tool: %s", params.Name), nil)
	}
}

func (s *MCPServer) successResponse(id interface{}, result interface{}) string {
	resp := JSONRPCResponse{
		JSONRPC: "2.0",
		ID:      id,
		Result:  result,
	}

	data, _ := json.Marshal(resp)
	return string(data)
}

func (s *MCPServer) errorResponse(id interface{}, code int, message string, data interface{}) string {
	resp := JSONRPCResponse{
		JSONRPC: "2.0",
		ID:      id,
		Error: &RPCError{
			Code:    code,
			Message: message,
			Data:    data,
		},
	}

	respData, _ := json.Marshal(resp)
	return string(respData)
}

// JavaScript bridge functions
func main() {
	c := make(chan struct{})

	server := NewMCPServer()

	// Expose the handleRequest function to JavaScript
	js.Global().Set("mcpHandleRequest", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 1 {
			return "Error: expected 1 argument (request JSON string)"
		}

		requestJSON := args[0].String()
		response := server.HandleRequest(requestJSON)
		return response
	}))

	// Expose initialization status
	js.Global().Set("mcpServerReady", true)

	fmt.Println("MCP WASM Server initialized and ready")

	<-c // Keep the program running
}
