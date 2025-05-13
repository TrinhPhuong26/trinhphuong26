"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resumeTemplates } from "@/lib/templates";
import { BookTemplate } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TemplatesDialog() {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const router = useRouter();

  // Sắp xếp templates để đặt template trắng bên trái
  const sortedTemplates = [...resumeTemplates].sort((a, b) => {
    if (a.id === "blank") return -1;
    if (b.id === "blank") return 1;
    return 0;
  });

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleCreateFromTemplate = () => {
    if (selectedTemplate) {
      router.push(`/editor?template=${selectedTemplate}`);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex w-fit gap-2 bg-[#e1e1ec]">
          <BookTemplate className="size-5" />
          Chọn từ mẫu có sẵn
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Chọn mẫu template</DialogTitle>
          <DialogDescription>
            Chọn mẫu có sẵn để bắt đầu tạo CV của bạn. Bạn có thể tùy chỉnh sau
            khi chọn.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {sortedTemplates.map((template) => (
            <div
              key={template.id}
              className={`relative cursor-pointer overflow-hidden rounded-lg border p-2 transition-all ${
                selectedTemplate === template.id
                  ? "border-2 border-primary ring-2 ring-primary/20"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleSelectTemplate(template.id)}
            >
              {/* <div className="aspect-[3/4] overflow-hidden rounded-md">
                <Image
                  src={template.thumbnail}
                  alt={template.name}
                  width={300}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div> */}
              <div className="mt-2 text-center">
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="mt-4"
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreateFromTemplate}
            disabled={!selectedTemplate}
            className="mt-4"
          >
            Tạo CV từ template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
