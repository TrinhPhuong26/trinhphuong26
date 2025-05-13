import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { deleteFromBlobWithRetry, uploadToBlob } from "@/lib/blob-upload";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    // Xử lý form data để lấy file thumbnail và blogId (nếu có)
    const formData = await req.formData();
    const thumbnailFile = formData.get("thumbnail") as File;
    // Lấy blogId nếu có - để xóa ảnh cũ
    const blogId = formData.get("blogId") as string | null;

    if (!thumbnailFile) {
      return NextResponse.json(
        { error: "Không tìm thấy file hình ảnh" },
        { status: 400 },
      );
    }

    // Kiểm tra loại file
    if (!thumbnailFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File phải là hình ảnh" },
        { status: 400 },
      );
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    if (thumbnailFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Kích thước file không được vượt quá 5MB" },
        { status: 400 },
      );
    }

    // Nếu có blogId, kiểm tra và xóa thumbnail cũ
    if (blogId) {
      try {
        const existingBlog = await prisma.blog.findUnique({
          where: { id: blogId },
          select: { thumbnail: true },
        });

        if (existingBlog?.thumbnail) {
          // console.log(`Chuẩn bị xóa thumbnail cũ của blog ${blogId}: ${existingBlog.thumbnail}`);
          await deleteFromBlobWithRetry(existingBlog.thumbnail);
        }
      } catch (error) {
        console.error("Lỗi khi xóa thumbnail cũ:", error);
        // Tiếp tục xử lý ngay cả khi xóa thumbnail cũ thất bại
      }
    }

    // Upload thumbnail lên Vercel Blob
    const uploadResult = await uploadToBlob(
      "images/blog-thumbnails",
      thumbnailFile,
    );

    return NextResponse.json({
      thumbnailUrl: uploadResult.url,
      message: "Upload hình ảnh thành công",
    });
  } catch (error) {
    console.error("Lỗi khi upload hình ảnh:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi upload hình ảnh" },
      { status: 500 },
    );
  }
}
