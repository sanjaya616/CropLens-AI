import { getFirebaseAdmin } from '../firebase/admin';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const LOCAL_STORAGE_DIR = path.resolve('.storage');
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

export interface StoredImageResult {
  storagePath: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  sanitizedBuffer: Buffer;
}

export class StorageRepository {
  private getBucket() {
    return getFirebaseAdmin().bucket;
  }

  /**
   * Sanitizes an image with sharp (strips EXIF, checks dimensions, re-encodes safely)
   * and saves it to Firebase Storage (or secure local storage fallback).
   */
  async uploadAssessmentImage(
    userId: string,
    assessmentId: string,
    fileName: string,
    originalBuffer: Buffer,
    originalMime: string
  ): Promise<StoredImageResult> {
    // 1. Sanitize image with sharp: strip EXIF (including GPS), resize if excessively large (> 2560px)
    let processed = sharp(originalBuffer).rotate(); // auto-orient based on EXIF before stripping
    const metadata = await processed.metadata();

    if (!metadata.format) {
      throw new Error('Image decoding failed. Corrupted or unsupported image file.');
    }

    // Limit maximum dimensions (max 2560px on longest edge)
    if ((metadata.width && metadata.width > 2560) || (metadata.height && metadata.height > 2560)) {
      processed = processed.resize(2560, 2560, { fit: 'inside', withoutEnlargement: true });
    }

    // Re-encode to remove any embedded malicious payloads or unwanted EXIF
    let outputBuffer: Buffer;
    let targetMime = originalMime;

    if (metadata.format === 'png') {
      outputBuffer = await processed.png({ quality: 90 }).toBuffer();
      targetMime = 'image/png';
    } else if (metadata.format === 'webp') {
      outputBuffer = await processed.webp({ quality: 85 }).toBuffer();
      targetMime = 'image/webp';
    } else {
      outputBuffer = await processed.jpeg({ quality: 85 }).toBuffer();
      targetMime = 'image/jpeg';
    }

    const updatedMeta = await sharp(outputBuffer).metadata();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `users/${userId}/assessments/${assessmentId}/${safeFileName}`;

    // 2. Upload to Firebase Storage bucket if live, otherwise write to secure local storage
    const bucket = this.getBucket();
    if (bucket) {
      try {
        const file = bucket.file(storagePath);
        await file.save(outputBuffer, {
          metadata: {
            contentType: targetMime,
            metadata: {
              uploadedBy: userId,
              assessmentId,
            },
          },
        });
        console.log(`[StorageRepository] Saved to Firebase Storage bucket: ${storagePath}`);
      } catch (err) {
        console.warn(`[StorageRepository] Firebase Storage upload error (${storagePath}), falling back to disk:`, err);
        this.writeLocalFile(storagePath, outputBuffer);
      }
    } else {
      this.writeLocalFile(storagePath, outputBuffer);
    }

    return {
      storagePath,
      mimeType: targetMime,
      fileSize: outputBuffer.length,
      width: updatedMeta.width,
      height: updatedMeta.height,
      sanitizedBuffer: outputBuffer,
    };
  }

  /**
   * Retrieves a private image buffer from Firebase Storage or local fallback.
   */
  async getImageBuffer(storagePath: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const bucket = this.getBucket();
    if (bucket) {
      try {
        const file = bucket.file(storagePath);
        const [exists] = await file.exists();
        if (exists) {
          const [contents] = await file.download();
          const [meta] = await file.getMetadata();
          return {
            buffer: contents,
            mimeType: meta.contentType || 'image/jpeg',
          };
        }
      } catch (err) {
        console.warn(`[StorageRepository] Firebase Storage download error for ${storagePath}:`, err);
      }
    }

    // Local fallback check
    const localPath = path.join(LOCAL_STORAGE_DIR, storagePath);
    if (fs.existsSync(localPath)) {
      const buffer = fs.readFileSync(localPath);
      const ext = path.extname(localPath).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      return { buffer, mimeType };
    }

    return null;
  }

  /**
   * Deletes a private image from Firebase Storage.
   */
  async deleteImage(storagePath: string): Promise<boolean> {
    const bucket = this.getBucket();
    if (bucket) {
      try {
        const file = bucket.file(storagePath);
        const [exists] = await file.exists();
        if (exists) {
          await file.delete();
          console.log(`[StorageRepository] Deleted from Firebase Storage: ${storagePath}`);
        }
      } catch (err) {
        console.warn(`[StorageRepository] Error deleting ${storagePath} from bucket:`, err);
      }
    }

    const localPath = path.join(LOCAL_STORAGE_DIR, storagePath);
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
      } catch {
        // ignore
      }
    }

    return true;
  }

  private writeLocalFile(storagePath: string, buffer: Buffer) {
    const fullPath = path.join(LOCAL_STORAGE_DIR, storagePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, buffer);
  }
}

export const storageRepository = new StorageRepository();
