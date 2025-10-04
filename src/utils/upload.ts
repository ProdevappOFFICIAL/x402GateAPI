import { UTApi } from "uploadthing/server";

const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});

export const uploadFile = async (file: File): Promise<string> => {
  try {
    const response = await utapi.uploadFiles(file);
    
    if (response.error) {
      throw new Error(`Upload failed: ${response.error.message}`);
    }
    
    return response.data.url;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload file');
  }
};

export const deleteFile = async (fileKey: string): Promise<void> => {
  try {
    await utapi.deleteFiles(fileKey);
  } catch (error) {
    console.error('Delete file error:', error);
    throw new Error('Failed to delete file');
  }
};

export const getFileKeyFromUrl = (url: string): string => {
  // Extract file key from UploadThing URL
  // UploadThing URLs typically look like: https://utfs.io/f/{fileKey}
  const parts = url.split('/');
  return parts[parts.length - 1];
};

export { utapi };