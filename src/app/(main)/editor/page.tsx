import prisma from "@/lib/prisma";
import { resumeDataInclude, ResumeServerData } from "@/lib/types";
import { resumeTemplates } from "@/lib/templates";
import { getAuthSession } from "@/lib/auth";
import { Metadata } from "next";
import ResumeEditor from "./ResumeEditor";
import { TemplateType } from "@/components/resume-templates";

interface PageProps {
  searchParams: Promise<{ resumeId?: string; template?: string }>;
}

export const metadata: Metadata = {
  title: "Design your resume",
};

export default async function Page({ searchParams }: PageProps) {
  const { resumeId, template } = await searchParams;

  const session = await getAuthSession();

  if (!session) {
    return null;
  }

  const userId = session.id;

  let resumeToEdit: ResumeServerData | null = null;
  let templateType: TemplateType = TemplateType.BLANK;

  if (resumeId) {
    resumeToEdit = await prisma.resume.findUnique({
      where: { id: resumeId, userId },
      include: resumeDataInclude,
    });

    // Sử dụng templateType từ resume nếu có, ngược lại dùng template mặc định
    if (resumeToEdit?.templateType) {
      templateType = resumeToEdit.templateType as TemplateType;
    }
  } else if (template) {
    // Nếu có template ID, lấy dữ liệu từ template
    const templateData = resumeTemplates.find((t) => t.id === template);

    if (templateData) {
      // Lấy loại template để hiển thị đúng giao diện
      templateType = templateData.templateType;

      // Chỉ sử dụng template data để pre-populate form, không tạo một bản ghi giả
      // ResumeEditor sẽ nhận dữ liệu và tạo mới một CV dựa trên dữ liệu đó
      const initialData = templateData.data;

      // Trong trường hợp chọn template, ta có thể tạo một dummy resume với dữ liệu từ template
      // nhưng phải đảm bảo các trường bắt buộc của ResumeServerData có đầy đủ
      resumeToEdit = {
        id: "", // ID rỗng để tạo mới
        userId,
        title: initialData.title || null,
        description: initialData.description || null,
        photoUrl: null,
        firstName: initialData.firstName || null,
        lastName: initialData.lastName || null,
        jobTitle: initialData.jobTitle || null,
        city: initialData.city || null,
        country: initialData.country || null,
        phone: initialData.phone || null,
        email: initialData.email || null,
        summary: initialData.summary || null,
        colorHex: initialData.colorHex || "#000000",
        borderStyle: initialData.borderStyle || "squircle",
        templateType: templateData.templateType,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Khai báo các trường mảng rỗng đúng với định dạng của ResumeServerData
        workExperiences: [],
        educations: [],
        skills: initialData.skills || [],
      } as unknown as ResumeServerData;
    }
  }

  return (
    <ResumeEditor resumeToEdit={resumeToEdit} templateType={templateType} />
  );
}
