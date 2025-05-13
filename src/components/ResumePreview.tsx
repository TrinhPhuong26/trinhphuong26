import { ResumeValues } from "@/lib/validation";
import React from "react";
import { TemplateType, templateComponents } from "./resume-templates";

interface ResumePreviewProps {
  resumeData: ResumeValues;
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
  templateType?: TemplateType;
}

export default function ResumePreview({
  resumeData,
  contentRef,
  className,
  templateType = TemplateType.BLANK,
}: ResumePreviewProps) {
  // Chọn component template dựa vào templateType
  const TemplateComponent = templateComponents[templateType];

  return (
    <TemplateComponent
      resumeData={resumeData}
      contentRef={contentRef}
      className={className}
    />
  );
}
