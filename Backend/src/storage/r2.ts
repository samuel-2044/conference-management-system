/**
 * Cloudflare R2 storage seam.
 *
 * The current development API intentionally keeps file metadata in memory.
 * Replace the bucket implementation passed to these helpers with the Worker
 * R2 binding when deploying to Cloudflare; callers should only persist the
 * returned object key and public/query URL.
 */
export type StorageFolder =
  | "avatars"
  | "conference-documents"
  | "speaker-images"
  | "id-cards"
  | "certificates";

export interface R2ObjectLike {
  key: string;
  body: ArrayBuffer | ReadableStream<Uint8Array>;
  httpMetadata?: Record<string, string>;
}

export interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer | ReadableStream<Uint8Array>,
    options?: { httpMetadata?: Record<string, string> },
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
  get(key: string): Promise<R2ObjectLike | null>;
}

export async function uploadFile(
  bucket: R2BucketLike,
  folder: StorageFolder,
  fileName: string,
  body: ArrayBuffer | ReadableStream<Uint8Array>,
  contentType: string,
): Promise<string> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `${folder}/${crypto.randomUUID()}-${safeName}`;
  await bucket.put(key, body, { httpMetadata: { "content-type": contentType } });
  return key;
}

export async function deleteFile(bucket: R2BucketLike, key: string): Promise<void> {
  await bucket.delete(key);
}

export function getFileURL(key: string, publicBaseURL: string): string {
  return `${publicBaseURL.replace(/\/$/, "")}/${key}`;
}