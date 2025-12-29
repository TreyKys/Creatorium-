'use client';

import { Sandpack } from "@codesandbox/sandpack-react";
import { monokaiPro } from "@codesandbox/sandpack-themes";
import { FileNode } from '@/types';

interface PreviewProps {
  files: FileNode[];
}

export function Preview({ files }: PreviewProps) {
  // Filter for frontend files and transform to Sandpack format
  const sandpackFiles = files.reduce((acc, file) => {
    if (file.name.startsWith('frontend/')) {
        const cleanName = file.name.replace('frontend/', '');
        const path = cleanName.startsWith('/') ? cleanName : `/${cleanName}`;
        acc[path] = file.content;
    }
    return acc;
  }, {} as Record<string, string>);

  if (!sandpackFiles['/App.tsx']) {
     sandpackFiles['/App.tsx'] = `export default function App() { return <div className="p-4 text-white">No frontend code generated yet.</div> }`;
  }

  // Explicitly set the entry point to ensure our App is mounted
  const indexTsx = `
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;

  const indexCss = `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #0a0a0a;
  color: #ffffff;
}
`;

  // --- MOCK ADAPTERS FOR PREVIEW ---
  // Since we are "Production Ready", the generated code imports real wallet adapters.
  // Sandpack won't have access to private/fictional Cedra packages.
  // We inject mock implementations here.

  const mockWalletAdapterReact = `
    import React, { createContext, useContext, useState } from 'react';

    const WalletContext = createContext({ connected: false, connect: () => {}, disconnect: () => {}, account: null });

    export const useWallet = () => useContext(WalletContext);

    export const WalletProvider = ({ children }) => {
      const [connected, setConnected] = useState(false);
      const [account, setAccount] = useState(null);

      const connect = () => {
        setConnected(true);
        setAccount({ address: '0x123...MockWallet' });
      };

      const disconnect = () => {
        setConnected(false);
        setAccount(null);
      };

      return (
        <WalletContext.Provider value={{ connected, connect, disconnect, account }}>
          {children}
        </WalletContext.Provider>
      );
    };
  `;

  const mockWalletAdapterBase = `
    export const Adapter = class { constructor(name) { this.name = name; } };
  `;

  // --------------------------------

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
               void: '#030303',
               surface: '#0a0a0a',
               primary: '#00f0ff',
               secondary: '#ff4d00',
            }
          }
        }
      }
    </script>
  </head>
  <body class="bg-void text-white">
    <div id="root"></div>
  </body>
</html>`;

  return (
    <div className="h-full w-full flex flex-col bg-surface">
        <div className="flex-1 overflow-hidden p-4">
            <Sandpack 
                template="react-ts"
                theme={monokaiPro}
                files={{
                    ...sandpackFiles,
                    "/index.tsx": indexTsx, // Force entry point
                    "/index.css": indexCss, // Basic styles
                    "/index.html": indexHtml,

                    // Mock @cedra/wallet-adapter-react
                    "/node_modules/@cedra/wallet-adapter-react/package.json": JSON.stringify({ name: "@cedra/wallet-adapter-react", main: "./index.js" }),
                    "/node_modules/@cedra/wallet-adapter-react/index.js": mockWalletAdapterReact,

                    // Mock @cedra/wallet-adapter (base)
                    "/node_modules/@cedra/wallet-adapter/package.json": JSON.stringify({ name: "@cedra/wallet-adapter", main: "./index.js" }),
                    "/node_modules/@cedra/wallet-adapter/index.js": mockWalletAdapterBase,
                }}
                options={{
                    externalResources: ["https://cdn.tailwindcss.com"],
                    showNavigator: true,
                    showTabs: false, 
                    editorHeight: "100%", 
                    showLineNumbers: true,
                }}
                customSetup={{
                    dependencies: {
                        "lucide-react": "latest",
                        "framer-motion": "latest",
                        "clsx": "latest",
                        "tailwind-merge": "latest"
                    }
                }}
            />
        </div>
    </div>
  );
}
