import { EditorFormProps } from "@/lib/types";
import EducationForm from "./forms/EducationForm";
import GeneralInfoForm from "./forms/GeneralInfoForm";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import SkillsForm from "./forms/SkillsForm";
import SummaryForm from "./forms/SummaryForm";
import WorkExperienceForm from "./forms/WorkExperienceForm";
import ProjectForm from "./forms/ProjectForm";
import HobbyForm from "./forms/HobbyForm";

export const steps: {
  title: string;
  component: React.ComponentType<EditorFormProps>;
  key: string;
}[] = [
  { title: "Thông tin chung", component: GeneralInfoForm, key: "general-info" },
  { title: "Thông tin cá nhân", component: PersonalInfoForm, key: "personal-info" },
  {
    title: "Mục tiêu nghề nghiệp",
    component: SummaryForm,
    key: "career-goals",
  },
  {
    title: "Trình độ học vấn",
    component: EducationForm, 
    key: "education",
  },
  {
    title: "Kinh nghiệm làm việc",
    component: WorkExperienceForm,
    key: "work-experience",
  },
  { 
    title: "Kỹ năng", 
    component: SkillsForm, 
    key: "skills" 
  },
  {
    title: "Dự án",
    component: ProjectForm,
    key: "projects",
  },
  {
    title: "Sở thích",
    component: HobbyForm,
    key: "hobbies",
  },
];
