const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() ?? '';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_ROOM_UPLOAD_PRESET?.trim() ?? '';

export const roomPhotoUploadConfigured = /^[a-z0-9-]+$/i.test(cloudName) && Boolean(uploadPreset);
export const roomPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const maxRoomPhotos = 12;
export const maxRoomPhotoBytes = 8 * 1024 * 1024;

export function getRoomPhotoUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((url): url is string =>
    typeof url === 'string' && /^https:\/\/res\.cloudinary\.com\/[a-z0-9-]+\/image\/upload\/[^\s?#]+$/i.test(url)
  ))].slice(0, maxRoomPhotos);
}

export async function uploadRoomPhoto(file: File): Promise<string> {
  if (!roomPhotoUploadConfigured) throw new Error('Cloudinary chưa được cấu hình.');
  if (!roomPhotoTypes.includes(file.type) || file.size === 0 || file.size > maxRoomPhotoBytes) {
    throw new Error('Chọn ảnh JPG, PNG hoặc WebP tối đa 8 MB.');
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', uploadPreset);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(45000),
  });
  const result = await response.json().catch(() => null);
  const [url] = getRoomPhotoUrls([result?.secure_url]);
  if (!response.ok || !url || !url.startsWith(`https://res.cloudinary.com/${cloudName}/image/upload/`)) {
    throw new Error('Cloudinary chưa nhận được ảnh. Vui lòng thử lại.');
  }
  return url;
}
