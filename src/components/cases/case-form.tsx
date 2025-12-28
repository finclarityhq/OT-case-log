
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CalendarIcon,
  CheckIcon,
  ChevronsUpDown,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CaseLog } from '@/lib/types';
import {
  ASA_GRADES,
  SEX_OPTIONS,
  COMORBIDITIES_OPTIONS,
  SURGICAL_SPECIALTIES,
  PATIENT_POSITIONS,
  ANESTHESIA_TECHNIQUES,
  HEMODYNAMIC_STATUS_OPTIONS,
  COMPLICATION_OPTIONS,
  POST_OP_ANALGESIA_OPTIONS,
  BLOCK_SIDE_OPTIONS,
  COMMON_SURGERIES_BY_SPECIALTY,
} from '@/lib/constants';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';

const formSchema = z.object({
  date: z.date({ required_error: 'Date of surgery is required.' }),
  location: z.string().optional(),
  isEmergency: z.boolean().default(false),
  patientId: z.string().min(1, 'Patient ID / MRN is required.'),
  age: z.coerce.number().min(0).max(120),
  sex: z.enum(SEX_OPTIONS),
  asaGrade: z.enum(ASA_GRADES),
  comorbidities: z.array(z.string()).default([]),
  specialty: z.string().min(1, 'Specialty is required.'),
  surgeryType: z.string().min(1, 'Surgery type is required.'),
  patientPosition: z.enum(PATIENT_POSITIONS),
  anesthesiaTechnique: z.string().min(1, 'Anesthesia technique is required.'),
  hasAdjuvants: z.boolean().default(false),
  adjuvantDetails: z.string().optional(),
  blockType: z.string().optional(),
  blockLevel: z.string().optional(),
  blockSide: z.enum(BLOCK_SIDE_OPTIONS).optional(),
  isUltrasoundGuided: z.boolean().default(false),
  localAnesthetic: z.string().optional(),
  duration: z.coerce.number().min(1, 'Duration is required.'),
  hemodynamicStatus: z.enum(HEMODYNAMIC_STATUS_OPTIONS),
  hasAirwayDifficulty: z.boolean().default(false),
  complications: z.array(z.string()).default([]),
  postOpAnalgesia: z.enum(POST_OP_ANALGESIA_OPTIONS),
  rescueAnalgesiaRequired: z.boolean().default(false),
  notes: z.string().optional(),
});

type CaseFormValues = z.infer<typeof formSchema>;

interface CaseFormProps {
  initialData?: CaseLog;
  onSave: (
    data: Omit<CaseLog, 'id' | 'createdAt'>
  ) => Promise<{ success: boolean; caseId: string }>;
  getSurgerySuggestions: (specialty: string) => Promise<string[]>;
  getClinicalAlert: (
    asaGrade: any,
    anesthesiaTechnique: string
  ) => Promise<string | null>;
}

