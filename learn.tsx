'use client';

import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Code2 } from 'lucide-react';

interface LearnProps {
  content: string;
}

export function Learn({ content }: LearnProps) {
  return (
    <div className="h-full w-full overflow-y-auto p-8 max-w-4xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="border-b border-border pb-6">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <BookOpen className="text-primary h-8 w-8" />
                    Cedra Architecture Breakdown
                </h1>
                <p className="text-gray-400 mt-2">
                    Deep dive into the Move concepts and patterns used in this project.
                </p>
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
                {content ? (
                    <div className="whitespace-pre-wrap">{content}</div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
                        <Lightbulb className="w-12 h-12 opacity-50" />
                        <p>Generate a project to unlock the educational breakdown.</p>
                    </div>
                )}
            </div>
            
            {content && (
                <div className="mt-12 p-6 bg-surface-highlight/30 border border-border rounded-lg">
                    <h3 className="text-lg font-semibold text-secondary flex items-center gap-2 mb-2">
                        <Code2 className="w-5 h-5" />
                        Next Steps
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                        <li>Download the project using the Deploy button.</li>
                        <li>Install the Cedra CLI locally.</li>
                        <li>Run <code className="bg-black px-1 py-0.5 rounded text-primary">cedra move build</code> to compile.</li>
                        <li>Deploy to the Cedra Devnet.</li>
                    </ul>
                </div>
            )}
        </motion.div>
    </div>
  );
}
