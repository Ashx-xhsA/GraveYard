import axios from 'axios';
import api from '../api';

/** Must match the server's limits; checked here only to fail fast. */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface PhotoUpload {
  url: string;
  fields: Record<string, string>;
  key: string;
}

/**
 * Uploads a photo straight to storage and returns its key, to be sent as
 * `photoKey` when creating a grave. The server verifies and publishes it then.
 */
export async function uploadPhoto(file: File, onProgress?: (percent: number) => void): Promise<string> {
  const { data } = await api.post<PhotoUpload>('/uploads/photo', {
    contentType: file.type,
    size: file.size,
  });

  const form = new FormData();
  Object.entries(data.fields).forEach(([name, value]) => form.append(name, value));
  // S3 ignores every field after `file`, so it must come last.
  form.append('file', file);

  // Plain axios, not `api`: the auth interceptor would send our token to S3.
  await axios.post(data.url, form, {
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return data.key;
}
