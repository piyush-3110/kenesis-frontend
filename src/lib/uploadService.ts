"use client";

import { http } from "./http/axios";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadControls {
  pause: () => void;
  resume: () => void;
  abort: () => void;
}

export interface UploadState {
  uploadId: string;
  key: string;
  completedParts: Array<{
    PartNumber: number;
    ETag: string;
  }>;
  totalChunks: number;
  uploadedChunks: number;
}

export class UploadService {
  private static readonly CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks
  private static readonly MAX_CONCURRENT_UPLOADS = 6;

  /**
   * Upload a file using multipart upload with progress tracking
   * @param file The file to upload
   * @param folder The folder/category for the upload (e.g., 'course-thumbnails')
   * @param onProgress Callback for progress updates
   * @returns Promise resolving to the final S3 URL and upload controls
   */
  static async uploadFile(
    file: File,
    folder: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ url: string; controls: UploadControls }> {
    const abortController = new AbortController();
    let uploadState: UploadState | null = null;

    const controls: UploadControls = {
      pause: () => {
        abortController.abort();
      },
      resume: async () => {
        if (!uploadState) return;
        return this.resumeUpload(uploadState, file, onProgress, controls);
      },
      abort: () => {
        abortController.abort();
        uploadState = null;
      },
    };

    try {
      // Step 1: Initiate multipart upload
      const { uploadId, key } = await this.initiateUpload(file, folder);

      // Step 2: Calculate chunks
      const chunks = this.createChunks(file);
      uploadState = {
        uploadId,
        key,
        completedParts: [],
        totalChunks: chunks.length,
        uploadedChunks: 0,
      };

      // Step 3: Get presigned URLs for all chunks
      const uploadUrls = await this.getUploadUrls(key, uploadId, chunks.length);

      // Step 4: Upload chunks concurrently
      const results = await this.uploadChunks(
        chunks,
        uploadUrls,
        abortController.signal,
        (bytesUploaded, totalBytes) => {
          uploadState!.uploadedChunks = Math.floor(
            (bytesUploaded / totalBytes) * chunks.length
          );
          if (onProgress) {
            const progress: UploadProgress = {
              loaded: bytesUploaded,
              total: totalBytes,
              percentage: (bytesUploaded / totalBytes) * 100,
            };
            onProgress(progress);
          }
        }
      );

      // Step 5: Complete multipart upload
      const finalUrl = await this.completeUpload(key, uploadId, results);

      return { url: finalUrl, controls };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Upload was paused - save state for resume
        console.log("Upload paused, state saved for resume");
        return { url: "", controls };
      }
      throw error;
    }
  }

  /**
   * Resume a paused upload
   */
  private static async resumeUpload(
    uploadState: UploadState,
    file: File,
    onProgress?: (progress: UploadProgress) => void,
    controls?: UploadControls
  ): Promise<{ url: string; controls: UploadControls }> {
    try {
      const abortController = new AbortController();

      // Calculate remaining chunks
      const chunks = this.createChunks(file);
      const remainingChunks = chunks.filter(
        (_, index) =>
          !uploadState.completedParts.some(
            (part) => part.PartNumber === index + 1
          )
      );

      // Get new presigned URLs for remaining chunks
      const uploadUrls = await this.getUploadUrls(
        uploadState.key,
        uploadState.uploadId,
        remainingChunks.length
      );

      // Upload remaining chunks
      const newResults = await this.uploadChunks(
        remainingChunks,
        uploadUrls,
        abortController.signal,
        (bytesUploaded, totalBytes) => {
          const totalCompleted =
            uploadState.completedParts.length +
            Math.floor((bytesUploaded / totalBytes) * remainingChunks.length);
          if (onProgress) {
            const progress: UploadProgress = {
              loaded: (totalCompleted / chunks.length) * file.size,
              total: file.size,
              percentage: (totalCompleted / chunks.length) * 100,
            };
            onProgress(progress);
          }
        }
      );

      // Combine old and new results
      const allResults = [...uploadState.completedParts, ...newResults];

      // Complete multipart upload
      const finalUrl = await this.completeUpload(
        uploadState.key,
        uploadState.uploadId,
        allResults
      );

      return { url: finalUrl, controls: controls! };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Initiate multipart upload
   */
  private static async initiateUpload(
    file: File,
    folder: string
  ): Promise<{ uploadId: string; key: string }> {
    console.log("🚀 Initiating upload for:", {
      fileName: file.name,
      fileType: file.type,
      folder,
      fileSize: file.size,
    });

    const response = await http.post("/api/uploads/initiate-upload", {
      fileName: file.name,
      fileType: file.type,
      folder,
      fileSize: file.size,
    });

    console.log("📡 Initiate upload response:", response.data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to initiate upload");
    }

    const { uploadId, key } = response.data.data;
    console.log("✅ Upload initiated:", { uploadId, key });

    return { uploadId, key };
  }

  /**
   * Get presigned URLs for chunks
   */
  // Corrected code
  private static async getUploadUrls(
    key: string,
    uploadId: string,
    partCount: number
  ): Promise<string[]> {
    // This function must return Promise<string[]>
    console.log("🔗 Getting upload URLs for:", { key, uploadId, partCount });

    const response = await http.post("/api/uploads/get-upload-urls", {
      key,
      uploadId,
      parts: partCount,
    });

    console.log("📡 Upload URLs response:", response.data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to get upload URLs");
    }

    const urlObjects: Array<{ url: string; partNumber: number }> =
      response.data.data.urls;

    // THE FIX IS HERE: Make sure you are mapping the array to extract the URL string
    const urls = urlObjects.map((obj) => obj.url);

    console.log("🔗 Received URLs:", urls);

    // ... the rest of the function ...
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error("No upload URLs received from server");
    }

    urls.forEach((url, index) => {
      if (typeof url !== "string" || !url.startsWith("http")) {
        console.error(`❌ Invalid URL at index ${index}:`, url);
        throw new Error(`Invalid upload URL received: ${url}`);
      }
    });

    return urls; // Now returns the correct string array
  }

  /**
   * Create file chunks
   */
  private static createChunks(
    file: File
  ): Array<{ data: Blob; partNumber: number }> {
    const chunks: Array<{ data: Blob; partNumber: number }> = [];
    let offset = 0;
    let partNumber = 1;

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + this.CHUNK_SIZE);
      chunks.push({ data: chunk, partNumber });
      offset += this.CHUNK_SIZE;
      partNumber++;
    }

    return chunks;
  }

  /**
   * Upload chunks concurrently to S3 using XMLHttpRequest for real-time progress
   */
  private static async uploadChunks(
    chunks: Array<{ data: Blob; partNumber: number }>,
    urls: string[],
    abortSignal: AbortSignal,
    onProgress?: (bytesUploaded: number, totalBytes: number) => void
  ): Promise<Array<{ PartNumber: number; ETag: string }>> {
    const semaphore = new Semaphore(this.MAX_CONCURRENT_UPLOADS);

    // Calculate total file size from all chunks
    const totalFileSize = chunks.reduce(
      (sum, chunk) => sum + chunk.data.size,
      0
    );

    // Create an array to track the uploaded bytes for each chunk individually
    const chunkProgress = new Array(chunks.length).fill(0);

    const uploadPromises = chunks.map((chunk, index) => {
      return new Promise<{ PartNumber: number; ETag: string }>(
        async (resolve, reject) => {
          await semaphore.acquire();

          try {
            const xhr = new XMLHttpRequest();

            // Reject the promise if the upload is aborted
            abortSignal.addEventListener("abort", () => {
              xhr.abort();
              reject(new DOMException("Aborted", "AbortError"));
            });

            // Track real-time progress of the individual chunk
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                chunkProgress[index] = event.loaded;
                // Calculate the total progress by summing up the progress of all chunks
                const totalUploadedBytes = chunkProgress.reduce(
                  (sum, loaded) => sum + loaded,
                  0
                );
                if (onProgress) {
                  onProgress(totalUploadedBytes, totalFileSize);
                }
              }
            };

            // Handle successful upload
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const etag = xhr.getResponseHeader("ETag");
                if (!etag) {
                  reject(
                    new Error(`No ETag received for chunk ${chunk.partNumber}`)
                  );
                  return;
                }
                // Ensure the final progress for this chunk is its full size
                chunkProgress[index] = chunk.data.size;
                const totalUploadedBytes = chunkProgress.reduce(
                  (sum, loaded) => sum + loaded,
                  0
                );
                if (onProgress) {
                  onProgress(totalUploadedBytes, totalFileSize);
                }
                resolve({ PartNumber: chunk.partNumber, ETag: etag });
              } else {
                reject(
                  new Error(
                    `Failed to upload chunk ${chunk.partNumber}: ${xhr.status} ${xhr.statusText}`
                  )
                );
              }
            };

            // Handle errors
            xhr.onerror = () => {
              reject(
                new Error(
                  `Network error during upload of chunk ${chunk.partNumber}`
                )
              );
            };

            xhr.onabort = () => {
              reject(new DOMException("Aborted", "AbortError"));
            };

            // Open and send the request
            xhr.open("PUT", urls[index]);
            xhr.send(chunk.data);
          } catch (error) {
            reject(error);
          } finally {
            semaphore.release();
          }
        }
      );
    });

    const results = await Promise.all(uploadPromises);
    return results.sort((a, b) => a.PartNumber - b.PartNumber);
  }

  /**
   * Complete multipart upload
   */
  private static async completeUpload(
    key: string,
    uploadId: string,
    parts: Array<{ PartNumber: number; ETag: string }>
  ): Promise<string> {
    console.log("🏁 Completing upload:", { key, uploadId, parts });

    const response = await http.post("/api/uploads/complete-upload", {
      key,
      uploadId,
      parts,
    });

    console.log("📡 Complete upload response:", response.data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to complete upload");
    }

    const location = response.data.data.location;
    console.log("✅ Upload completed, final URL:", location);

    return location;
  }
}

/**
 * Semaphore for controlling concurrent uploads
 */
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      this.permits--;
      resolve();
    }
  }
}

// Export convenience functions
export const uploadFile = UploadService.uploadFile.bind(UploadService);
