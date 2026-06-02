import { post, uploadFile } from './api.js';

export function parseBulkImportFile(file, onProgress) {
  const fd = new FormData();
  fd.append('file', file);
  return uploadFile('/bulk-import/parse', fd, onProgress);
}

export function saveBulkImportItems(items, imageOverrides = {}) {
  return post('/bulk-import/save', { items, imageOverrides });
}

export function uploadItemImage(file, onProgress) {
  const fd = new FormData();
  fd.append('image', file);
  return uploadFile('/bulk-import/upload-image', fd, onProgress);
}
