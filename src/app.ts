/// <reference path="./types.d.ts" />

let requestId = 1;

function updateStatus(status: string, message: string): void {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;

    statusEl.className = `status-badge ${status}`;
    statusEl.innerHTML = `
        <span class="status-indicator"></span>
        <span>${message}</span>
    `;
}

function formatJSON(obj: any): string {
    return JSON.stringify(obj, null, 2)
        .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>');
}

function displayOutput(data: any): void {
    const output = document.getElementById('output');
    if (!output) return;

    if (typeof data === 'object') {
        output.innerHTML = formatJSON(data);
    } else {
        output.textContent = String(data);
    }
}

function sendRequest(method: string, params: any = null): any {
    const request: any = {
        jsonrpc: "2.0",
        id: requestId++,
        method: method
    };

    if (params) {
        request.params = params;
    }

    const requestJSON = JSON.stringify(request);
    console.log('Sending request:', requestJSON);

    const responseJSON = (window as any).mcpHandleRequest(requestJSON);
    console.log('Received response:', responseJSON);

    const response = JSON.parse(responseJSON);
    displayOutput(response);

    return response;
}

// Export functions to window so they can be called from HTML
(window as any).initializeServer = function (): void {
    const response = sendRequest('initialize', {
        protocolVersion: "2024-11-05",
        clientInfo: {
            name: "web-client",
            version: "1.0.0"
        }
    });

    if (response.result) {
        const protocolVersionEl = document.getElementById('protocol-version');
        const serverNameEl = document.getElementById('server-name');
        const serverVersionEl = document.getElementById('server-version');

        if (protocolVersionEl) protocolVersionEl.textContent = response.result.protocolVersion;
        if (serverNameEl) serverNameEl.textContent = response.result.serverInfo.name;
        if (serverVersionEl) serverVersionEl.textContent = response.result.serverInfo.version;

        // Auto-list tools after initialization
        setTimeout((window as any).listTools, 500);
    }
};

(window as any).listTools = function (): void {
    const response = sendRequest('tools/list');

    if (response.result && response.result.tools) {
        const tools = response.result.tools;
        const toolCountEl = document.getElementById('tool-count');
        if (toolCountEl) toolCountEl.textContent = tools.length;

        const toolsList = document.getElementById('tools-list');
        if (toolsList) {
            toolsList.innerHTML = tools.map((tool: any) => `
                <div class="info-item" style="margin-bottom: 1rem;">
                    <div class="info-label">${tool.name}</div>
                    <div style="color: var(--text-secondary); margin-top: 0.5rem;">
                        ${tool.description}
                    </div>
                    <div class="code-block" style="margin-top: 0.5rem;">
                        ${JSON.stringify(tool.inputSchema, null, 2)}
                    </div>
                </div>
            `).join('');
        }

        // Populate tool dropdown
        const toolSelect = document.getElementById('toolSelect') as HTMLSelectElement;
        if (toolSelect) {
            toolSelect.innerHTML = tools.map((tool: any) => `<option value="${tool.name}">${tool.name}</option>`).join('');
            toolSelect.disabled = false;
        }
        // Enable parameter input and call button
        const toolParams = document.getElementById('toolParams') as HTMLInputElement;
        const callToolBtn = document.getElementById('callToolBtn') as HTMLButtonElement;
        if (toolParams) toolParams.disabled = false;
        if (callToolBtn) callToolBtn.disabled = false;
        // Store tools for later use
        (window as any).availableTools = tools;
    }
};


// Call selected tool with parameters
(window as any).callSelectedTool = function (): void {
    const toolSelect = document.getElementById('toolSelect') as HTMLSelectElement;
    const toolParams = document.getElementById('toolParams') as HTMLInputElement;
    if (!toolSelect || !toolParams) return;

    const selectedTool = toolSelect.value;
    const paramInput = toolParams.value.trim();
    const tools = (window as any).availableTools || [];
    const toolDef = tools.find((t: any) => t.name === selectedTool);

    let args: any = {};
    if (toolDef && toolDef.inputSchema && toolDef.inputSchema.properties) {
        const paramNames = Object.keys(toolDef.inputSchema.properties);
        const paramValues = paramInput.length > 0 ? paramInput.split(/\s+/) : [];
        paramNames.forEach((name, idx) => {
            let val = paramValues[idx];
            // Try to convert to number if schema says so
            if (toolDef.inputSchema.properties[name].type === "number" && val !== undefined) {
                const numVal = Number(val);
                args[name] = isNaN(numVal) ? val : numVal;
            } else if (val !== undefined) {
                args[name] = val;
            }
        });
    }

    sendRequest('tools/call', {
        name: selectedTool,
        arguments: args
    });
};

// Load WASM
const go = new Go();
WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject)
    .then((result) => {
        go.run(result.instance);

        // Wait for server to be ready
        const checkReady = setInterval(() => {
            if ((window as any).mcpServerReady) {
                clearInterval(checkReady);
                updateStatus('ready', 'Server Ready');

                // Enable buttons
                const initBtn = document.getElementById('initBtn') as HTMLButtonElement;
                const listBtn = document.getElementById('listBtn') as HTMLButtonElement;
                const callBtn = document.getElementById('callBtn') as HTMLButtonElement;

                if (initBtn) initBtn.disabled = false;
                if (listBtn) listBtn.disabled = false;
                displayOutput('MCP Server is ready. Click "Initialize Server" to begin.');
            }
        }, 100);
    })
    .catch((err) => {
        console.error('Failed to load WASM:', err);
        updateStatus('error', 'Failed to load WASM');
        displayOutput('Error loading WASM: ' + err.message);
    });
