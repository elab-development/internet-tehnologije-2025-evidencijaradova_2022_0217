import path from 'path';
import { cloudinary } from '../config/cloudinary.js';

export function uploadToCloudinaryBuffer(buffer, filename, options = {}) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(filename || '').toLowerCase();
    const base = path.basename(filename || 'upload', ext);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || 'truewrite/submits',
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true,
        filename_override: `${base}${ext}`,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer);
  });
}