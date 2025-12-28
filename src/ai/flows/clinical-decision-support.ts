'use server';

/**
 * @fileOverview Clinical decision support flow to provide soft, non-judgmental alerts for unusual ASA–technique combinations.
 *
 * - clinicalDecisionSupport - A function that handles the clinical decision support process.
 * - ClinicalDecisionSupportInput - The input type for the clinicalDecisionSupport function.
 * - ClinicalDecisionSupportOutput - The return type for the clinicalDecisionSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClinicalDecisionSupportInputSchema = z.object({
  asaGrade: z
    .enum(['I', 'II', 'III', 'IV', 'V'])
    .describe('The ASA grade of the patient.'),
  anesthesiaTechnique: z
    .string()
    .describe('The anesthesia technique used.'),
});

export type ClinicalDecisionSupportInput = z.infer<
  typeof ClinicalDecisionSupportInputSchema
>;

const ClinicalDecisionSupportOutputSchema = z.object({
  alert: z
    .string()
    .describe(
      'A soft, non-judgmental alert message if the ASA–technique combination is unusual, otherwise null.'
    )
    .nullable(),
});

export type ClinicalDecisionSupportOutput = z.infer<
  typeof ClinicalDecisionSupportOutputSchema
>;

export async function clinicalDecisionSupport(
  input: ClinicalDecisionSupportInput
): Promise<ClinicalDecisionSupportOutput> {
  return clinicalDecisionSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clinicalDecisionSupportPrompt',
  input: {schema: ClinicalDecisionSupportInputSchema},
  output: {schema: ClinicalDecisionSupportOutputSchema},
  prompt: `You are an expert medical advisor providing clinical decision support to anesthesiologists. Your role is to review the provided ASA grade and anesthesia technique and provide a soft, non-judgmental alert if the combination is unusual.

  Here are some example scenarios where an alert should be raised:
  - ASA grade is V and the anesthesia technique is MAC/Sedation.
  - ASA grade is I and the anesthesia technique is Spinal.

  If the ASA–technique combination is unusual, provide a brief, non-judgmental alert message. Otherwise, return null.

  ASA Grade: {{{asaGrade}}}
  Anesthesia Technique: {{{anesthesiaTechnique}}}`,
});

const clinicalDecisionSupportFlow = ai.defineFlow(
  {
    name: 'clinicalDecisionSupportFlow',
    inputSchema: ClinicalDecisionSupportInputSchema,
    outputSchema: ClinicalDecisionSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
