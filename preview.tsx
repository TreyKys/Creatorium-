'use client';

import { Sandpack } from "@codesandbox/sandpack-react";
import { monokaiPro } from "@codesandbox/sandpack-themes";

interface PreviewProps {
  files: { name: string; content: string }[];
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

  if (!sandpackFiles['/App.tsx'] && !sandpackFiles['/index.tsx']) {
     sandpackFiles['/App.tsx'] = `export default function App() { return <div className="p-4 text-white">No frontend code generated yet.</div> }`;
  }

  // --- MOCK ADAPTERS FOR PREVIEW ---
  // Since we are "Production Ready", the generated code imports real wallet adapters.
  // Sandpack won't have access to private/fictional Cedra packages.
  // We inject mock implementations here.

  const mockWalletAdapter = `
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

  // We add these as hidden files in Sandpack
  sandpackFiles['/node_modules/@cedra/wallet-adapter/index.js'] = "export const useWallet = () => { return { connected: false } }; // Placeholder"; 
  sandpackFiles['/node_modules/@cedra/wallet-adapter-react/index.js'] = mockWalletAdapter;

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
                    "/index.html": indexHtml,
                    // Mock the wallet adapter package
                    "/node_modules/@cedra/wallet-adapter-react/package.json": JSON.stringify({ name: "@cedra/wallet-adapter-react", main: "./index.js" }),
                    "/node_modules/@cedra/wallet-adapter-react/index.js": mockWalletAdapter,
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
