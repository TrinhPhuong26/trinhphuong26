import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { promises as fsPromises } from "fs";

interface FileUploadResult {
  url: string;
  path: string;
  filename: string;
}

/**
 * Upload một file vào thư mục public
 * @param folderPath Đường dẫn thư mục trong public, ví dụ: "images/avatars"
 * @param file File cần upload
 * @returns Thông tin về file đã upload
 */
export async function uploadFile(
  folderPath: string,
  file: File,
): Promise<FileUploadResult> {
  const uniqueFilename = generateUniqueFilename(file.name);
  const uploadPath = `public/${folderPath}`;

  // Đảm bảo thư mục tồn tại
  await ensureDirectoryExists(uploadPath);

  // Đường dẫn đầy đủ của file
  const filePath = path.join(uploadPath, uniqueFilename);

  // Chuyển đổi File thành ArrayBuffer và lưu vào hệ thống tệp
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fsPromises.writeFile(filePath, buffer);

  return {
    url: `/${folderPath}/${uniqueFilename}`,
    path: filePath,
    filename: uniqueFilename,
  };
}

/**
 * Xóa một file từ thư mục public
 * @param fileUrl URL của file cần xóa, ví dụ: "/images/avatars/abc123.jpg"
 * @returns true nếu xóa thành công, ngược lại false
 */
export async function deleteFile(fileUrl: string): Promise<boolean> {
  try {
    if (!fileUrl || fileUrl.startsWith("http")) {
      // Không xử lý URLs bên ngoài hoặc null/undefined
      return false;
    }

    // Loại bỏ tất cả ký tự '/' ở đầu URL
    const normalizedUrl = fileUrl.replace(/^\/+/, "");

    // Tạo đường dẫn đầy đủ
    const filePath = path.join("public", normalizedUrl);

    // Kiểm tra file tồn tại
    if (!fs.existsSync(filePath)) {
      console.warn(`File không tồn tại: ${filePath}`);
      return false;
    }

    // Xóa file
    await fsPromises.unlink(filePath);
    return true;
  } catch (error) {
    console.error("Lỗi khi xóa file:", error);
    return false;
  }
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

/**
 * Đảm bảo thư mục tồn tại, nếu không thì tạo mới
 * @param dirPath Đường dẫn thư mục cần kiểm tra
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fsPromises.access(dirPath);
  } catch {
    // Thư mục không tồn tại, tạo mới
    await fsPromises.mkdir(dirPath, { recursive: true });
  }
}
