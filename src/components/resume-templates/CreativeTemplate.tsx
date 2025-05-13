"use client";

import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton";
import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { ResumeTemplateProps, SectionProps } from "./types";
import useDimensions from "@/hooks/useDimensions";

export default function CreativeTemplate({
  resumeData,
  contentRef,
  className,
}: ResumeTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useDimensions(containerRef);
  const colorHex = resumeData.colorHex || "#ec4899";

  // Màu gradient cho template sáng tạo
  const gradientStart = colorHex;
  const gradientEnd = adjustColorBrightness(colorHex, 40); // Tạo màu sáng hơn cho gradient

  return (
    <div
      className={cn(
        "aspect-[210/297] h-fit w-full bg-white text-black",
        className,
      )}
      ref={containerRef}
    >
      <div
        className={cn("relative h-full", !width && "invisible")}
        style={{
          zoom: (1 / 794) * width,
        }}
        ref={contentRef}
        id="resumePreviewContent"
      >
        {/* Header với gradient và ảnh hồ sơ */}
        <div
          className="relative p-6"
          style={{
            background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
            height: "220px",
          }}
        >
          <HeaderSection resumeData={resumeData} />
        </div>

        {/* Main content với layout sáng tạo */}
        <div className="grid grid-cols-12 gap-4 p-6">
          {/* Summary - Trải rộng 12 cột */}
          <SummarySection resumeData={resumeData} />

          {/* Cột trái - 7 cột */}
          <div className="col-span-7 space-y-6">
            <EducationSection resumeData={resumeData} />
            <WorkExperienceSection resumeData={resumeData} />
            <ProjectsSection resumeData={resumeData} />
          </div>

          {/* Cột phải - 5 cột */}
          <div className="col-span-5 space-y-6">
            <SkillsSection resumeData={resumeData} />
            <HobbiesSection resumeData={resumeData} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility function để điều chỉnh màu sắc
function adjustColorBrightness(hex: string, percent: number) {
  // Chuyển đổi hex sang RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Điều chỉnh độ sáng
  r = Math.min(255, r + (percent / 100) * 255);
  g = Math.min(255, g + (percent / 100) * 255);
  b = Math.min(255, b + (percent / 100) * 255);

  // Chuyển về định dạng hex
  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
}

function HeaderSection({ resumeData }: SectionProps) {
  const {
    photo,
    firstName,
    lastName,
    jobTitle,
    phone,
    email,
    city,
    country,
    borderStyle,
  } = resumeData;

  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo);

  useEffect(() => {
    const objectUrl = photo instanceof File ? URL.createObjectURL(photo) : "";
    if (objectUrl) setPhotoSrc(objectUrl);
    if (photo === null) setPhotoSrc("");
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  return (
    <div className="relative flex items-center text-white">
      {/* Ảnh profile đặt ở vị trí nổi bật với border sáng tạo */}
      {photoSrc && (
        <div
          className="relative mr-5"
          style={{
            width: "150px",
            height: "150px",
          }}
        >
          <div
            className="absolute inset-0 rotate-6"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius:
                borderStyle === BorderStyles.SQUARE
                  ? "0"
                  : borderStyle === BorderStyles.CIRCLE
                    ? "9999px"
                    : "10%",
            }}
          ></div>
          <Image
            src={photoSrc}
            width={150}
            height={150}
            alt="Author photo"
            className="absolute inset-0 aspect-square object-cover"
            style={{
              borderRadius:
                borderStyle === BorderStyles.SQUARE
                  ? "0"
                  : borderStyle === BorderStyles.CIRCLE
                    ? "9999px"
                    : "10%",
              border: "3px solid white",
            }}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-wide">
          {firstName} {lastName}
        </h1>

        {jobTitle && (
          <h2 className="text-xl font-medium tracking-wide">{jobTitle}</h2>
        )}

        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          {(city || country) && (
            <span className="flex items-center">
              <LocationIcon className="mr-1 h-4 w-4" />
              {city}
              {city && country ? ", " : ""}
              {country}
            </span>
          )}

          {phone && (
            <span className="flex items-center">
              <PhoneIcon className="mr-1 h-4 w-4" />
              {phone}
            </span>
          )}

          {email && (
            <span className="flex items-center">
              <EmailIcon className="mr-1 h-4 w-4" />
              {email}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SummarySection({ resumeData }: SectionProps) {
  const { summary, colorHex } = resumeData;

  if (!summary) return null;

  return (
    <div className="col-span-12 mb-4 mt-4">
      <div
        className="rounded-lg border-l-4 p-4 shadow-sm"
        style={{ borderColor: colorHex }}
      >
        <h2 className="mb-2 text-xl font-bold" style={{ color: colorHex }}>
          Mục tiêu nghề nghiệp
        </h2>
        <p className="text-sm italic leading-relaxed">{summary}</p>
      </div>
    </div>
  );
}

function WorkExperienceSection({ resumeData }: SectionProps) {
  const { workExperiences, colorHex } = resumeData;

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  );

  if (!workExperiencesNotEmpty?.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="relative text-xl font-bold" style={{ color: colorHex }}>
        <span className="relative z-10">Kinh nghiệm chuyên môn</span>
        <span
          className="absolute bottom-0 left-0 z-0 h-3 w-full opacity-20"
          style={{ backgroundColor: colorHex }}
        ></span>
      </h2>

      <div className="space-y-6">
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="relative pl-6">
            {/* Dấu chấm và đường kẻ timeline */}
            <div
              className="absolute left-0 top-0 h-4 w-4 rounded-full"
              style={{ backgroundColor: colorHex }}
            ></div>
            <div
              className="absolute bottom-0 left-2 top-4 w-0.5"
              style={{ backgroundColor: `${colorHex}40` }} // 40 là opacity hex
            ></div>

            <div>
              <h3 className="text-base font-bold">{exp.position}</h3>
              <p className="text-sm font-medium" style={{ color: colorHex }}>
                {exp.company}
              </p>

              {exp.startDate && (
                <p className="mt-1 text-xs text-gray-600">
                  {formatDate(new Date(exp.startDate), "MM/yyyy")} -{" "}
                  {exp.endDate
                    ? formatDate(new Date(exp.endDate), "MM/yyyy")
                    : "Hiện tại"}
                </p>
              )}

              {exp.description && (
                <p className="mt-2 text-xs leading-relaxed">
                  {exp.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationSection({ resumeData }: SectionProps) {
  const { educations, colorHex } = resumeData;

  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0,
  );

  if (!educationsNotEmpty?.length) return null;

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: `${colorHex}10` }} // 10 là opacity hex
    >
      <h2 className="mb-3 text-xl font-bold" style={{ color: colorHex }}>
        Học vấn
      </h2>

      <div className="space-y-3">
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="border-b border-gray-200 pb-2">
            <h3 className="text-sm font-bold">{edu.degree}</h3>
            <p className="text-xs">{edu.school}</p>

            {edu.startDate && (
              <p className="mt-1 text-xs text-gray-600">
                {formatDate(new Date(edu.startDate), "MM/yyyy")}
                {edu.endDate
                  ? ` - ${formatDate(new Date(edu.endDate), "MM/yyyy")}`
                  : " - Hiện tại"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsSection({ resumeData }: SectionProps) {
  const { skills, colorHex } = resumeData;

  if (!skills?.length) return null;

  return (
    <div>
      <h2 className="mb-3 text-xl font-bold" style={{ color: colorHex }}>
        Kỹ năng
      </h2>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: `${colorHex}20`, // Light background
              color: colorHex, // Dark text
              border: `1px solid ${colorHex}40`,
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProjectsSection({ resumeData }: SectionProps) {
  const { projects, colorHex } = resumeData;

  const projectsArray = projects || [];
  const projectsNotEmpty = projectsArray.filter(
    (proj) => Object.values(proj).filter(Boolean).length > 0
  );

  if (!projectsNotEmpty.length) return null;

  return (
    <div>
      <h2
        className="mb-3 text-lg font-bold uppercase tracking-wider"
        style={{ color: colorHex }}
      >
        Dự án
      </h2>
      <div className="space-y-4">
        {projectsNotEmpty.map((proj, i) => (
          <div
            key={i}
            className="space-y-1 rounded-md bg-white p-3 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium">{proj.name}</h3>
              {proj.startDate && (
                <div
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${colorHex}30`,
                    color: colorHex,
                  }}
                >
                  {formatDate(new Date(proj.startDate), "MM/yyyy")} -{" "}
                  {proj.endDate
                    ? formatDate(new Date(proj.endDate), "MM/yyyy")
                    : "Hiện tại"}
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-gray-600">{proj.role}</p>
            <p className="text-xs text-gray-600">{proj.description}</p>
            {proj.techStack && proj.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {proj.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HobbiesSection({ resumeData }: SectionProps) {
  const { hobbies, colorHex } = resumeData;

  const hobbiesArray = hobbies || [];
  const hobbiesNotEmpty = hobbiesArray.filter(
    (hobby) => Object.values(hobby).filter(Boolean).length > 0
  );

  if (!hobbiesNotEmpty.length) return null;

  return (
    <div>
      <h2
        className="mb-3 text-lg font-bold uppercase tracking-wider"
        style={{ color: colorHex }}
      >
        Sở thích
      </h2>
      <div
        className="rounded-md bg-white p-4 shadow-sm"
        style={{ borderTop: `2px solid ${colorHex}` }}
      >
        <div className="space-y-3">
          {hobbiesNotEmpty.map((hobby, i) => (
            <div key={i} className="space-y-1">
              {hobby.name && (
                <h3 className="text-sm font-medium">{hobby.name}</h3>
              )}
              {hobby.description && (
                <p className="text-xs text-gray-600">{hobby.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Icons đơn giản cho các thông tin liên hệ
function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );
}
