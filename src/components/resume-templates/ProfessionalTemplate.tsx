"use client";

import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton";
import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { ResumeTemplateProps, SectionProps } from "./types";
import useDimensions from "@/hooks/useDimensions";

export default function ProfessionalTemplate({
  resumeData,
  contentRef,
  className,
}: ResumeTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useDimensions(containerRef);

  return (
    <div
      className={cn(
        "aspect-[210/297] h-fit w-full bg-white text-black",
        className,
      )}
      ref={containerRef}
    >
      <div
        className={cn("flex h-full", !width && "invisible")}
        style={{
          zoom: (1 / 794) * width,
        }}
        ref={contentRef}
        id="resumePreviewContent"
      >
        {/* Sidebar - Phần bên trái */}
        <div
          className="w-1/3 p-6 text-white"
          style={{ backgroundColor: resumeData.colorHex || "#0f172a" }}
        >
          <SidebarContent resumeData={resumeData} />
        </div>

        {/* Phần nội dung chính - bên phải */}
        <div className="w-2/3 p-6">
          <MainContent resumeData={resumeData} />
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ resumeData }: SectionProps) {
  const {
    photo,
    firstName,
    lastName,
    jobTitle,
    city,
    country,
    phone,
    email,
    skills,
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
    <div className="flex h-full flex-col space-y-8">
      {/* Profile Photo & Name */}
      <div className="flex flex-col items-center text-center">
        {photoSrc && (
          <div className="mb-4">
            <Image
              src={photoSrc}
              width={120}
              height={120}
              alt="Author photo"
              className="aspect-square object-cover"
              style={{
                borderRadius:
                  borderStyle === BorderStyles.SQUARE
                    ? "0px"
                    : borderStyle === BorderStyles.CIRCLE
                      ? "9999px"
                      : "10%",
                border: "2px solid white",
              }}
            />
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-wider">
          {firstName} {lastName}
        </h1>
        {jobTitle && (
          <p className="mt-1 text-sm font-light uppercase tracking-wide">
            {jobTitle}
          </p>
        )}
      </div>

      {/* Thông tin liên hệ */}
      <div className="space-y-4">
        <h2 className="border-b border-white/30 pb-1 text-lg font-semibold uppercase">
          Liên hệ
        </h2>
        <div className="space-y-2 text-sm">
          {(city || country) && (
            <div>
              <p className="font-semibold">Địa chỉ</p>
              <p className="font-light">
                {city}
                {city && country ? ", " : ""}
                {country}
              </p>
            </div>
          )}
          {phone && (
            <div>
              <p className="font-semibold">Điện thoại</p>
              <p className="font-light">{phone}</p>
            </div>
          )}
          {email && (
            <div>
              <p className="font-semibold">Email</p>
              <p className="break-words font-light">{email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Kỹ năng */}
      {skills?.length ? (
        <div className="space-y-4">
          <h2 className="border-b border-white/30 pb-1 text-lg font-semibold uppercase">
            Kỹ năng
          </h2>
          <div className="space-y-2">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span className="text-sm">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MainContent({ resumeData }: SectionProps) {
  const { summary, workExperiences, educations, skills, projects, hobbies, colorHex } = resumeData;

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  ) || [];

  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0,
  ) || [];

  const projectsNotEmpty = projects?.filter(
    (proj) => Object.values(proj).filter(Boolean).length > 0,
  ) || [];

  const hobbiesNotEmpty = hobbies?.filter(
    (hobby) => Object.values(hobby).filter(Boolean).length > 0,
  ) || [];

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {summary && (
        <div className="space-y-3">
          <h2
            className="text-xl font-bold uppercase tracking-wide"
            style={{ color: colorHex }}
          >
            Mục tiêu nghề nghiệp
          </h2>
          <div className="h-1 w-20" style={{ backgroundColor: colorHex }}></div>
          <p className="text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Education Section */}
      {educationsNotEmpty.length > 0 && (
        <div className="space-y-3">
          <h2
            className="text-xl font-bold uppercase tracking-wide"
            style={{ color: colorHex }}
          >
            Trình độ học vấn
          </h2>
          <div className="h-1 w-20" style={{ backgroundColor: colorHex }}></div>
          <div className="space-y-3">
            {educationsNotEmpty.map((edu, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  {edu.startDate && (
                    <p className="text-sm text-gray-600">
                      {formatDate(new Date(edu.startDate), "MM/yyyy")} -{" "}
                      {edu.endDate
                        ? formatDate(new Date(edu.endDate), "MM/yyyy")
                        : "Hiện tại"}
                    </p>
                  )}
                </div>
                <p className="text-sm">{edu.school}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {workExperiencesNotEmpty.length > 0 && (
        <div className="space-y-3">
          <h2
            className="text-xl font-bold uppercase tracking-wide"
            style={{ color: colorHex }}
          >
            Kinh nghiệm làm việc
          </h2>
          <div className="h-1 w-20" style={{ backgroundColor: colorHex }}></div>
          <div className="space-y-4">
            {workExperiencesNotEmpty.map((exp, index) => (
              <div
                key={index}
                className="break-inside-avoid space-y-1 rounded border-l-4 pl-3"
                style={{ borderColor: colorHex }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{exp.position}</h3>
                  {exp.startDate && (
                    <p className="text-sm text-gray-600">
                      {formatDate(new Date(exp.startDate), "MM/yyyy")} -{" "}
                      {exp.endDate
                        ? formatDate(new Date(exp.endDate), "MM/yyyy")
                        : "Hiện tại"}
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium">{exp.company}</p>
                {exp.description && (
                  <p className="whitespace-pre-line pt-1 text-sm text-gray-700">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Section */}
      {skills && skills.length > 0 && (
        <div className="space-y-3">
          <h2
            className="text-xl font-bold uppercase tracking-wide"
            style={{ color: colorHex }}
          >
            Kỹ năng
          </h2>
          <div className="h-1 w-20" style={{ backgroundColor: colorHex }}></div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="rounded-full px-3 py-1 text-sm"
                style={{
                  backgroundColor: `${colorHex}20`,
                  color: colorHex,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {projectsNotEmpty.length > 0 && (
        <div className="space-y-3">
          <h2
            className="text-xl font-bold uppercase tracking-wide"
            style={{ color: colorHex }}
          >
            Dự án
          </h2>
          <div className="h-1 w-20" style={{ backgroundColor: colorHex }}></div>
          <div className="space-y-4">
            {projectsNotEmpty.map((proj, index) => (
              <div
                key={index}
                className="break-inside-avoid space-y-1 rounded border-l-4 pl-3"
                style={{ borderColor: colorHex }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{proj.name}</h3>
                  {proj.startDate && (
                    <p className="text-sm text-gray-600">
                      {formatDate(new Date(proj.startDate), "MM/yyyy")} -{" "}
                      {proj.endDate
                        ? formatDate(new Date(proj.endDate), "MM/yyyy")
                        : "Hiện tại"}
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium">{proj.role}</p>
                {proj.description && (
                  <p className="whitespace-pre-line pt-1 text-sm text-gray-700">
                    {proj.description}
                  </p>
                )}
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{
                          backgroundColor: `${colorHex}20`,
                          color: colorHex,
                        }}
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
      )}

      {/* Hobbies Section */}
      {hobbiesNotEmpty.length > 0 && (
        <div className="space-y-3">
          <h2
            className="text-xl font-bold uppercase tracking-wide"
            style={{ color: colorHex }}
          >
            Sở thích
          </h2>
          <div className="h-1 w-20" style={{ backgroundColor: colorHex }}></div>
          <div className="space-y-2">
            {hobbiesNotEmpty.map((hobby, index) => (
              <div key={index} className="break-inside-avoid pb-2">
                {hobby.name && (
                  <p className="text-sm font-medium">{hobby.name}</p>
                )}
                {hobby.description && (
                  <p className="text-sm text-gray-600">{hobby.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