export default function CaseForm({
  initialData,
  onSave,
  getSurgerySuggestions,
  getClinicalAlert,
}: CaseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [clinicalAlert, setClinicalAlert] = useState<string | null>(null);
  const [lastUsedTechnique, setLastUsedTechnique] = useLocalStorage<string | null>(
    'lastAnesthesiaTechnique',
    null
  );

  const defaultValues = initialData
    ? {
        ...initialData,
        date: new Date(initialData.date), // Ensure date is a Date object
        blockType: initialData.blockDetails?.type,
        blockLevel: initialData.blockDetails?.level,
        blockSide: initialData.blockDetails?.side,
        isUltrasoundGuided: initialData.blockDetails?.isUltrasoundGuided,
        localAnesthetic: initialData.blockDetails?.localAnesthetic,
      }
    : {
        date: new Date(),
        isEmergency: false,
        sex: 'Male' as const,
        asaGrade: 'I' as const,
        patientPosition: 'Supine' as const,
        anesthesiaTechnique: lastUsedTechnique || ANESTHESIA_TECHNIQUES[0],
        hemodynamicStatus: 'Stable' as const,
        postOpAnalgesia: 'Adequate' as const,
        comorbidities: [],
        complications: [],
      };

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const specialty = form.watch('specialty');
  const asaGrade = form.watch('asaGrade');
  const anesthesiaTechnique = form.watch('anesthesiaTechnique');
  const isRegional = [
    'Spinal',
    'Epidural',
    'CSE',
    'Paravertebral Block',
    'Peripheral Nerve Block',
  ].includes(anesthesiaTechnique);

  const handleFetchSuggestions = useCallback(async (currentSpecialty: string) => {
    if (!currentSpecialty) return;
    setIsSuggesting(true);
    try {
      // Get base suggestions from the constants file
      const baseSuggestions = COMMON_SURGERIES_BY_SPECIALTY[currentSpecialty] || [];
      
      // Fetch AI-powered suggestions
      const aiSuggestions = await getSurgerySuggestions(currentSpecialty);

      // Combine and deduplicate
      const combined = [...baseSuggestions, ...aiSuggestions];
      const uniqueSuggestions = Array.from(new Set(combined));

      setSuggestions(uniqueSuggestions);
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Suggestion Error',
        description: 'Could not fetch surgery suggestions.',
      });
      // Fallback to base suggestions if AI fails
      setSuggestions(COMMON_SURGERIES_BY_SPECIALTY[currentSpecialty] || []);
    } finally {
      setIsSuggesting(false);
    }
  }, [getSurgerySuggestions, toast]);

  useEffect(() => {
    if (specialty) {
      handleFetchSuggestions(specialty);
    }
  }, [specialty, handleFetchSuggestions]);

  useEffect(() => {
    const checkClinicalAlert = async () => {
      if (asaGrade && anesthesiaTechnique) {
        const alert = await getClinicalAlert(asaGrade, anesthesiaTechnique);
        setClinicalAlert(alert);
      }
    };
    checkClinicalAlert();
  }, [asaGrade, anesthesiaTechnique, getClinicalAlert]);

  async function onSubmit(data: CaseFormValues) {
    setIsLoading(true);
    setLastUsedTechnique(data.anesthesiaTechnique);
    const caseLogData: Omit<CaseLog, 'id' | 'createdAt'> = {
      ...data,
      blockDetails: isRegional
        ? {
            type: data.blockType || '',
            level: data.blockLevel || '',
            side: data.blockSide || 'Left',
            isUltrasoundGuided: data.isUltrasoundGuided || false,
            localAnesthetic: data.localAnesthetic || '',
          }
        : undefined,
    };
    try {
      const result = await onSave(caseLogData);
      if (result.success) {
        toast({
          title: 'Success!',
          description: `Case ${
            initialData ? 'updated' : 'saved'
          } successfully.`,
        });
        router.push(`/cases/${result.caseId}`);
        // No router.refresh needed as revalidatePath is used in server action
      } else {
        throw new Error('Save operation failed');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem saving the case.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Case Metadata & Patient Demographics */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Core Details</CardTitle>
              <CardDescription>
                Essential case and patient information.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Surgery</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient ID / MRN</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MRN12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 54" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient's sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SEX_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OT / Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., OT 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isEmergency"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Emergency</FormLabel>
                      <FormDescription>
                        Was this an emergency case?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pre-Anesthetic Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="asaGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ASA Grade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ASA grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ASA_GRADES.map(option => (
                          <SelectItem key={option} value={option}>
                            ASA {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comorbidities"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Comorbidities</FormLabel>
                    </div>
                    <div className="space-y-2">
                      {COMORBIDITIES_OPTIONS.map(item => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="comorbidities"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={checked => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            item,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              value => value !== item
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Surgical and Anesthesia Details */}
        <Card>
          <CardHeader>
            <CardTitle>Surgical &amp; Anesthesia Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialty</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a specialty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SURGICAL_SPECIALTIES.map(s => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surgeryType"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Surgery Type</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value || 'Select surgery'}
                           {isSuggesting ? <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search or type surgery..."
                          onValueChange={value => field.onChange(value)}
                        />
                        <CommandList>
                          <CommandEmpty>No surgery found.</CommandEmpty>
                          <CommandGroup>
                            {suggestions.map(suggestion => (
                              <CommandItem
                                value={suggestion}
                                key={suggestion}
                                onSelect={() => {
                                  form.setValue('surgeryType', suggestion);
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    suggestion === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {suggestion}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    AI suggestions based on specialty. You can also type a custom one.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="patientPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Position</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PATIENT_POSITIONS.map(s => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="anesthesiaTechnique"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Technique</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select technique" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ANESTHESIA_TECHNIQUES.map(s => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {clinicalAlert && (
              <Alert className="md:col-span-2 lg:col-span-3">
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Clinical Suggestion</AlertTitle>
                <AlertDescription>{clinicalAlert}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Regional / Block Details (Conditional) */}
        {isRegional && (
          <Card>
            <CardHeader>
              <CardTitle>Regional / Block Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="blockType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block Type</FormLabel>
                    <Input placeholder="e.g., Femoral" {...field} value={field.value || ''} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="blockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level &amp; Side</FormLabel>
                    <div className="flex gap-2">
                       <Input placeholder="e.g., L3-L4" {...form.register("blockLevel")} className="w-1/2" value={form.getValues("blockLevel") || ''} />
                       <FormField
                          control={form.control}
                          name="blockSide"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-1/2">
                                  <SelectValue placeholder="Side" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BLOCK_SIDE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        />
                    </div>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="isUltrasoundGuided"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ultrasound</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="localAnesthetic"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Local Anesthetic &amp; Dose</FormLabel>
                    <Input placeholder="e.g., Bupivacaine 0.5% 15mg" {...field} value={field.value || ''}/>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Course, Complications & Post-Op */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Intraoperative Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration of Anesthesia (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hemodynamicStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hemodynamic Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HEMODYNAMIC_STATUS_OPTIONS.map(s => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hasAirwayDifficulty"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Airway Difficulty
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complications &amp; Post-Op</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="complications"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Complications</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {COMPLICATION_OPTIONS.map(item => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="complications"
                          render={({ field }) => (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={checked => {
                                    return checked
                                      ? field.onChange([...field.value, item])
                                      : field.onChange(
                                          field.value?.filter(
                                            value => value !== item
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item}
                              </FormLabel>
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
                name="postOpAnalgesia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postoperative Analgesia</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select analgesia status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {POST_OP_ANALGESIA_OPTIONS.map(s => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="rescueAnalgesiaRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Rescue Analgesia</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Any additional remarks, teaching points, or audit notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Interesting case of..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update Case' : 'Save Case'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
