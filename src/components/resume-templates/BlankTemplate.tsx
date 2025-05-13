"use client";

import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton";
import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { ResumeTemplateProps, SectionProps } from "./types";
import useDimensions from "@/hooks/useDimensions";

export default function BlankTemplate({
  resumeData,
  contentRef,
  className,
}: ResumeTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useDimensions(containerRef);

  return (
    <div
      className={cn(
        "print-resume aspect-[210/297] h-fit w-full bg-white text-black",
        className,
      )}
      ref={containerRef}
    >
      <div
        className={cn("space-y-6 p-6", !width && "invisible")}
        style={{
          zoom: (1 / 794) * width,
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
          colorAdjust: "exact",
        }}
        ref={contentRef}
        id="resumePreviewContent"
      >
        <PersonalInfoHeader resumeData={resumeData} />
        <SummarySection resumeData={resumeData} />
        <EducationSection resumeData={resumeData} />
        <WorkExperienceSection resumeData={resumeData} />
        <SkillsSection resumeData={resumeData} />
        <ProjectsSection resumeData={resumeData} />
        <HobbiesSection resumeData={resumeData} />
      </div>
    </div>
  );
}

function PersonalInfoHeader({ resumeData }: SectionProps) {
  const {
    photo,
    firstName,
    lastName,
    jobTitle,
    city,
    country,
    phone,
    email,
    colorHex,
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
    <div className="flex items-center gap-6">
      {photoSrc && (
        <Image
          src={photoSrc}
          width={100}
          height={100}
          alt="Author photo"
          className="aspect-square object-cover"
          style={{
            borderRadius:
              borderStyle === BorderStyles.SQUARE
                ? "0px"
                : borderStyle === BorderStyles.CIRCLE
                  ? "9999px"
                  : "10%",
          }}
        />
      )}
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p
            className="text-3xl font-bold"
            style={{
              color: colorHex,
            }}
          >
            {firstName} {lastName}
          </p>
          <p
            className="font-medium"
            style={{
              color: colorHex,
            }}
          >
            {jobTitle}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {city}
          {city && country ? ", " : ""}
          {country}
          {(city || country) && (phone || email) ? " • " : ""}
          {[phone, email].filter(Boolean).join(" • ")}
        </p>
      </div>
    </div>
  );
}

function SummarySection({ resumeData }: SectionProps) {
  const { summary, colorHex } = resumeData;

  if (!summary) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="break-inside-avoid space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Mục tiêu nghề nghiệp
        </p>
        <div className="whitespace-pre-line text-sm">{summary}</div>
      </div>
    </>
  );
}

function WorkExperienceSection({ resumeData }: SectionProps) {
  const { workExperiences, colorHex } = resumeData;

  const workExperiencesArray = workExperiences || [];

  const workExperiencesNotEmpty = workExperiencesArray.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  );

  if (!workExperiencesNotEmpty?.length) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Kinh nghiệm làm việc
        </p>
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{
                color: colorHex,
              }}
            >
              <span>{exp.position}</span>
              {exp.startDate && (
                <span>
                  {formatDate(new Date(exp.startDate), "MM/yyyy")} -{" "}
                  {exp.endDate
                    ? formatDate(new Date(exp.endDate), "MM/yyyy")
                    : "Hiện tại"}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{exp.company}</p>
            <div className="whitespace-pre-line text-xs">{exp.description}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function EducationSection({ resumeData }: SectionProps) {
  const { educations, colorHex } = resumeData;

  const educationsArray = educations || [];

  const educationsNotEmpty = educationsArray.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0,
  );

  if (!educationsNotEmpty?.length) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Học vấn
        </p>
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{
                color: colorHex,
              }}
            >
              <span>{edu.degree}</span>
              {edu.startDate && (
                <span>
                  {edu.startDate &&
                    `${formatDate(new Date(edu.startDate), "MM/yyyy")} ${
                      edu.endDate
                        ? `- ${formatDate(new Date(edu.endDate), "MM/yyyy")}`
                        : ""
                    }`}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{edu.school}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function SkillsSection({ resumeData }: SectionProps) {
  const { skills, colorHex } = resumeData;

  if (!skills?.length) return null;

  const safeColorHex = colorHex || "#000000";
  
  const getTextColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: safeColorHex,
        }}
      />
      <div className="space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: safeColorHex,
          }}
        >
          Kỹ năng
        </p>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: safeColorHex,
                color: getTextColor(safeColorHex),
                borderColor: safeColorHex,
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </>
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
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Dự án
        </p>
        {projectsNotEmpty.map((proj, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{
                color: colorHex,
              }}
            >
              <span>{proj.name}</span>
              {proj.startDate && (
                <span>
                  {formatDate(new Date(proj.startDate), "MM/yyyy")} -{" "}
                  {proj.endDate
                    ? formatDate(new Date(proj.endDate), "MM/yyyy")
                    : "Hiện tại"}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{proj.role}</p>
            <div className="whitespace-pre-line text-xs">{proj.description}</div>
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
    </>
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
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Sở thích
        </p>
        <div className="space-y-2">
          {hobbiesNotEmpty.map((hobby, index) => (
            <div key={index} className="break-inside-avoid">
              {hobby.name && (
                <p className="text-sm font-medium">{hobby.name}</p>
              )}
              {hobby.description && (
                <p className="text-xs text-gray-600">{hobby.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
