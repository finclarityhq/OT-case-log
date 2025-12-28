import { config } from 'dotenv';
config();

import '@/ai/flows/clinical-decision-support.ts';
import '@/ai/flows/generate-monthly-descriptive-summaries.ts';
import '@/ai/flows/autosuggest-surgeries.ts';