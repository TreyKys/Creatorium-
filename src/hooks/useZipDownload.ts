import JSZip from 'jszip';
import { FileNode } from '@/types';

export function useZipDownload() {
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

  const downloadProject = async (files: FileNode[]) => {
    if (!files || files.length === 0) return;

    const zip = new JSZip();

    files.forEach(file => {
        zip.file(file.name, file.content);
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveFile(content, "cedra-forge.zip");
  };

  return { downloadProject };
}
