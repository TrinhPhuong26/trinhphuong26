import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { steps } from "./steps";
import React from "react";

interface BreadcrumbsProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
}

export default function Breadcrumbs({
  currentStep,
  setCurrentStep,
}: BreadcrumbsProps) {
  return (
    <div className="w-full overflow-x-auto px-1 py-2">
      <div className="flex justify-center min-w-max">
        <Breadcrumb className="mb-2">
          <BreadcrumbList className="flex-wrap md:flex-nowrap">
            {steps.map((step) => (
              <React.Fragment key={step.key}>
                <BreadcrumbItem>
                  {step.key === currentStep ? (
                    <BreadcrumbPage className="text-prim font-medium">
                      {step.title}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button 
                        onClick={() => setCurrentStep(step.key)}
                        className="hover:text-prim transition-colors"
                      >
                        {step.title}
                      </button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator className="last:hidden" />
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
