import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { deleteFromBlobWithRetry } from "@/lib/blob-upload";
import prisma from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
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
      // console.log(`Tìm thấy avatarUrl cần xóa: ${user.avatarUrl}`);
      const deleteResult = await deleteFromBlobWithRetry(user.avatarUrl, 5);
      // console.log(`Kết quả xóa avatarUrl: ${deleteResult ? 'Thành công' : 'Thất bại'}`);

      // Cập nhật URL avatar trong database thành null
      await prisma.user.update({
        where: { id: session.id },
        data: { avatarUrl: null },
      });

      return NextResponse.json({
        message: "Xóa avatar thành công",
      });
    }

    return NextResponse.json({
      message: "Không có avatar để xóa",
    });
  } catch (error) {
    console.error("Lỗi khi xóa avatar:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa avatar" },
      { status: 500 },
    );
  }
} 