"use server";

import prisma from "@/lib/prisma";
import { resumeSchema, ResumeValues } from "@/lib/validation";
import { getAuthSession } from "@/lib/auth";
import { deleteFromBlob, uploadToBlob } from "@/lib/blob-upload";

export async function saveResume(values: ResumeValues) {
  const { id } = values;

  const { photo, workExperiences, educations, projects, hobbies, templateType, ...resumeValues } =
    resumeSchema.parse(values);

  const session = await getAuthSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const userId = session.id;

  const existingResume = id
    ? await prisma.resume.findUnique({ where: { id, userId } })
    : null;

  if (id && !existingResume) {
    throw new Error("Resume not found");
  }

  let newPhotoUrl: string | undefined | null = undefined;

  if (photo instanceof File) {
    if (existingResume?.photoUrl) {
      await deleteFromBlob(existingResume.photoUrl);
    }

    const uploadResult = await uploadToBlob("images/resume_photos", photo);

    newPhotoUrl = uploadResult.url;
  } else if (photo === null) {
    if (existingResume?.photoUrl) {
      await deleteFromBlob(existingResume.photoUrl);
    }
    newPhotoUrl = null;
  }

  if (id) {
    return prisma.resume.update({
      where: { id },
      data: {
        ...resumeValues,
        templateType,
        photoUrl: newPhotoUrl,
        workExperiences: {
          deleteMany: {},
          create: workExperiences?.map((exp) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        },
        educations: {
          deleteMany: {},
          create: educations?.map((edu) => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        },
        projects: {
          deleteMany: {},
          create: projects?.map((proj) => ({
            ...proj,
            startDate: proj.startDate ? new Date(proj.startDate) : undefined,
            endDate: proj.endDate ? new Date(proj.endDate) : undefined,
            techStack: proj.techStack || [],
          })),
        },
        hobbies: {
          deleteMany: {},
          create: hobbies?.map((hobby) => ({
            ...hobby,
          })),
        },
        updatedAt: new Date(),
      },
    });
  } else {
    return prisma.resume.create({
      data: {
        ...resumeValues,
        templateType,
        userId,
        photoUrl: newPhotoUrl,
        workExperiences: {
          create: workExperiences?.map((exp) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        },
        educations: {
          create: educations?.map((edu) => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        },
        projects: {
          create: projects?.map((proj) => ({
            ...proj,
            startDate: proj.startDate ? new Date(proj.startDate) : undefined,
            endDate: proj.endDate ? new Date(proj.endDate) : undefined,
            techStack: proj.techStack || [],
          })),
        },
        hobbies: {
          create: hobbies?.map((hobby) => ({
            ...hobby,
          })),
        },
      },
    });
  }
}
