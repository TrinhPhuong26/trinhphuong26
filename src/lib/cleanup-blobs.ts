import { list, del } from '@vercel/blob';
import prisma from '@/lib/prisma';

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
 * Xóa các blob không còn được sử dụng trong database
 * @returns Thông tin về số lượng blob đã xóa
 */
export async function cleanupUnusedBlobs() {
  try {
    // console.log("Bắt đầu dọn dẹp Blob không sử dụng...");
    
    // Lấy tất cả URL ảnh từ Vercel Blob (limit 1000 để tránh quá nhiều)
    // console.log("Đang lấy danh sách blob từ Vercel...");
    const { blobs } = await list({ limit: 1000 });
    
    // Lọc chỉ lấy các URL từ Vercel Blob có đuôi là hình ảnh
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const blobUrls = blobs
      .filter(blob => {
        const url = blob.url.toLowerCase();
        return imageExtensions.some(ext => url.endsWith(ext));
      })
      .map(blob => blob.url);
    
    // console.log(`Tìm thấy ${blobUrls.length} blob URLs cần kiểm tra...`);
    
    // Lấy tất cả URL ảnh đang được sử dụng từ database
    // console.log("Đang lấy danh sách URL đang được sử dụng từ database...");
    
    const [usedAvatarUrls, usedThumbnailUrls, usedPhotoUrls] = await Promise.all([
      // Avatar URLs từ người dùng
      prisma.user.findMany({
        where: { 
          avatarUrl: { 
            not: null 
          } 
        },
        select: { avatarUrl: true }
      }),
      
      // Thumbnail URLs từ blog
      prisma.blog.findMany({
        where: { 
          thumbnail: { 
            not: null
          } 
        },
        select: { thumbnail: true }
      }),
      
      // Photo URLs từ resume
      prisma.resume.findMany({
        where: { 
          photoUrl: { 
            not: null
          } 
        },
        select: { photoUrl: true }
      })
    ]);
    
    // Lọc các URL từ database để chỉ lấy URL từ Vercel Blob
    const filterBlobUrls = (urls: string[]): string[] => {
      return urls.filter(url => url && isVercelBlobUrl(url));
    };
    
    // Tạo set các URL đang được sử dụng
    const usedUrls = new Set(
      filterBlobUrls([
        ...usedAvatarUrls.map(u => u.avatarUrl),
        ...usedThumbnailUrls.map(b => b.thumbnail),
        ...usedPhotoUrls.map(r => r.photoUrl)
      ].filter(Boolean) as string[])
    );
    
    // console.log(`Tìm thấy ${usedUrls.size} URLs đang được sử dụng trong database`);
    
    // Xác định các ảnh không được sử dụng
    const unusedUrls = blobUrls.filter(url => !usedUrls.has(url));
    // console.log(`Tìm thấy ${unusedUrls.length} URLs không còn được sử dụng, cần xóa`);
    
    // Xóa các ảnh không được sử dụng
    let successCount = 0;
    let failCount = 0;
    
    for (const url of unusedUrls) {
      try {
        // console.log(`Đang xóa blob: ${url}`);
        await del(url);
        successCount++;
        // console.log(`Đã xóa thành công: ${url}`);
      } catch (error) {
        failCount++;
        console.error(`Lỗi khi xóa ${url}:`, error);
      }
    }
    
    // console.log(`Quá trình dọn dẹp hoàn tất: ${successCount} thành công, ${failCount} thất bại`);
    
    return { 
      success: true, 
      totalBlobs: blobUrls.length,
      usedBlobs: usedUrls.size,
      unusedBlobs: unusedUrls.length,
      deletedSuccess: successCount,
      deletedFailed: failCount
    };
  } catch (error) {
    console.error("Lỗi khi dọn dẹp Blob:", error);
    return { success: false, error: String(error) };
  }
} 