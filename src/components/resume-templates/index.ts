import BlankTemplate from "./BlankTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";
import CreativeTemplate from "./CreativeTemplate";
import MinimalTemplate from "./MinimalTemplate";
import { TemplateType } from "./types";

// Map template types to component
export const templateComponents = {
  [TemplateType.BLANK]: BlankTemplate,
  [TemplateType.PROFESSIONAL]: ProfessionalTemplate,
  [TemplateType.CREATIVE]: CreativeTemplate,
  [TemplateType.MINIMAL]: MinimalTemplate,
};

export {
  BlankTemplate,
  ProfessionalTemplate,
  CreativeTemplate,
  MinimalTemplate,
};
export * from "./types";
