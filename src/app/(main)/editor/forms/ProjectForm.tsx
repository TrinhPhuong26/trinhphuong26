import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditorFormProps } from "@/lib/types";
import { projectSchema, ProjectValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import SkillInput from "@/components/SkillInput";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const form = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projects: resumeData.projects || [{ techStack: [] }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      // const isValid = await form.trigger();
      // if (!isValid) return;
      const sanitizedValues = {
        ...values,
        projects: values.projects?.filter(project => project !== undefined)
          .map(project => ({
            ...project,
            techStack: (project?.techStack || []).filter((tech): tech is string => 
              typeof tech === 'string' && tech !== undefined)
          }))
      };
      setResumeData({ ...resumeData, ...sanitizedValues });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Dự án</h2>
        <p className="text-sm text-muted-foreground">
          Thêm các dự án để thể hiện kỹ năng và kinh nghiệm của bạn
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="relative">
              <div className="absolute right-3 top-3">
                {fields.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(index)}
                  >
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`projects.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên dự án</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên dự án..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`projects.${index}.role`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vai trò của bạn</FormLabel>
                        <FormControl>
                          <Input placeholder="Frontend Developer..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`projects.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Ngày bắt đầu</FormLabel>
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) =>
                              field.onChange(
                                date ? date.toISOString().split("T")[0] : "",
                              )
                            }
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`projects.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Ngày kết thúc</FormLabel>
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) =>
                              field.onChange(
                                date ? date.toISOString().split("T")[0] : "",
                              )
                            }
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`projects.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Mô tả dự án và trách nhiệm của bạn..."
                            className="min-h-32 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`projects.${index}.techStack`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Công nghệ sử dụng</FormLabel>
                        <FormControl>
                          <SkillInput
                            value={field.value || []}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Nhập công nghệ và nhấn Enter để thêm
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => append({ techStack: [] })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm dự án
          </Button>
        </div>
      </Form>
    </div>
  );
} 