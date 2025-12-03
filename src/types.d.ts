// Type definitions for Go WASM environment

interface Go {
    importObject: WebAssembly.Imports;
    run(instance: WebAssembly.Instance): Promise<void>;
}

declare class Go {
    constructor();
}

declare global {
    interface Window {
        Go: typeof Go;
        mcpServerReady: boolean;
        mcpHandleRequest: (requestJSON: string) => string;
    }

    // Also declare them as global variables for direct access
    var mcpServerReady: boolean;
    function mcpHandleRequest(requestJSON: string): string;
}
