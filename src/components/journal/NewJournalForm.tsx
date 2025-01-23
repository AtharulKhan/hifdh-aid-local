import React from "react";
import { useForm } from "react-hook-form";
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
import { useJournalStore } from "@/store/useJournalStore";
import { DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface JournalFormData {
  title: string;
  description: string;
  content: string;
  tags: string;
}

export function NewJournalForm() {
  const { toast } = useToast();
  const addJournal = useJournalStore((state) => state.addJournal);
  
  const form = useForm<JournalFormData>({
    defaultValues: {
      title: "",
      description: "",
      content: "",
      tags: "",
    },
  });

  const onSubmit = (data: JournalFormData) => {
    const tags = data.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    
    addJournal({
      title: data.title,
      description: data.description,
      content: data.content,
      tags,
    });

    toast({
      title: "Success",
      description: "Journal entry created successfully",
    });
    
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write your journal entry here..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter tags separated by commas"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Create Entry</Button>
        </div>
      </form>
    </Form>
  );
}