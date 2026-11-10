/**
 * CropLens AI - Secure Storage Repository
 * Handles image sanitization (EXIF stripping, dimension checks, safe re-encoding)
 * and genuine persistence to private Firebase Storage buckets.
 */

import { getFirebaseAdmin } from '../firebase/admin';
import sharp from 'sharp';

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
   * Sanitizes an uploaded photograph using Sharp (stripping EXIF/GPS, enforcing dimension boundaries,
   * safe re-encoding) and uploads to private Firebase Storage.
   * Throws an explicit error if Firebase Storage is unavailable or upload fails.
   */
  async uploadAssessmentImage(
    userId: string,
    assessmentId: string,
    fileName: string,
    originalBuffer: Buffer,
    originalMime: string
  ): Promise<StoredImageResult> {
    if (!originalBuffer || originalBuffer.length === 0) {
      throw new Error('Upload rejected: Empty image buffer.');
    }

    if (originalBuffer.length > 5 * 1024 * 1024) {
      throw new Error('Upload rejected: Image exceeds maximum limit of 5.0 MB.');
    }

    // 1. Sanitize image with sharp: auto-orient, strip EXIF and GPS, enforce pixel limits
    let processed = sharp(originalBuffer, { failOn: 'error' }).rotate();
    const metadata = await processed.metadata();

    if (!metadata.format) {
      throw new Error('Image decoding failed: Unrecognized or corrupted image binary.');
    }

    // Limit maximum dimensions (max 2560px on longest edge)
    if ((metadata.width && metadata.width > 2560) || (metadata.height && metadata.height > 2560)) {
      processed = processed.resize(2560, 2560, { fit: 'inside', withoutEnlargement: true });
    }

    // Safe re-encoding: strips all embedded metadata / GPS and forces clean standardized encoding
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

    // 2. Upload to Firebase Storage bucket
    const bucket = this.getBucket();
    if (!bucket) {
      throw new Error(
        'Firebase Storage bucket is not available. Please ensure FIREBASE_STORAGE_BUCKET is configured in server environment.'
      );
    }

    try {
      const file = bucket.file(storagePath);
      await file.save(outputBuffer, {
        resumable: false,
        metadata: {
          contentType: targetMime,
          cacheControl: 'private, no-transform, max-age=3600',
          metadata: {
            uploadedBy: userId,
            assessmentId,
            sanitizedAt: new Date().toISOString(),
          },
        },
      });
      console.log(`[StorageRepository] Successfully persisted image to Firebase Storage: ${storagePath}`);
    } catch (uploadError: unknown) {
      const msg = uploadError instanceof Error ? uploadError.message : String(uploadError);
      console.error(`[StorageRepository] Upload failed for ${storagePath}:`, msg);
      throw new Error(`Failed to store photograph in cloud storage: ${msg}`);
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
   * Retrieves a private image buffer from Firebase Storage.
   */
  async getImageBuffer(storagePath: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const bucket = this.getBucket();
    if (!bucket) {
      console.error('[StorageRepository] Cannot get image buffer: Firebase Storage bucket is not configured.');
      return null;
    }

    try {
      const file = bucket.file(storagePath);
      const [exists] = await file.exists();
      if (!exists) {
        return null;
      }
      const [contents] = await file.download();
      const [meta] = await file.getMetadata();
      return {
        buffer: contents,
        mimeType: meta.contentType || 'image/jpeg',
      };
    } catch (err: unknown) {
      console.error(`[StorageRepository] Firebase Storage download error for ${storagePath}:`, err);
      return null;
    }
  }

  /**
   * Deletes a private image from Firebase Storage.
   */
  async deleteImage(storagePath: string): Promise<boolean> {
    const bucket = this.getBucket();
    if (!bucket) {
      console.warn(`[StorageRepository] Cannot delete ${storagePath}: Bucket not configured.`);
      return false;
    }

    try {
      const file = bucket.file(storagePath);
      const [exists] = await file.exists();
      if (exists) {
        await file.delete();
        console.log(`[StorageRepository] Deleted private image: ${storagePath}`);
      }
      return true;
    } catch (err: unknown) {
      console.error(`[StorageRepository] Failed to delete ${storagePath} from bucket:`, err);
      return false;
    }
  }

  /**
   * Helper to clean up any orphaned images if an assessment workflow fails midway.
   */
  async cleanUpOrphanedImages(storagePaths: string[]): Promise<void> {
    for (const p of storagePaths) {
      try {
        await this.deleteImage(p);
      } catch (err) {
        console.warn(`[StorageRepository] Failed to cleanup orphaned file ${p}:`, err);
      }
    }
  }
}

export const storageRepository = new StorageRepository();
