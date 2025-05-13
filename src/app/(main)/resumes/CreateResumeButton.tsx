"use client";

import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import Link from "next/link";

export default function CreateResumeButton() {
  return (
    <Button asChild className="flex w-fit gap-2 bg-prim hover:bg-[#3d4080]">
      <Link href="/editor">
        <PlusSquare className="size-5" />
        Tạo CV mới
      </Link>
    </Button>
  );
}
