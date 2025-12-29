'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code, Play, BookOpen, Download, Cpu, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Forge } from '@/components/forge';
import { Preview } from '@/components/preview';
import { Learn } from '@/components/learn';
import { Audits } from '@/components/audits';
import JSZip from 'jszip';
// import { saveAs } from 'file-saver'; // We need to install file-saver or use a blob hack

// Helper to save file without extra dependency if possible, or we add file-saver
const saveFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export default function CreatoriumLayout() {
  const [activeTab, setActiveTab] = useState<'forge' | 'preview' | 'learn' | 'audits'>('forge');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    explanation: string;
    files: { name: string; content: string }[];
    learn_content: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setActiveTab('forge'); // Switch to forge to see progress

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.error(data.error);
            // Ideally show toast
            alert("Error generating project: " + data.error);
        } else {
            setGeneratedData(data);
        }
    } catch (e) {
        console.error(e);
        alert("Network error");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedData?.files) return;

    const zip = new JSZip();
    
    generatedData.files.forEach(file => {
        zip.file(file.name, file.content);
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveFile(content, "cedra-forge.zip");
  };

  return (
    <div className="flex h-screen w-full flex-col bg-void text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface/50 px-4 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded bg-void border border-border">
            <Cpu className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:inline">
            CREATORIUM <span className="text-xs font-mono text-primary ml-1">v1.0</span>
          </span>
        </div>
        
        <nav className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-border/50">
          <TabButton 
            active={activeTab === 'forge'} 
            onClick={() => setActiveTab('forge')}
            icon={<Terminal className="w-4 h-4" />}
            label="FORGE"
          />
          <TabButton 
            active={activeTab === 'preview'} 
            onClick={() => setActiveTab('preview')}
            icon={<Play className="w-4 h-4" />}
            label="PREVIEW"
          />
          <TabButton 
            active={activeTab === 'learn'} 
            onClick={() => setActiveTab('learn')}
            icon={<BookOpen className="w-4 h-4" />}
            label="LEARN"
          />
           <TabButton 
            active={activeTab === 'audits'} 
            onClick={() => setActiveTab('audits')}
            icon={<ShieldCheck className="w-4 h-4" />}
            label="AUDITS"
          />
        </nav>

        <div className="w-32 flex justify-end">
             {generatedData && (
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold bg-secondary/10 text-secondary border border-secondary/50 hover:bg-secondary/20 transition-all"
                >
                    <Download className="w-3 h-3" />
                    DEPLOY
                </button>
             )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
             {activeTab === 'forge' && (
                <motion.div 
                    key="forge"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full w-full pb-20" // Padding for input bar
                >
                    <Forge 
                        explanation={generatedData?.explanation || ""} 
                        files={generatedData?.files || []} 
                        isGenerating={isGenerating}
                    />
                </motion.div>
             )}
             {activeTab === 'preview' && (
                <motion.div 
                    key="preview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full w-full"
                >
                     <Preview files={generatedData?.files || []} />
                </motion.div>
             )}
             {activeTab === 'learn' && (
                <motion.div 
                    key="learn"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full w-full"
                >
                     <Learn content={generatedData?.learn_content || ""} />
                </motion.div>
             )}
             {activeTab === 'audits' && (
                <motion.div 
                    key="audits"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full w-full"
                >
                     <Audits />
                </motion.div>
             )}
        </AnimatePresence>
      </main>
      
      {/* Floating Input */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
         <div className="relative group">
            <div className={cn(
                "absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-30 transition duration-1000",
                isGenerating ? "opacity-75 animate-pulse" : "group-hover:opacity-75"
            )}></div>
            <div className="relative flex items-center bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="pl-4 text-primary">
                    <span className="font-mono text-xl animate-pulse">›_</span>
                </div>
                <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
                    placeholder={isGenerating ? "Forging your DApp..." : "Describe a Move Smart Contract (e.g., 'Build a prediction market')..."}
                    disabled={isGenerating}
                    className="w-full bg-transparent border-none py-4 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-0 font-mono disabled:opacity-50"
                />
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="p-3 mr-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                    <span className="sr-only">Generate</span>
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                active 
                    ? "bg-surface-highlight text-white shadow-sm border border-border/50" 
                    : "text-gray-500 hover:text-gray-300 hover:bg-surface-highlight/50"
            )}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}
