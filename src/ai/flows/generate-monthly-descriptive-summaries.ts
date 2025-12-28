'use server';

/**
 * @fileOverview Generates descriptive monthly summaries of case logs, including case volumes, ASA grades, and anesthesia techniques.
 *
 * - generateMonthlyDescriptiveSummaries - A function that handles the generation of monthly descriptive summaries.
 * - GenerateMonthlyDescriptiveSummariesInput - The input type for the generateMonthlyDescriptiveSummaries function.
 * - GenerateMonthlyDescriptiveSummariesOutput - The return type for the generateMonthlyDescriptiveSummaries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMonthlyDescriptiveSummariesInputSchema = z.object({
  caseLogs: z.string().describe('A JSON string containing an array of case log objects.'),
  month: z.string().describe('The month for which to generate the summary (e.g., January, February).'),
  year: z.string().describe('The year for which to generate the summary (e.g., 2024).'),
});
export type GenerateMonthlyDescriptiveSummariesInput = z.infer<
  typeof GenerateMonthlyDescriptiveSummariesInputSchema
>;

const GenerateMonthlyDescriptiveSummariesOutputSchema = z.object({
  summary: z.string().describe('A descriptive summary of the case logs for the specified month and year.'),
});
export type GenerateMonthlyDescriptiveSummariesOutput = z.infer<
  typeof GenerateMonthlyDescriptiveSummariesOutputSchema
>;

export async function generateMonthlyDescriptiveSummaries(
  input: GenerateMonthlyDescriptiveSummariesInput
): Promise<GenerateMonthlyDescriptiveSummariesOutput> {
  return generateMonthlyDescriptiveSummariesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMonthlyDescriptiveSummariesPrompt',
  input: {schema: GenerateMonthlyDescriptiveSummariesInputSchema},
  output: {schema: GenerateMonthlyDescriptiveSummariesOutputSchema},
  prompt: `You are an expert anesthesiologist providing descriptive monthly summaries of case logs.

  Given the following case logs for the month of {{month}} in {{year}}, generate a descriptive summary including case volumes, common ASA grades, and anesthesia techniques used.  Focus on providing insights into practice patterns without making diagnostic or therapeutic recommendations.

  Case Logs: {{{caseLogs}}}
  Month: {{month}}
  Year: {{year}}`,
});

const generateMonthlyDescriptiveSummariesFlow = ai.defineFlow(
  {
    name: 'generateMonthlyDescriptiveSummariesFlow',
    inputSchema: GenerateMonthlyDescriptiveSummariesInputSchema,
    outputSchema: GenerateMonthlyDescriptiveSummariesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
