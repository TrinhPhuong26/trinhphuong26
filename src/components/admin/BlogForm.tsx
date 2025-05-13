"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Upload, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Định nghĩa props
interface BlogFormProps {
  blogId?: string; // Nếu có ID, đây là form sửa blog
}

export default function BlogForm({ blogId }: BlogFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!blogId;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [fetchingBlog, setFetchingBlog] = useState(isEditing);

  // Hàm lấy thông tin blog
  const fetchBlogData = useCallback(async () => {
    try {
      setFetchingBlog(true);
      const response = await axios.get(`/api/admin/blogs/${blogId}`);
      const blog = response.data;

      // Cập nhật state từ dữ liệu API
      setTitle(blog.title);
      setSlug(blog.slug);
      setThumbnail(blog.thumbnail || "");
      setContent(blog.content);
      setPublished(blog.published);
    } catch (error) {
      console.error("Error fetching blog:", error);
      toast.error("Không thể tải thông tin bài viết");
    } finally {
      setFetchingBlog(false);
    }
  }, [blogId]);

  useEffect(() => {
    if (isEditing) {
      fetchBlogData();
    }
  }, [isEditing, fetchBlogData]);

  // Hàm tạo slug tự động từ tiêu đề
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
      .replace(/[èéẹẻẽêềếệểễ]/g, "e")
      .replace(/[ìíịỉĩ]/g, "i")
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
      .replace(/[ùúụủũưừứựửữ]/g, "u")
      .replace(/[ỳýỵỷỹ]/g, "y")
      .replace(/đ/g, "d")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .trim();
  };

  // Xử lý khi tiêu đề thay đổi, tự động cập nhật slug nếu chưa được sửa thủ công
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // Chỉ cập nhật slug nếu nó chưa được chỉnh sửa thủ công
    if (slug === "" || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  // Xử lý khi chọn file hình ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // Tạo URL tạm thời để hiển thị preview
      const tempUrl = URL.createObjectURL(file);
      setThumbnail(tempUrl);
    }
  };

  // Xóa hình ảnh đã chọn
  const handleRemoveThumbnail = () => {
    if (thumbnail.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnail);
    }
    setThumbnail("");
    setThumbnailFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Đã xóa hình ảnh");
  };

  // Xử lý upload hình ảnh
  const handleUploadThumbnail = async () => {
    if (!thumbnailFile) return null;

    try {
      setThumbnailLoading(true);

      const formData = new FormData();
      formData.append("thumbnail", thumbnailFile);
      
      // Thêm blogId vào formData nếu đang ở chế độ sửa
      if (blogId) {
        formData.append("blogId", blogId);
      }

      const response = await axios.post(
        "/api/admin/upload-thumbnail",
        formData,
      );

      const thumbnailUrl = response.data.thumbnailUrl;

      // Revoke URL blob để tránh rò rỉ bộ nhớ
      if (thumbnail.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnail);
      }

      return thumbnailUrl;
    } catch (error: unknown) {
      console.error("Error uploading thumbnail:", error);
      throw error;
    } finally {
      setThumbnailLoading(false);
      setThumbnailFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug) {
      toast.error("Vui lòng điền tiêu đề và slug");
      return;
    }

    try {
      setLoading(true);

      let finalThumbnail = thumbnail;

      // Xử lý upload hình ảnh nếu có file mới
      if (thumbnailFile) {
        try {
          const uploadedUrl = await handleUploadThumbnail();
          if (uploadedUrl) {
            finalThumbnail = uploadedUrl;
            setThumbnail(uploadedUrl);
          }
        } catch (error) {
          console.error("Lỗi upload:", error);
          toast.error("Lỗi khi tải lên hình ảnh");
          setLoading(false);
          return;
        }
      }

      // Nếu vẫn là URL blob thì đặt null để tránh lỗi
      if (finalThumbnail && finalThumbnail.startsWith("blob:")) {
        finalThumbnail = "";
      }

      // Tạo mô tả ngắn tự động từ nội dung bài viết (2 dòng đầu tiên)
      const autoExcerpt =
        content.split("\n").slice(0, 2).join("\n").trim() +
        (content.split("\n").length > 2 ? "..." : "");

      const blogData = {
        title: title.trim(),
        slug: slug.trim().replace(/\s+/g, "-").toLowerCase(),
        thumbnail: finalThumbnail || null,
        content,
        excerpt: autoExcerpt,
        published,
      };

      // console.log("Đang gửi dữ liệu blog:", blogData);

      let newBlogId: string | undefined;

      if (isEditing) {
        // Cập nhật blog
        await axios.patch(`/api/admin/blogs/${blogId}`, blogData);
        toast.success("Bài viết đã được cập nhật thành công");
      } else {
        // Tạo blog mới
        const response = await axios.post("/api/admin/blogs", blogData);
        newBlogId = response.data.id;
        toast.success("Bài viết đã được tạo thành công");

        // Chuyển hướng đến trang sửa nếu tạo thành công
        if (newBlogId) {
          setTimeout(() => {
            router.push(`/admin/blogs/${newBlogId}`);
          }, 1500);
        }
      }
    } catch (error: unknown) {
      console.error("Lỗi khi lưu bài viết:", error);

      if (axios.isAxiosError(error)) {
        // Hiển thị chi tiết lỗi từ API nếu có
        const errorData = error.response?.data;
        console.error("Chi tiết lỗi:", errorData);

        if (errorData?.details) {
          // Hiển thị lỗi validation cụ thể
          let errorMessage = "Lỗi dữ liệu:";
          if (errorData.details.title?._errors) {
            errorMessage += ` Tiêu đề: ${errorData.details.title._errors.join(", ")}`;
          }
          if (errorData.details.slug?._errors) {
            errorMessage += ` Slug: ${errorData.details.slug._errors.join(", ")}`;
          }
          toast.error(errorMessage);
        } else if (errorData?.error === "Slug đã tồn tại") {
          toast.error("Slug đã được sử dụng. Vui lòng chọn một slug khác.");
        } else {
          toast.error(
            errorData?.error || "Lỗi khi lưu bài viết. Vui lòng thử lại sau.",
          );
        }
      } else {
        toast.error("Lỗi không xác định khi lưu bài viết");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingBlog) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Đang tải thông tin bài viết...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/blogs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h1>
        </div>
        <Button type="submit" disabled={loading} size="lg">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEditing ? "Cập nhật" : "Lưu bài viết"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cột chính - nội dung chính */}
        <div className="space-y-6 lg:col-span-2">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle>Nội dung</CardTitle>
              <CardDescription>Thông tin cơ bản của bài viết</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Nhập tiêu đề bài viết"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="slug-bai-viet"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  URL: /blog/{slug}
                </p>
              </div>

              {/* Nội dung bài viết */}
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung bài viết</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung bài viết..."
                  className="min-h-[300px]"
                />
                <p className="text-sm text-muted-foreground">
                  Mô tả ngắn sẽ được tự động tạo từ 2 dòng đầu của nội dung.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phụ - meta data và tùy chọn */}
        <div className="space-y-6">
          {/* Trạng thái xuất bản */}
          <Card>
            <CardHeader>
              <CardTitle>Xuất bản</CardTitle>
              <CardDescription>Cài đặt xuất bản bài viết</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="published">Xuất bản</Label>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {published
                  ? "Bài viết sẽ được hiển thị công khai"
                  : "Bài viết sẽ ở chế độ nháp"}
              </p>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditing ? "Cập nhật" : "Lưu bài viết"}
              </Button>
            </CardFooter>
          </Card>

          {/* Ảnh đại diện */}
          <Card>
            <CardHeader>
              <CardTitle>Ảnh đại diện</CardTitle>
              <CardDescription>Hình ảnh đại diện bài viết</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {thumbnail ? (
                <div className="relative rounded-md border">
                  <div className="relative aspect-video overflow-hidden rounded-md">
                    <Image
                      src={thumbnail}
                      alt="Thumbnail preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-500"
                    onClick={handleRemoveThumbnail}
                    disabled={thumbnailLoading}
                  >
                    {thumbnailLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
                  {thumbnailLoading ? (
                    <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                  ) : (
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {thumbnailLoading
                      ? "Đang tải lên..."
                      : "Chưa có ảnh đại diện"}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="thumbnailFile">
                  {thumbnail ? "Thay đổi ảnh" : "Chọn ảnh"}
                </Label>
                <Input
                  ref={fileInputRef}
                  id="thumbnailFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={thumbnailLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Thông tin */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">{blogId || "Chưa tạo"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span>
                    {published ? (
                      <span className="text-green-500">Đã xuất bản</span>
                    ) : (
                      <span className="text-yellow-500">Bản nháp</span>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
