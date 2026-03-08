import { createClient } from '@/api/api.client';

const client = createClient({ baseURL: import.meta.env.VITE_NUTRITION_API_URL });

type TranscribeResponse = string | { text?: string };

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    // The backend expects 'file' as the key
    formData.append('file', audioBlob, 'recording.webm'); 

    const { data } = await client.post<TranscribeResponse>(
        '/v1/consultation/transcribe',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    if (typeof data === 'string') {
        return data;
    }

    if (typeof data?.text === 'string') {
        return data.text;
    }

    return '';
};
