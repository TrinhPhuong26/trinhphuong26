"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Link from "next/link";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Search,
  Edit,
  Trash,
  ExternalLink,
  Loader2,
  Check,
  X,
} from "lucide-react";

// Khai báo interface
interface Blog {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  authorId: string;
  author: {
    email: string;
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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  // Hàm lấy danh sách blogs
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/blogs", {
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
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm]);

  // Load blogs khi component mount hoặc khi tham số thay đổi
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

  // Mở dialog xác nhận xóa blog
  const handleDeleteClick = (blog: Blog) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  // Xóa blog
  const handleDelete = async () => {
    if (!blogToDelete) return;

    try {
      await axios.delete(`/api/admin/blogs/${blogToDelete.id}`);
      // Cập nhật danh sách blogs sau khi xóa
      setBlogs(blogs.filter((blog) => blog.id !== blogToDelete.id));
      setDeleteDialogOpen(false);
      toast.success("Đã xóa bài viết thành công");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Không thể xóa bài viết");
    }
  };

  // Toggle trạng thái published của blog
  const togglePublished = async (blog: Blog) => {
    try {
      await axios.patch(`/api/admin/blogs/${blog.id}`, {
        published: !blog.published,
      });
      // Cập nhật danh sách blogs
      setBlogs(
        blogs.map((b) =>
          b.id === blog.id ? { ...b, published: !b.published } : b,
        ),
      );

      toast.success(
        blog.published
          ? "Đã chuyển trạng thái bài viết thành chưa xuất bản"
          : "Đã xuất bản bài viết thành công",
      );
    } catch (error) {
      console.error("Error updating blog status:", error);
      toast.error("Không thể cập nhật trạng thái bài viết");
    }
  };

  // Format ngày tháng
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Blog</h1>
        <Button asChild>
          <Link href="/admin/blogs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo bài viết mới
          </Link>
        </Button>
      </div>

      {/* Thanh tìm kiếm */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="search"
          placeholder="Tìm kiếm tiêu đề, nội dung..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit">
          <Search className="mr-2 h-4 w-4" />
          Tìm kiếm
        </Button>
      </form>

      {/* Bảng danh sách blogs */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Tiêu đề</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  <p className="mt-2">Đang tải dữ liệu...</p>
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <p className="text-muted-foreground">Không có bài viết nào</p>
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell>{blog.slug}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={blog.published ? "default" : "outline"}
                      onClick={() => togglePublished(blog)}
                    >
                      {blog.published ? (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Đã xuất bản
                        </>
                      ) : (
                        <>
                          <X className="mr-1 h-4 w-4" />
                          Chưa xuất bản
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>{formatDate(blog.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="icon" variant="outline" asChild>
                        <Link href={`/admin/blogs/${blog.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDeleteClick(blog)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      {blog.published && (
                        <Button size="icon" variant="outline" asChild>
                          <Link href={`/blog/${blog.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Phân trang */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Trước
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={page === pagination.page ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ),
            )}
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

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa blog {blogToDelete?.title}? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
