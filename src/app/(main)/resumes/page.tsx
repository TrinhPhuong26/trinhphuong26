import prisma from "@/lib/prisma";
import { resumeDataInclude } from "@/lib/types";
import { getAuthSession } from "@/lib/auth";
import { Metadata } from "next";
import CreateResumeButton from "./CreateResumeButton";
import ResumeItem from "./ResumeItem";
import TemplatesDialog from "./TemplatesDialog";

export const metadata: Metadata = {
  title: "CV của bạn",
};

export default async function Page() {
  const session = await getAuthSession();

  if (!session) {
    return null;
  }

  const userId = session.id;

  const [resumes, totalCount] = await Promise.all([
    prisma.resume.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: resumeDataInclude,
    }),
    prisma.resume.count({
      where: {
        userId,
      },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-2 md:px-4 lg:px-6 py-6">
      <div className="flex items-center justify-center gap-3 py-12">
        <CreateResumeButton />
        <TemplatesDialog />
      </div>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">CV của bạn</h1>
        <p>Số lượng: {totalCount}</p>
      </div>
      <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {resumes.map((resume) => (
          <ResumeItem key={resume.id} resume={resume} />
        ))}
      </div>
    </main>
  );
}
