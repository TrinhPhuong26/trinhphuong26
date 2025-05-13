import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditorFormProps } from "@/lib/types";
import { hobbySchema, HobbyValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";

export default function HobbyForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const form = useForm<HobbyValues>({
    resolver: zodResolver(hobbySchema),
    defaultValues: {
      hobbies: resumeData.hobbies || [{}],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "hobbies",
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      // const isValid = await form.trigger();
      // if (!isValid) return;
      const sanitizedValues = {
        ...values,
        hobbies: values.hobbies?.filter(hobby => hobby !== undefined).map(hobby => hobby || {})
      };
      setResumeData({ ...resumeData, ...sanitizedValues });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Sở thích</h2>
        <p className="text-sm text-muted-foreground">
          Thêm các sở thích để hoàn thiện CV của bạn
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
                    name={`hobbies.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên sở thích</FormLabel>
                        <FormControl>
                          <Input placeholder="Đọc sách, Du lịch..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`hobbies.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Mô tả thêm về sở thích..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
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
            onClick={() => append({})}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm sở thích
          </Button>
        </div>
      </Form>
    </div>
  );
} 