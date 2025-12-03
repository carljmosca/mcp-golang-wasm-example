// Example: Adding a new tool to the MCP WASM Server
// This file demonstrates how to add a custom tool

package main

// Step 1: Define your tool in NewMCPServer()
// Add this to the NewMCPServer() function after the getCurrentTime tool:

/*
server.registerTool(Tool{
    Name:        "add",
    Description: "Adds two numbers together",
    InputSchema: map[string]interface{}{
        "type": "object",
        "properties": map[string]interface{}{
            "a": map[string]interface{}{
                "type":        "number",
                "description": "First number to add",
            },
            "b": map[string]interface{}{
                "type":        "number",
                "description": "Second number to add",
            },
        },
        "required": []string{"a", "b"},
    },
})
*/

// Step 2: Implement the tool handler in handleToolCall()
// Add this case to the switch statement in handleToolCall():

/*
case "add":
    // Extract parameters
    a := params.Arguments["a"].(float64)
    b := params.Arguments["b"].(float64)

    // Perform calculation
    sum := a + b

    // Return result
    result := ToolResult{
        Content: []ContentBlock{
            {
                Type: "text",
                Text: fmt.Sprintf("%.2f + %.2f = %.2f", a, b, sum),
            },
        },
        IsError: false,
    }
    return s.successResponse(req.ID, result)
*/

// Step 3: Add a JavaScript function to call your tool (in index.html)
// Add this function to the <script> section:

/*
function callAdd(a, b) {
    sendRequest('tools/call', {
        name: 'add',
        arguments: { a: a, b: b }
    });
}
*/

// Step 4: Add a button to the UI (in index.html)
// Add this to the button-group div:

/*
<button class="btn-primary" onclick="callAdd(5, 3)">
    <span>Call Add Tool (5 + 3)</span>
</button>
*/

// Step 5: Rebuild and test
// Run: make build && make serve
// Then test your new tool in the browser!

// More Complex Example: A tool that fetches data or performs async operations
// Note: In WASM, you can't make HTTP requests directly, but you can:
// 1. Process data passed from JavaScript
// 2. Perform calculations
// 3. Format and transform data
// 4. Validate inputs

/*
server.registerTool(Tool{
    Name:        "formatJSON",
    Description: "Formats and validates JSON data",
    InputSchema: map[string]interface{}{
        "type": "object",
        "properties": map[string]interface{}{
            "data": map[string]interface{}{
                "type":        "string",
                "description": "JSON string to format",
            },
        },
        "required": []string{"data"},
    },
})

// Handler:
case "formatJSON":
    jsonStr := params.Arguments["data"].(string)

    // Validate JSON
    var jsonData interface{}
    if err := json.Unmarshal([]byte(jsonStr), &jsonData); err != nil {
        return s.errorResponse(req.ID, -32602, "Invalid JSON", err.Error())
    }

    // Format it nicely
    formatted, _ := json.MarshalIndent(jsonData, "", "  ")

    result := ToolResult{
        Content: []ContentBlock{
            {
                Type: "text",
                Text: string(formatted),
            },
        },
        IsError: false,
    }
    return s.successResponse(req.ID, result)
*/
