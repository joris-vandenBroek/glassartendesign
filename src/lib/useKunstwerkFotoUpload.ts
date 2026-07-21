'use client';

import { useCallback, useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export interface UseKunstwerkFotoUploadResult {
  uploading: boolean;
  error: 'upload' | null;
  upload: (file: File) => Promise<string | null>;
}

export function useKunstwerkFotoUpload(): UseKunstwerkFotoUploadResult {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<'upload' | null>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const fileRef = ref(storage, `kunstwerken/${uniqueId}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch {
      setError('upload');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploading, error, upload };
}
