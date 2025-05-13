"use client";

import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton";
import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { ResumeTemplateProps, SectionProps } from "./types";
import useDimensions from "@/hooks/useDimensions";

export default function MinimalTemplate({
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
        className={cn("h-full", !width && "invisible")}
        style={{
          zoom: (1 / 794) * width,
        }}
        ref={contentRef}
        id="resumePreviewContent"
      >
        {/* Header đơn giản với border mỏng bên dưới */}
        <div className="border-b p-8 pb-6 text-center">
          <HeaderSection resumeData={resumeData} />
        </div>

        {/* Body với khoảng trắng rộng, bố cục một cột */}
        <div className="px-8 py-6">
          <SummarySection resumeData={resumeData} />
          <WorkExperienceSection resumeData={resumeData} />
          <EducationSection resumeData={resumeData} />
          <SkillsSection resumeData={resumeData} />
        </div>
      </div>
    </div>
  );
}

function HeaderSection({ resumeData }: SectionProps) {
  const {
    photo,
    firstName,
    lastName,
    jobTitle,
    city,
    country,
    phone,
    email,
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
    <div className="flex flex-col items-center space-y-3">
      {photoSrc && (
        <div className="mb-2">
          <Image
            src={photoSrc}
            width={90}
            height={90}
            alt="Author photo"
            className="aspect-square object-cover"
            style={{
              borderRadius:
                borderStyle === BorderStyles.SQUARE
                  ? "0px"
                  : borderStyle === BorderStyles.CIRCLE
                    ? "9999px"
                    : "10%",
              border: "1px solid #e5e7eb",
            }}
          />
        </div>
      )}

      <div className="text-center">
        <h1 className="text-2xl font-normal uppercase tracking-wider">
          {firstName} {lastName}
        </h1>
        {jobTitle && (
          <p className="mt-1 text-sm font-light uppercase tracking-widest text-gray-500">
            {jobTitle}
          </p>
        )}
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
        {(city || country) && (
          <span>
            {city}
            {city && country ? ", " : ""}
            {country}
          </span>
        )}
        {phone && <span>{phone}</span>}
        {email && <span>{email}</span>}
      </div>
    </div>
  );
}

function SummarySection({ resumeData }: SectionProps) {
  const { summary } = resumeData;

  if (!summary) return null;

  return (
    <div className="mb-8 mt-2">
      <h2 className="mb-4 text-center text-xs font-normal uppercase tracking-[0.3em]">
        Giới thiệu
      </h2>
      <p className="text-center text-sm leading-relaxed text-gray-600">
        {summary}
      </p>
    </div>
  );
}

function WorkExperienceSection({ resumeData }: SectionProps) {
  const { workExperiences } = resumeData;

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  );

  if (!workExperiencesNotEmpty?.length) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-center text-xs font-normal uppercase tracking-[0.3em]">
        Kinh nghiệm làm việc
      </h2>

      <div className="space-y-6">
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="break-inside-avoid">
            <div className="flex flex-col text-center">
              <h3 className="text-sm font-medium uppercase">{exp.position}</h3>
              <p className="text-xs text-gray-600">{exp.company}</p>

              {exp.startDate && (
                <p className="mt-1 text-xs font-light text-gray-500">
                  {formatDate(new Date(exp.startDate), "MM/yyyy")} -{" "}
                  {exp.endDate
                    ? formatDate(new Date(exp.endDate), "MM/yyyy")
                    : "Hiện tại"}
                </p>
              )}
            </div>

            {exp.description && (
              <p className="mt-2 text-center text-xs leading-relaxed text-gray-600">
                {exp.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationSection({ resumeData }: SectionProps) {
  const { educations } = resumeData;

  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0,
  );

  if (!educationsNotEmpty?.length) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-center text-xs font-normal uppercase tracking-[0.3em]">
        Học vấn
      </h2>

      <div className="space-y-4">
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="break-inside-avoid text-center">
            <h3 className="text-sm font-medium">{edu.degree}</h3>
            <p className="text-xs text-gray-600">{edu.school}</p>

            {edu.startDate && (
              <p className="mt-1 text-xs font-light text-gray-500">
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
  const { skills } = resumeData;

  if (!skills?.length) return null;

  return (
    <div>
      <h2 className="mb-4 text-center text-xs font-normal uppercase tracking-[0.3em]">
        Kỹ năng
      </h2>

      <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-700">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="inline-block border border-gray-200 px-3 py-1"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
