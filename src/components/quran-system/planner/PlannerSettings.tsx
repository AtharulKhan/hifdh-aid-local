
import React, { useState, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, GripVertical } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { DayOfWeek, PlannerSettingsData, AlreadyMemorizedData } from '@/hooks/use-memorization-planner';
import { AlreadyMemorizedManager } from './AlreadyMemorizedManager';
import { useToast } from '@/components/ui/use-toast';
import { CustomJuzOrder } from './CustomJuzOrder';
import { CustomSurahOrder } from './CustomSurahOrder';

const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formSchema = z.object({
  linesPerDay: z.coerce.number().min(1, 'Must be at least 1 line per day.'),
  daysOfWeek: z.array(z.string()).min(1, 'Select at least one day.'),
  juzOrder: z.enum(['sequential', 'reverse', 'custom']),
  surahOrder: z.enum(['sequential', 'reverse', 'custom']),
  orderType: z.enum(['juz', 'surah']),
  startDate: z.date(),
  customJuzOrder: z.array(z.number()).optional(),
  customSurahOrder: z.array(z.number()).optional(),
});

export const PlannerSettings = ({
  settings,
  onSettingsChange,
  onGeneratePlan,
  alreadyMemorized,
}: {
  settings: PlannerSettingsData & { 
    customJuzOrder?: number[];
    customSurahOrder?: number[];
    surahOrder?: 'sequential' | 'reverse' | 'custom';
    orderType?: 'juz' | 'surah';
  };
  onSettingsChange: (settings: PlannerSettingsData & { 
    customJuzOrder?: number[];
    customSurahOrder?: number[];
    surahOrder?: 'sequential' | 'reverse' | 'custom';
    orderType?: 'juz' | 'surah';
  }) => void;
  onGeneratePlan: () => void;
  alreadyMemorized: AlreadyMemorizedData;
}) => {
  const { toast } = useToast();
  
  // Load custom orders from localStorage on component mount
  const [customJuzOrder, setCustomJuzOrder] = useState<number[]>(() => {
    const savedJuzOrder = localStorage.getItem('customJuzOrder');
    if (savedJuzOrder) {
      try {
        return JSON.parse(savedJuzOrder);
      } catch (error) {
        console.error('Error parsing customJuzOrder from localStorage:', error);
      }
    }
    return settings.customJuzOrder || Array.from({ length: 30 }, (_, i) => i + 1);
  });

  const [customSurahOrder, setCustomSurahOrder] = useState<number[]>(() => {
    const savedSurahOrder = localStorage.getItem('customSurahOrder');
    if (savedSurahOrder) {
      try {
        return JSON.parse(savedSurahOrder);
      } catch (error) {
        console.error('Error parsing customSurahOrder from localStorage:', error);
      }
    }
    return settings.customSurahOrder || Array.from({ length: 114 }, (_, i) => i + 1);
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...settings,
      orderType: settings.orderType || 'juz',
      surahOrder: settings.surahOrder || 'sequential',
      startDate: parseISO(settings.startDate),
      customJuzOrder,
      customSurahOrder,
    },
  });

  const watchedJuzOrder = form.watch('juzOrder');
  const watchedSurahOrder = form.watch('surahOrder');
  const watchedOrderType = form.watch('orderType');

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSettingsChange({
      linesPerDay: values.linesPerDay,
      daysOfWeek: values.daysOfWeek as DayOfWeek[],
      juzOrder: values.juzOrder,
      surahOrder: values.surahOrder,
      orderType: values.orderType,
      startDate: values.startDate.toISOString(),
      customJuzOrder: values.juzOrder === 'custom' ? customJuzOrder : undefined,
      customSurahOrder: values.surahOrder === 'custom' ? customSurahOrder : undefined,
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
              name="orderType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Order By</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="juz" id="juz" />
                        <FormLabel htmlFor="juz" className="font-normal">
                          Juz Order
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="surah" id="surah" />
                        <FormLabel htmlFor="surah" className="font-normal">
                          Surah Order
                        </FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedOrderType === 'juz' && (
              <FormField
                control={form.control}
                name="juzOrder"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Juz Order</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sequential" id="juz-sequential" />
                          <FormLabel htmlFor="juz-sequential" className="font-normal">
                            Sequential (1-30)
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="reverse" id="juz-reverse" />
                          <FormLabel htmlFor="juz-reverse" className="font-normal">
                            Reverse (30-1)
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="juz-custom" />
                          <FormLabel htmlFor="juz-custom" className="font-normal">
                            Custom Juz Order
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchedOrderType === 'surah' && (
              <FormField
                control={form.control}
                name="surahOrder"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Surah Order</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sequential" id="surah-sequential" />
                          <FormLabel htmlFor="surah-sequential" className="font-normal">
                            Sequential (1-114)
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="reverse" id="surah-reverse" />
                          <FormLabel htmlFor="surah-reverse" className="font-normal">
                            Reverse (114-1)
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="surah-custom" />
                          <FormLabel htmlFor="surah-custom" className="font-normal">
                            Custom Surah Order
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchedOrderType === 'juz' && watchedJuzOrder === 'custom' && (
              <div className="space-y-4">
                <FormLabel>Custom Juz Order</FormLabel>
                <FormDescription>
                  Drag and drop to reorder the Juz according to your preference. Juz that you've already memorized will be excluded from the schedule.
                </FormDescription>
                <CustomJuzOrder
                  juzOrder={customJuzOrder}
                  onOrderChange={setCustomJuzOrder}
                  alreadyMemorized={alreadyMemorized}
                />
              </div>
            )}

            {watchedOrderType === 'surah' && watchedSurahOrder === 'custom' && (
              <div className="space-y-4">
                <FormLabel>Custom Surah Order</FormLabel>
                <FormDescription>
                  Drag and drop to reorder the Surahs according to your preference. Surahs that you've already memorized will be excluded from the schedule.
                </FormDescription>
                <CustomSurahOrder
                  surahOrder={customSurahOrder}
                  onOrderChange={setCustomSurahOrder}
                  alreadyMemorized={alreadyMemorized}
                />
              </div>
            )}

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
    <AlreadyMemorizedManager alreadyMemorized={alreadyMemorized} />
    </div>
  );
};
