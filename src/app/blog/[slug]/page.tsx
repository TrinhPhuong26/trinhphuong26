"use client";

import { useState, useEffect, Suspense, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Calendar, User } from "lucide-react";

// Định nghĩa interface cho blog
interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string | null;
  excerpt: string | null;
  publishedAt: string | null;
  author: {
    firstName: string | null;
    lastName: string | null;
  };
}

// Định nghĩa kiểu cho params
interface PageParams {
  slug: string;
}

// Component chính để hiển thị chi tiết blog
export default function BlogDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <BlogDetail params={params} />
    </Suspense>
  );
}

// Component con để xử lý logic và hiển thị
function BlogDetail({ params }: { params: Promise<PageParams> }) {
  // Sử dụng React.use để unwrap params theo cách mới nhất của Next.js
  const unwrappedParams = use(params);
  const { slug } = unwrappedParams;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lấy chi tiết blog sử dụng Fetch API
  useEffect(() => {
    let isMounted = true;

    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${slug}`);

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Bài viết không tồn tại hoặc đã bị xóa"
              : "Đã có lỗi xảy ra khi tải bài viết",
          );
        }

        const data = await response.json();

        // Chỉ cập nhật state nếu component vẫn được mount
        if (isMounted) {
          setBlog(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);

        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Đã có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau.",
          );
          setLoading(false);
        }
      }
    };

    fetchBlog();

    // Cleanup function để tránh memory leak và setState trên unmounted component
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Format tên tác giả
  const formatAuthorName = (author?: {
    firstName: string | null;
    lastName: string | null;
  }) => {
    if (!author) return "Admin";
    if (author.firstName || author.lastName) {
      return `${author.firstName || ""} ${author.lastName || ""}`.trim();
    }
    return "Admin";
  };

  // Format ngày
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Hiển thị loading state
  if (loading) {
    return <BlogSkeleton />;
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto w-full max-w-4xl px-3 md:px-4 lg:px-6">
          <main className="py-10">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h1 className="mb-4 text-2xl font-bold text-red-500">{error}</h1>
              <Button asChild variant="outline">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại trang blog
                </Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Hiển thị blog không tồn tại
  if (!blog) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto w-full max-w-4xl px-3 md:px-4 lg:px-6">
          <main className="py-10">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h1 className="mb-4 text-2xl font-bold">
                Bài viết không tồn tại hoặc đã bị xóa
              </h1>
              <Button asChild variant="outline">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại trang blog
                </Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <article className="mx-auto w-full max-w-4xl px-3 md:px-4 lg:px-6">
        <main className="py-10">
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div>
              <Button variant="link" asChild className="p-0">
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-primary"
                >
                  <ArrowLeft className="mr-2 inline h-4 w-4" />
                  Quay lại trang blog
                </Link>
              </Button>
            </div>

            {/* Tiêu đề và thông tin */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-prim md:text-4xl">
                {blog.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{formatAuthorName(blog.author)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatDate(blog.publishedAt)}</span>
                </div>
              </div>
            </div>

            {/* Ảnh đại diện */}
            {blog.thumbnail && (
              <div className="relative h-[300px] w-full overflow-hidden rounded-xl md:h-[400px]">
                <Image
                  src={blog.thumbnail}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMWYxZjEiLz48L3N2Zz4="
                  priority
                />
              </div>
            )}

            {/* Nội dung bài viết */}
            <div
              className="prose prose-lg blog-content mt-6 max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </main>
      </article>
    </div>
  );
}

// Component skeleton để tái sử dụng
function BlogSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-4xl px-3 md:px-4 lg:px-6">
        <main className="py-10">
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-[300px] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
