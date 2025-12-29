export interface FileNode {
  name: string;
  content: string;
}

export interface GeneratedData {
  explanation: string;
  files: FileNode[];
  learn_content: string;
}

export interface AuditRecord {
  id: number;
  name: string;
  status: 'passed' | 'pending' | 'unsubmitted' | 'failed';
  date: string;
  auditor: string;
}
