import { GeneratedData } from '@/types';

export const generateProject = async (prompt: string): Promise<GeneratedData> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error);
    }

    return data;
};
