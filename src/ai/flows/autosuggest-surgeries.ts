'use server';

/**
 * @fileOverview A flow that suggests frequently used surgeries based on past entries.
 *
 * - suggestSurgeries - A function that handles the suggestion of surgeries.
 * - SuggestSurgeriesInput - The input type for the suggestSurgeries function.
 * - SuggestSurgeriesOutput - The return type for the suggestSurgeries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSurgeriesInputSchema = z.object({
  specialty: z.string().describe('The surgical specialty (e.g., Urology, General Surgery).'),
  caseHistory: z.array(z.string()).describe('An array of previously entered surgery types.'),
});
export type SuggestSurgeriesInput = z.infer<typeof SuggestSurgeriesInputSchema>;

const SuggestSurgeriesOutputSchema = z.array(z.string()).describe('An array of suggested surgery types.');
export type SuggestSurgeriesOutput = z.infer<typeof SuggestSurgeriesOutputSchema>;

export async function suggestSurgeries(input: SuggestSurgeriesInput): Promise<SuggestSurgeriesOutput> {
  return suggestSurgeriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSurgeriesPrompt',
  input: {schema: SuggestSurgeriesInputSchema},
  output: {schema: SuggestSurgeriesOutputSchema},
  prompt: `You are an AI assistant specialized in suggesting surgery types based on the surgical specialty and case history.

  Given the surgical specialty: {{{specialty}}}
  And the following case history: {{#each caseHistory}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Suggest up to 5 surgery types that are most relevant and frequently used in the given specialty, based on the case history.
  Return the suggestions as a JSON array of strings.
  Ensure the suggestions are relevant to the specialty and consider the frequency of surgery types in the case history.  Do not suggest the same surgery more than once.
  If the case history is empty or the specialty is not provided, suggest common surgeries for that specialty.
  `,
});

const suggestSurgeriesFlow = ai.defineFlow(
  {
    name: 'suggestSurgeriesFlow',
    inputSchema: SuggestSurgeriesInputSchema,
    outputSchema: SuggestSurgeriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
