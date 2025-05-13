import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ResumeServerData } from "./types";
import { ResumeValues } from "./validation";
import { BorderStyle } from "@/app/(main)/editor/BorderStyleButton";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fileReplacer(key: unknown, value: unknown) {
  return value instanceof File
    ? {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified,
      }
    : value;
}

export function mapToResumeValues(data: ResumeServerData): ResumeValues {
  return {
    id: data.id,
    title: data.title || undefined,
    description: data.description || undefined,
    photo: data.photoUrl || undefined,
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
    jobTitle: data.jobTitle || undefined,
    city: data.city || undefined,
    country: data.country || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    workExperiences: data.workExperiences.map((exp) => ({
      position: exp.position || undefined,
      company: exp.company || undefined,
      startDate: exp.startDate?.toISOString().split("T")[0],
      endDate: exp.endDate?.toISOString().split("T")[0],
      description: exp.description || undefined,
    })),
    educations: data.educations.map((edu) => ({
      degree: edu.degree || undefined,
      school: edu.school || undefined,
      startDate: edu.startDate?.toISOString().split("T")[0],
      endDate: edu.endDate?.toISOString().split("T")[0],
    })),
    projects: data.projects?.map((proj) => ({
      name: proj.name || undefined,
      role: proj.role || undefined,
      startDate: proj.startDate?.toISOString().split("T")[0],
      endDate: proj.endDate?.toISOString().split("T")[0],
      description: proj.description || undefined,
      techStack: proj.techStack || [],
    })) || [],
    hobbies: data.hobbies?.map((hobby) => ({
      name: hobby.name || undefined,
      description: hobby.description || undefined,
    })) || [],
    skills: data.skills,
    borderStyle: data.borderStyle as BorderStyle,
    colorHex: data.colorHex,
    summary: data.summary || undefined,
    templateType: data.templateType,
  };
}
