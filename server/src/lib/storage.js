import crypto from "node:crypto";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import sharp from "sharp";

// Keep memory flat between uploads: the host bills for resident memory, and
// sharp's cache and thread pool would otherwise hold on to it after each image.
sharp.cache(false);
sharp.concurrency(1);

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_FORMATS = ["jpeg", "png", "webp"];
const MAX_EDGE = 1600;
const WEBP_QUALITY = 80;
// Rejects decompression bombs: tiny files that decode into huge bitmaps.
const MAX_INPUT_PIXELS = 50_000_000;
const UPLOAD_EXPIRES_SECONDS = 5 * 60;

/** An expected failure with an HTTP status and a stable error `code` for the client. */
export class StorageError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Created on first use so the server still starts when S3 is not configured.
// Credentials come from AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.
let client;
const s3 = () => (client ??= new S3Client({ region: process.env.AWS_REGION }));
const bucket = () => process.env.S3_BUCKET;
const publicUrl = (key) => `${process.env.S3_PUBLIC_BASE_URL}/${key}`;

// Uploads land in a private staging area; an S3 lifecycle rule deletes anything
// left there, so files that never get attached to a grave clean themselves up.
const pendingPrefix = (userId) => `pending/${userId}/`;
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

/**
 * Issues a presigned POST that lets the browser upload one photo straight to S3.
 * The policy pins the key and content type and caps the size, so S3 itself
 * rejects anything else.
 */
export async function createPhotoUpload(userId, contentType, size) {
  if (!ACCEPTED_TYPES.includes(contentType)) {
    throw new StorageError(415, "UNSUPPORTED_FILE_TYPE", "Unsupported file type.");
  }
  if (!Number.isInteger(size) || size < 1) {
    throw new StorageError(400, "INVALID_UPLOAD", "Invalid file size.");
  }
  if (size > MAX_PHOTO_BYTES) {
    throw new StorageError(413, "FILE_TOO_LARGE", "File is too large.");
  }
  const key = `${pendingPrefix(userId)}${crypto.randomUUID()}`;
  const { url, fields } = await createPresignedPost(s3(), {
    Bucket: bucket(),
    Key: key,
    Conditions: [
      ["content-length-range", 1, MAX_PHOTO_BYTES],
      ["eq", "$Content-Type", contentType],
    ],
    Fields: { "Content-Type": contentType },
    Expires: UPLOAD_EXPIRES_SECONDS,
  });
  return { url, fields, key };
}

/**
 * Turns an uploaded file into a published photo. The client-declared content
 * type is not trusted: the file must decode as a real image. It is then
 * auto-rotated, resized, re-encoded as WebP without metadata (dropping EXIF
 * GPS data), and written under the public `photos/` prefix.
 *
 * Returns the `{ url, key }` entry to store in `Grave.photos`.
 */
export async function processPendingPhoto(userId, key) {
  const ownKey = new RegExp(`^${pendingPrefix(userId)}${UUID}$`);
  if (typeof key !== "string" || !ownKey.test(key)) {
    throw new StorageError(403, "UPLOAD_FORBIDDEN", "This upload does not belong to you.");
  }

  let input;
  try {
    const object = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    input = Buffer.from(await object.Body.transformToByteArray());
  } catch (error) {
    if (error.name === "NoSuchKey") {
      throw new StorageError(400, "UPLOAD_NOT_FOUND", "Upload not found or expired.");
    }
    throw error;
  }
  if (input.length > MAX_PHOTO_BYTES) {
    throw new StorageError(413, "FILE_TOO_LARGE", "File is too large.");
  }

  let output;
  try {
    const image = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS });
    const { format } = await image.metadata();
    if (!ACCEPTED_FORMATS.includes(format)) throw new Error(`Unexpected format: ${format}`);
    output = await image
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch (error) {
    console.error(`Rejected upload ${key}:`, error.message);
    throw new StorageError(422, "INVALID_IMAGE", "The file is not a valid image.");
  }

  const photoKey = `photos/${crypto.randomUUID()}.webp`;
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: photoKey,
      Body: output,
      ContentType: "image/webp",
      // Every photo gets a fresh key, so its content never changes.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  // Best effort: the lifecycle rule removes the staged file if this fails.
  s3()
    .send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }))
    .catch((error) => console.error(`Failed to delete staged upload ${key}:`, error));

  return { url: publicUrl(photoKey), key: photoKey };
}

/**
 * Deletes the S3 objects behind the given photos. Legacy photos (empty key)
 * point elsewhere and are skipped. Failures are logged, never thrown, so a
 * storage hiccup cannot block deleting a grave or an account.
 */
export async function deletePhotos(photos = []) {
  const keys = photos.map((photo) => photo.key).filter(Boolean);
  const results = await Promise.allSettled(
    keys.map((key) => s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }))),
  );
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`Failed to delete photo ${keys[i]}:`, result.reason);
    }
  });
}
