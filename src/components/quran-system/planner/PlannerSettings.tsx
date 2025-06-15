
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { DayOfWeek, PlannerSettingsData } from '@/hooks/use-memorization-planner';
import { AlreadyMemorizedManager } from './AlreadyMemorizedManager';
import { useToast } from '@/components/ui/use-toast';

const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formSchema = z.object({
  linesPerDay: z.coerce.number().min(1, 'Must be at least 1 line per day.'),
  daysOfWeek: z.array(z.string()).min(1, 'Select at least one day.'),
  juzOrder: z.enum(['sequential', 'reverse']),
  startDate: z.date(),
});

export const PlannerSettings = ({ settings, onSettingsChange, onGeneratePlan, alreadyMemorized, onAlreadyMemorizedChange }: { settings: PlannerSettingsData, onSettingsChange: (settings: PlannerSettingsData) => void, onGeneratePlan: () => void, alreadyMemorized: number[], onAlreadyMemorizedChange: (juz: number[]) => void }) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...settings,
      startDate: parseISO(settings.startDate),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSettingsChange({
      ...values,
      startDate: values.startDate.toISOString(),
      daysOfWeek: values.daysOfWeek as DayOfWeek[],
    });
    onGeneratePlan();
    toast({
        title: "Plan Updated",
        description: "Your memorization schedule has been generated.",
    })
  }

  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Planner Settings</CardTitle>
        <CardDescription>Configure your memorization plan.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="linesPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lines Per Day</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="daysOfWeek"
              render={() => (
                <FormItem>
                  <FormLabel>Memorization Days</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {days.map((day) => (
                      <FormField
                        key={day}
                        control={form.control}
                        name="daysOfWeek"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, day])
                                    : field.onChange(field.value?.filter((value) => value !== day));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{day}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="juzOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Juz Order</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select order" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential (1-30)</SelectItem>
                      <SelectItem value="reverse">Reverse (30-1)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Save & Generate Plan</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    <AlreadyMemorizedManager alreadyMemorized={alreadyMemorized} onAlreadyMemorizedChange={onAlreadyMemorizedChange} />
    </div>
  );
};
