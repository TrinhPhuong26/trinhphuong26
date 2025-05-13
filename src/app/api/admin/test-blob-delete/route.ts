import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { deleteFromBlobWithRetry } from "@/lib/blob-upload";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    // Chỉ cho phép admin gọi API này
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới có thể thực hiện thao tác này" },
        { status: 401 }
      );
    }

    // Lấy URL để test từ request
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL là bắt buộc" },
        { status: 400 }
      );
    }

    // console.log(`Test xóa Blob với URL: ${url}`);
    
    // Thử xóa URL với nhiều lần retry
    const result = await deleteFromBlobWithRetry(url, 5);
    
    return NextResponse.json({
      success: result,
      message: result 
        ? "Đã xóa thành công URL" 
        : "Không thể xóa URL (có thể URL không hợp lệ hoặc không tồn tại)",
      testedUrl: url
    });
  } catch (error) {
    console.error("Lỗi khi test xóa Vercel Blob:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi test xóa Vercel Blob" },
      { status: 500 }
    );
  }
} 