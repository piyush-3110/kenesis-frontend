/**
 * Pinata IPFS Integration for NFT Metadata
 * Handles uploading course thumbnails and metadata to IPFS via Pinata
 */

export interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface PinataError {
  error: {
    reason: string;
    details: string;
  };
}

/**
 * Upload file to Pinata IPFS
 */
export const uploadFileToPinata = async (
  file: File | Blob,
  filename?: string
): Promise<string> => {
  const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;

  if (!pinataJWT) {
    throw new Error("Pinata JWT not configured");
  }

  const formData = new FormData();
  formData.append("file", file, filename);

  // Optional: Add metadata
  const metadata = JSON.stringify({
    name: filename || "Course NFT Image",
    keyvalues: {
      platform: "Kenesis",
      type: "course-thumbnail",
    },
  });
  formData.append("pinataMetadata", metadata);

  // Optional: Add pin options
  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", options);

  try {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataJWT}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Pinata upload failed: ${
          errorData.error?.reason || response.statusText
        }`
      );
    }

    const result: PinataUploadResponse = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error("Pinata file upload error:", error);
    throw error;
  }
};

/**
 * Upload thumbnail from URL to Pinata
 */
export const uploadThumbnailFromUrl = async (
  thumbnailUrl: string,
  courseId: string
): Promise<string> => {
  try {
    // Fetch the thumbnail image
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch thumbnail: ${response.statusText}`);
    }

    const blob = await response.blob();
    const filename = `course-${courseId}-thumbnail.${
      getFileExtensionFromUrl(thumbnailUrl) || "png"
    }`;

    return await uploadFileToPinata(blob, filename);
  } catch (error) {
    console.error("Thumbnail upload error:", error);
    throw error;
  }
};

/**
 * Upload JSON metadata to Pinata
 */
export const uploadMetadataToPinata = async (
  metadata: Record<string, unknown>,
  courseId: string
): Promise<string> => {
  const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;

  if (!pinataJWT) {
    throw new Error("Pinata JWT not configured");
  }

  const pinataMetadata = {
    name: `Course NFT Metadata - ${courseId}`,
    keyvalues: {
      platform: "Kenesis",
      type: "nft-metadata",
      courseId: courseId,
    },
  };

  const requestBody = {
    pinataContent: metadata,
    pinataMetadata,
    pinataOptions: {
      cidVersion: 0,
    },
  };

  try {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pinataJWT}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Pinata metadata upload failed: ${
          errorData.error?.reason || response.statusText
        }`
      );
    }

    const result: PinataUploadResponse = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error("Pinata metadata upload error:", error);
    throw error;
  }
};

/**
 * Get file extension from URL
 */
const getFileExtensionFromUrl = (url: string): string | null => {
  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split(".").pop();
    return extension && extension.length <= 4 ? extension : null;
  } catch {
    return null;
  }
};

/**
 * Validate Pinata configuration
 */
export const validatePinataConfig = (): boolean => {
  return !!process.env.NEXT_PUBLIC_PINATA_JWT;
};

/**
 * Get IPFS URL from hash
 */
export const getIpfsUrl = (hash: string): string => {
  return `ipfs://${hash}`;
};

/**
 * Get HTTP URL for IPFS content (using Pinata gateway)
 */
export const getHttpUrlFromIpfs = (hash: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};
