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

    // Lấy thông tin người dùng để kiểm tra avatarUrl hiện tại
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { avatarUrl: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 },
      );
    }

    // Xóa avatar cũ nếu có
    if (user.avatarUrl) {
      // console.log(`Tìm thấy avatarUrl cũ cần xóa: ${user.avatarUrl}`);
      const deleteResult = await deleteFromBlobWithRetry(user.avatarUrl, 5);
      // console.log(`Kết quả xóa avatarUrl cũ: ${deleteResult ? 'Thành công' : 'Thất bại'}`);
    }

    // Xử lý form data để lấy file avatar
    const formData = await req.formData();
    const avatarFile = formData.get("avatar") as File;

    if (!avatarFile) {
      return NextResponse.json(
        { error: "Không tìm thấy file avatar" },
        { status: 400 },
      );
    }

    // Kiểm tra loại file
    if (!avatarFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File phải là hình ảnh" },
        { status: 400 },
      );
    }

    // Kiểm tra kích thước file (tối đa 2MB)
    if (avatarFile.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Kích thước file không được vượt quá 2MB" },
        { status: 400 },
      );
    }

    // Upload avatar lên Vercel Blob
    const uploadResult = await uploadToBlob("images/avatars", avatarFile);

    // Cập nhật URL avatar trong database
    await prisma.user.update({
      where: { id: session.id },
      data: { avatarUrl: uploadResult.url },
    });

    return NextResponse.json({
      avatarUrl: uploadResult.url,
      message: "Upload avatar thành công",
    });
  } catch (error) {
    console.error("Lỗi khi upload avatar:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi upload avatar" },
      { status: 500 },
    );
  }
}
