'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import { FileTree } from './file-tree';
import { motion } from 'framer-motion';

interface ForgeProps {
  explanation: string;
  files: { name: string; content: string }[];
  isGenerating: boolean;
}

export function Forge({ explanation, files, isGenerating }: ForgeProps) {
  const [selectedFile, setSelectedFile] = useState<{ name: string; content: string } | null>(
    files.length > 0 ? files[0] : null
  );

  // Auto-select first file when generation finishes if nothing selected
  if (!selectedFile && files.length > 0) {
    setSelectedFile(files[0]);
  }

  // Update selected content if file matches (for streaming updates)
  const activeContent = files.find(f => f.name === selectedFile?.name)?.content || selectedFile?.content || "";

  return (
    <div className="flex h-full w-full">
      {/* Left Panel: Reasoning & Explanation */}
      <div className="w-1/3 min-w-[300px] border-r border-border flex flex-col bg-surface/30">
        <div className="p-4 border-b border-border bg-surface-highlight/20">
            <h2 className="text-sm font-bold text-primary tracking-widest uppercase flex items-center gap-2">
                {isGenerating && <Loader2 className="w-3 h-3 animate-spin" />}
                Architect Intelligence
            </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 prose prose-invert prose-sm max-w-none">
            {explanation ? (
                <div className="whitespace-pre-wrap">{explanation}</div>
            ) : (
                <div className="text-gray-600 italic">Waiting for input...</div>
            )}
            {isGenerating && (
                <div className="mt-4 flex items-center gap-2 text-primary/70 animate-pulse text-xs">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Thinking...
                </div>
            )}
        </div>
      </div>

      {/* Right Panel: File Tree & Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex overflow-hidden">
             {/* File Tree */}
             <FileTree 
                files={files} 
                onSelectFile={setSelectedFile} 
                selectedFile={selectedFile?.name || null} 
             />

             {/* Monaco Editor */}
             <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                {selectedFile ? (
                    <>
                        <div className="h-8 bg-surface-highlight flex items-center px-4 text-xs text-gray-400 border-b border-black">
                            {selectedFile.name}
                        </div>
                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                defaultLanguage={selectedFile.name.endsWith('.move') ? 'rust' : 'typescript'} // approximate move with rust
                                language={selectedFile.name.endsWith('.move') ? 'rust' : (selectedFile.name.endsWith('.json') || selectedFile.name.endsWith('.toml') ? 'yaml' : 'typescript')}
                                value={activeContent}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    fontFamily: 'var(--font-mono)',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 16 }
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-600">
                        Select a file to view code
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
}
