'use client';

import { FileCode, ChevronRight, ChevronDown, FileJson, FileType } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FileNode } from '@/types';

interface FileTreeProps {
  files: FileNode[];
  onSelectFile: (file: FileNode) => void;
  selectedFile: string | null;
}

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  content?: string;
  path: string;
}

export function FileTree({ files, onSelectFile, selectedFile }: FileTreeProps) {
  // Build tree from flat file list
  const tree: TreeNode[] = [];

  files.forEach(file => {
    const parts = file.name.split('/');
    let currentLevel = tree;
    let currentPath = '';

    parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isFile = index === parts.length - 1;

        const existingNode = currentLevel.find(node => node.name === part);

        if (existingNode) {
            if (isFile) {
                // Should not happen ideally if paths are unique
                existingNode.content = file.content;
            } else {
                currentLevel = existingNode.children!;
            }
        } else {
            const newNode: TreeNode = {
                name: part,
                type: isFile ? 'file' : 'folder',
                path: currentPath,
                ...(isFile ? { content: file.content } : { children: [] })
            };
            currentLevel.push(newNode);
            if (!isFile) {
                currentLevel = newNode.children!;
            }
        }
    });
  });

  // Sort: folders first, then files
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
    });
    nodes.forEach(node => {
        if (node.children) sortNodes(node.children);
    });
  };
  sortNodes(tree);

  return (
    <div className="w-64 bg-[#181818] border-r border-black flex flex-col font-mono text-sm overflow-y-auto">
        <div className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-black/50">
            Explorer
        </div>
        <div className="p-2">
            {tree.map(node => (
                <TreeNodeItem
                    key={node.path}
                    node={node}
                    onSelectFile={onSelectFile}
                    selectedPath={selectedFile}
                    depth={0}
                    allFiles={files}
                />
            ))}
        </div>
    </div>
  );
}

function TreeNodeItem({ node, onSelectFile, selectedPath, depth, allFiles }: {
    node: TreeNode,
    onSelectFile: (f: FileNode) => void,
    selectedPath: string | null,
    depth: number,
    allFiles: FileNode[]
}) {
    const [isOpen, setIsOpen] = useState(true);

    const isSelected = node.path === selectedPath;

    const handleClick = () => {
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            // Reconstruct file object
            onSelectFile({ name: node.path, content: node.content || "" });
        }
    };

    const getIcon = () => {
        if (node.type === 'folder') return isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />;
        if (node.name.endsWith('.move')) return <FileCode className="w-3 h-3 text-secondary" />;
        if (node.name.endsWith('.tsx') || node.name.endsWith('.ts')) return <FileCode className="w-3 h-3 text-blue-400" />;
        if (node.name.endsWith('.json')) return <FileJson className="w-3 h-3 text-yellow-400" />;
        return <FileType className="w-3 h-3 text-gray-400" />;
    };

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer hover:bg-white/5 transition-colors select-none",
                    isSelected && "bg-primary/20 text-primary"
                )}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={handleClick}
            >
                <span className="opacity-70">{getIcon()}</span>
                <span className={cn("truncate", isSelected && "font-bold")}>{node.name}</span>
            </div>
            {node.type === 'folder' && isOpen && node.children && (
                <div>
                    {node.children.map(child => (
                        <TreeNodeItem
                            key={child.path}
                            node={child}
                            onSelectFile={onSelectFile}
                            selectedPath={selectedPath}
                            depth={depth + 1}
                            allFiles={allFiles}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
