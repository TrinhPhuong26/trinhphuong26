import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { cleanupUnusedBlobs } from "@/lib/cleanup-blobs";

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

    // Thực hiện dọn dẹp Blob
    const result = await cleanupUnusedBlobs();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Lỗi khi dọn dẹp Vercel Blob:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi dọn dẹp Vercel Blob" },
      { status: 500 }
    );
  }
} 