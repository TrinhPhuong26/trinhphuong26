"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import { Search } from "lucide-react";

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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm lấy danh sách blogs
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/blogs", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
        },
      });
      setBlogs(response.data.blogs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm]);

  // Lấy danh sách blog đã xuất bản
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 }); // Reset về trang 1 khi tìm kiếm
  };

  // Xử lý phân trang
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

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

  // Format ngày
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl px-3 md:px-4 lg:px-6">
        <main className="py-10">
          <div className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <h1 className="text-3xl font-bold text-prim md:text-4xl">
                Tin tức & Hướng dẫn
              </h1>

              {/* Thanh tìm kiếm */}
              <form
                onSubmit={handleSearch}
                className="flex w-full gap-2 md:w-auto"
              >
                <Input
                  type="search"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64"
                />
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  Tìm
                </Button>
              </form>
            </div>

            {/* Danh sách bài viết */}
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="relative flex-1 overflow-hidden rounded-xl shadow-xl"
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
                  ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-xl text-muted-foreground">
                  Không tìm thấy bài viết nào
                  {searchTerm ? ` phù hợp với "${searchTerm}"` : ""}.
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Xem tất cả bài viết
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {blogs.map((blog) => (
                    <Link
                      key={blog.id}
                      href={`/blog/${blog.slug}`}
                      className="relative flex-1 rounded-xl shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <Image
                        src={blog.thumbnail || "/placeholder-blog.jpg"}
                        alt={blog.title}
                        width={400}
                        height={250}
                        className="h-[250px] w-full rounded-t-xl object-cover"
                      />
                      <div className="space-y-3 p-5">
                        <div className="flex items-center gap-2 text-base">
                          <p>
                            by{" "}
                            <span className="text-prim">
                              {formatAuthorName(blog.author)}
                            </span>
                          </p>
                          |<p>{formatDate(blog.publishedAt)}</p>
                        </div>
                        <p className="text-xl font-semibold !leading-7 text-prim">
                          {blog.title}
                        </p>
                        <p className="line-clamp-2 text-gray-600">
                          {blog.excerpt}
                        </p>
                        <div className="text-prim underline underline-offset-4">
                          Đọc thêm
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Phân trang */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        Trước
                      </Button>
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1,
                      ).map((page) => (
                        <Button
                          key={page}
                          variant={
                            page === pagination.page ? "default" : "outline"
                          }
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
