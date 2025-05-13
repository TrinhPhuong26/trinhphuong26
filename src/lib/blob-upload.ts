import { put, del, list } from '@vercel/blob';
import { randomUUID } from "crypto";
import path from "path";

interface BlobUploadResult {
  url: string;
  path: string;
  filename: string;
}

/**
 * Kiểm tra URL có phải từ Vercel Blob không
 * @param url URL cần kiểm tra
 * @returns true nếu URL từ Vercel Blob, ngược lại false
 */
function isVercelBlobUrl(url: string): boolean {
  // Các dạng URL có thể gặp từ Vercel Blob
  const blobPatterns = [
    'vercel-blob.com',
    'public.blob.vercel-storage.com',
    'blob.vercel-storage.com',
    '.public.blob.vercel-storage'
  ];
  
  return blobPatterns.some(pattern => url.includes(pattern));
}

/**
 * Upload một file lên Vercel Blob
 * @param folderPath Đường dẫn thư mục, ví dụ: "images/avatars"
 * @param file File cần upload
 * @returns Thông tin về file đã upload
 */
export async function uploadToBlob(
  folderPath: string,
  file: File,
): Promise<BlobUploadResult> {
  try {
    const uniqueFilename = generateUniqueFilename(file.name);
    // Tạo đường dẫn đầy đủ với folder path
    const fullPath = `${folderPath}/${uniqueFilename}`;
    
    // Upload file lên Vercel Blob
    const blob = await put(fullPath, file, {
      access: 'public',
    });

    // console.log(`Đã upload thành công file "${fullPath}" lên Vercel Blob: ${blob.url}`);

    return {
      url: blob.url,
      path: fullPath,
      filename: uniqueFilename,
    };
  } catch (error) {
    console.error("Lỗi khi upload lên Vercel Blob:", error);
    throw error;
  }
}

/**
 * Xóa một file từ Vercel Blob
 * @param url URL của file cần xóa 
 * @returns true nếu xóa thành công, ngược lại false
 */
export async function deleteFromBlob(url: string): Promise<boolean> {
  try {
    if (!url) {
      // console.log("Bỏ qua xóa: URL ảnh trống");
      return false;
    }

    // Kiểm tra nếu URL thuộc Vercel Blob
    if (!isVercelBlobUrl(url)) {
      // console.log(`Bỏ qua xóa: URL không phải từ Vercel Blob: ${url}`);
      return false;
    }

    // console.log(`Đang xóa file từ Vercel Blob: ${url}`);
    await del(url);
    // console.log(`Đã xóa thành công file từ Vercel Blob: ${url}`);
    return true;
  } catch (error) {
    console.error(`Lỗi khi xóa file từ Vercel Blob (${url}):`, error);
    return false;
  }
}

/**
 * Xóa một file từ Vercel Blob với retry
 * @param url URL của file cần xóa
 * @param retries Số lần thử lại
 * @returns true nếu xóa thành công, ngược lại false
 */
export async function deleteFromBlobWithRetry(url: string, retries = 3): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (!url) {
        // console.log("Bỏ qua xóa: URL ảnh trống");
        return false;
      }

      // Kiểm tra nếu URL thuộc Vercel Blob
      if (!isVercelBlobUrl(url)) {
        // console.log(`Bỏ qua xóa: URL không phải từ Vercel Blob: ${url}`);
        return false;
      }

      // console.log(`Đang xóa file từ Vercel Blob (lần thử ${attempt + 1}/${retries}): ${url}`);
      await del(url);
      // console.log(`Đã xóa thành công file từ Vercel Blob: ${url}`);
      return true;
    } catch (error) {
      console.error(`Lỗi lần ${attempt + 1}/${retries} khi xóa file từ Vercel Blob (${url}):`, error);
      
      if (attempt < retries - 1) {
        // Chờ trước khi thử lại (1 giây, 2 giây, 3 giây...)
        const waitTime = (attempt + 1) * 1000;
        // console.log(`Chờ ${waitTime}ms trước khi thử lại...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.error(`Không thể xóa file từ Vercel Blob sau ${retries} lần thử: ${url}`);
  return false;
}

/**
 * Tạo tên file duy nhất để tránh trùng lặp
 * @param originalFilename Tên file gốc
 * @returns Tên file duy nhất
 */
function generateUniqueFilename(originalFilename: string): string {
  const extension = path.extname(originalFilename);
  const baseName = path.basename(originalFilename, extension);
  const timestamp = Date.now();
  const uniqueId = randomUUID().substring(0, 8);

  return `${baseName}-${timestamp}-${uniqueId}${extension}`;
} 