'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, FileCode, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileTreeProps {
  files: { name: string; content: string }[];
  onSelectFile: (file: { name: string; content: string }) => void;
  selectedFile: string | null;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  content?: string;
}

export function FileTree({ files, onSelectFile, selectedFile }: FileTreeProps) {
  // Build tree structure
  const root: TreeNode[] = [];
  
  files.forEach(file => {
    const parts = file.name.split('/');
    let currentLevel = root;
    
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const path = parts.slice(0, index + 1).join('/');
      
      let node = currentLevel.find(n => n.name === part);
      
      if (!node) {
        node = {
          name: part,
          path,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
          content: isFile ? file.content : undefined
        };
        currentLevel.push(node);
      }
      
      if (!isFile && node.children) {
        currentLevel = node.children;
      }
    });
  });

  // Sort folders first, then files
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
    });
    nodes.forEach(node => {
        if (node.children) sortNodes(node.children);
    });
  };
  sortNodes(root);

  return (
    <div className="w-64 h-full border-r border-border bg-surface/50 p-2 overflow-y-auto font-mono text-sm">
      <div className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Project Files</div>
      {root.map(node => (
        <FileTreeNode 
            key={node.path} 
            node={node} 
            onSelectFile={onSelectFile} 
            selectedFile={selectedFile} 
        />
      ))}
    </div>
  );
}

function FileTreeNode({ node, onSelectFile, selectedFile }: { node: TreeNode, onSelectFile: any, selectedFile: string | null }) {
    const [isOpen, setIsOpen] = useState(true);
    const isSelected = node.path === selectedFile;

    const handleClick = () => {
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            onSelectFile({ name: node.path, content: node.content || '' });
        }
    };

    return (
        <div className="pl-2">
            <div 
                onClick={handleClick}
                className={cn(
                    "flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer select-none transition-colors duration-150",
                    isSelected ? "bg-primary/20 text-primary" : "text-gray-400 hover:text-gray-200 hover:bg-surface-highlight"
                )}
            >
                {node.type === 'folder' && (
                    <span className="text-gray-500">
                        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </span>
                )}
                {node.type === 'folder' ? <Folder className="w-4 h-4 text-blue-400" /> : <FileCode className="w-4 h-4 text-orange-400" />}
                <span className="truncate">{node.name}</span>
            </div>
            
            {node.type === 'folder' && isOpen && node.children && (
                <div className="border-l border-border/50 ml-3.5">
                    {node.children.map(child => (
                        <FileTreeNode 
                            key={child.path} 
                            node={child} 
                            onSelectFile={onSelectFile} 
                            selectedFile={selectedFile} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
