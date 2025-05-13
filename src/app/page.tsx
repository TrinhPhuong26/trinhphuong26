"use client";

import { Button } from "@/components/ui/button";
import { Bot, FileText, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";

// Định nghĩa interface cho blog
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  publishedAt: string;
  author: {
    firstName: string | null;
    lastName: string | null;
  };
}

export default function Home() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  // Lấy danh sách blog đã xuất bản
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoadingBlogs(true);
        const response = await fetch("/api/blogs?limit=3");

        if (!response.ok) {
          throw new Error("Lỗi khi lấy dữ liệu blog");
        }

        const data = await response.json();
        setBlogs(data.blogs);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu blog:", error);
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchBlogs();
  }, []);

  // Format tên tác giả
  const formatAuthorName = (author: {
    firstName: string | null;
    lastName: string | null;
  }) => {
    if (author.firstName || author.lastName) {
      return `${author.firstName || ""} ${author.lastName || ""}`.trim();
    }
    return "Admin";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-24 xl:px-52">
        <main>
          {/* banner */}
          <section className="flex flex-col-reverse items-center justify-between gap-8 py-16 md:flex-row md:gap-20 md:py-32">
            <div className="flex flex-1 flex-col items-start gap-5">
              <p className="text-xl font-semibold uppercase text-prim">
                Welcome to QuickCV
              </p>
              <h1 className="scroll-m-20 text-xl font-semibold !leading-tight tracking-tight md:text-2xl lg:text-4xl">
                <span className="inline-block text-prim">
                  Tạo một CV hấp dẫn
                </span>{" "}
                với sự hỗ trợ của AI trong vài phút.
              </h1>
              <div className="text-md text-foreground/90 md:text-base">
                <p>Tạo CV trực tuyến với sự hỗ trợ của AI</p>
                <p>
                  <span className="text-prim">Tạo một hồ sơ chuyên nghiệp</span>{" "}
                  - dễ dàng tạo một hồ sơ chuyên nghiệp với công cụ hỗ trợ của
                  chúng tôi.
                </p>
              </div>
              <Button
                asChild
                className="w-full bg-prim hover:bg-prim/90 md:w-auto"
              >
                <Link
                  href="/resumes"
                  className="px-6 py-5 text-md md:px-8 md:py-6 md:text-lg"
                >
                  Bắt đầu ngay
                </Link>
              </Button>
            </div>
            <div className="w-full flex-1">
              <Image
                src="/resume-preview.jpg"
                alt="Resume preview"
                width={900}
                height={0}
                className="h-auto w-full"
              />
            </div>
          </section>
          {/* feat */}
          <section className="space-y-10 py-10 text-2xl text-prim md:text-3xl">
            <h2 className="text-center font-bold">Tính năng </h2>
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Feature 1 */}
              <div className="w-full flex-1 transform rounded-xl border border-border/40 bg-card px-4 py-8 text-center shadow-xl transition duration-300 hover:-translate-y-3 md:px-8 md:py-12">
                <FileText className="mx-auto mb-4 h-8 w-8 text-indigo-600 md:h-10 md:w-10" />
                <h3 className="mb-2 text-xl font-semibold md:text-2xl">
                  Tạo CV dễ dàng
                </h3>
                <p className="text-base text-card-foreground/80">
                  Dù bạn là người mới bắt đầu hay đã có kinh nghiệm, bạn có thể
                  nhanh chóng tạo một sơ yếu lý lịch hoàn chỉnh chỉ trong vài
                  phút.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="w-full flex-1 transform rounded-xl border border-border/40 bg-card px-4 py-8 text-center shadow-xl transition duration-300 hover:-translate-y-3 md:px-8 md:py-12">
                <Share2 className="mx-auto mb-4 h-8 w-8 text-green-600 md:h-10 md:w-10" />
                <h3 className="mb-2 text-xl font-semibold md:text-2xl">
                  Tự động lưu và chia sẻ dễ dàng
                </h3>
                <p className="text-base text-card-foreground/80">
                  Sơ yếu lý lịch của bạn sẽ được lưu tự động. Bạn có thể tải
                  xuống dưới dạng PDF hoặc chia sẻ chỉ với một cú nhấp chuột.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="w-full flex-1 transform rounded-xl border border-border/40 bg-card px-4 py-8 text-center shadow-xl transition duration-300 hover:-translate-y-3 md:px-8 md:py-12">
                <Bot className="mx-auto mb-4 h-8 w-8 text-red-500 md:h-10 md:w-10" />
                <h3 className="mb-2 text-xl font-semibold md:text-2xl">
                  Gợi ý nội dung thông minh
                </h3>
                <p className="text-base text-card-foreground/80">
                  Nếu bạn không biết nên viết gì, hãy để hệ thống gợi ý giúp bạn
                  tạo ra nội dung hoàn chỉnh cho sơ yếu lý lịch.
                </p>
              </div>
            </div>
          </section>
          {/* news */}
          <section className="my-16 space-y-10 md:my-32">
            <h2 className="text-center text-2xl font-bold text-prim md:text-3xl">
              Tin tức mới nhất
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loadingBlogs ? (
                // Hiển thị skeleton khi đang tải
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="relative flex-1 overflow-hidden rounded-xl border border-border/40 bg-card shadow-xl"
                    >
                      <Skeleton className="h-[250px] w-full" />
                      <div className="space-y-3 p-5">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))
              ) : blogs.length > 0 ? (
                // Hiển thị danh sách blog
                blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="relative flex-1 rounded-xl border border-border/40 bg-card shadow-xl transition-all duration-200 hover:shadow-2xl"
                  >
                    <div className="relative h-[250px] w-full overflow-hidden rounded-t-xl bg-muted">
                      <Image
                        src={
                          blog.thumbnail ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.title)}&background=5257D8&color=fff&size=600`
                        }
                        alt={blog.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform hover:scale-105"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMWYxZjEiLz48L3N2Zz4="
                        quality={80}
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="flex items-center gap-2 text-base md:text-lg">
                        <p>
                          by{" "}
                          <span className="text-prim">
                            {formatAuthorName(blog.author)}
                          </span>
                        </p>
                        |
                        <p className="text-muted-foreground">
                          {new Date(blog.publishedAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </p>
                      </div>
                      <p className="font-semibold !leading-7 line-clamp-2 text-prim text-md">
                        {blog.title}
                      </p>
                      <p className="line-clamp-2 text-card-foreground/80 text-sm text-gray-700">
                        {blog.excerpt}
                      </p>
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="inline-block text-prim underline underline-offset-4 text-sm"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                // Hiển thị khi không có blog
                <div className="col-span-1 py-10 text-center md:col-span-3">
                  <p className="text-muted-foreground">
                    Chưa có bài viết nào. Hãy quay lại sau nhé!
                  </p>
                </div>
              )}
            </div>

            {blogs.length > 0 && (
              <div className="mt-10 text-center">
                <Button asChild variant="outline">
                  <Link href="/blog">Xem tất cả bài viết</Link>
                </Button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
