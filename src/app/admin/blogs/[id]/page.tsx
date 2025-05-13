"use client";

import { use } from "react";
import BlogForm from "@/components/admin/BlogForm";

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  return <BlogForm blogId={unwrappedParams.id} />;
}
