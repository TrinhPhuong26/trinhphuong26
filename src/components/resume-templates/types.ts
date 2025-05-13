import { ResumeValues } from "@/lib/validation";
import { ReactNode } from "react";

export enum TemplateType {
  BLANK = "blank",
  PROFESSIONAL = "professional",
  CREATIVE = "creative",
  MINIMAL = "minimal",
}

export interface ResumeTemplateProps {
  resumeData: ResumeValues;
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

export interface SectionProps {
  resumeData: ResumeValues;
  children?: ReactNode;
}
