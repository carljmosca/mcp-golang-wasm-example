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
    }
};

(window as any).callGetCurrentTime = function (): void {
    sendRequest('tools/call', {
        name: 'getCurrentTime',
        arguments: {}
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
                if (callBtn) callBtn.disabled = false;

                displayOutput('MCP Server is ready. Click "Initialize Server" to begin.');
            }
        }, 100);
    })
    .catch((err) => {
        console.error('Failed to load WASM:', err);
        updateStatus('error', 'Failed to load WASM');
        displayOutput('Error loading WASM: ' + err.message);
    });
