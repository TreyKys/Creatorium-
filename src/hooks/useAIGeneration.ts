import { useState } from 'react';
import { GeneratedData } from '@/types';
import { generateProject } from '@/services/ai';

export function useAIGeneration() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
        const data = await generateProject(prompt);
        setGeneratedData(data);
    } catch (e: unknown) {
        console.error(e);
        let errorMessage = "Unknown error";
        if (e instanceof Error) {
            errorMessage = e.message;
        } else if (typeof e === 'string') {
            errorMessage = e;
        }
        alert("Error generating project: " + errorMessage);
    } finally {
        setIsGenerating(false);
    }
  };

  return {
    prompt,
    setPrompt,
    isGenerating,
    generatedData,
    generate
  };
}
