
'use server';

import {
  collection,
  doc,
  addDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { CaseLog } from './types';
import { suggestSurgeries } from '@/ai/flows/autosuggest-surgeries';
import { clinicalDecisionSupport } from '@/ai/flows/clinical-decision-support';
import { revalidatePath } from 'next/cache';

export async function getSurgerySuggestions(
  userId: string,
  specialty: string,
  caseHistory: string[]
): Promise<string[]> {
  try {
    const suggestions = await suggestSurgeries({ specialty, caseHistory });
    return suggestions;
  } catch (error) {
    console.error('Error getting surgery suggestions:', error);
    return [];
  }
}

export async function getClinicalAlert(
  asaGrade: 'I' | 'II' | 'III' | 'IV' | 'V',
  anesthesiaTechnique: string
) {
  try {
    const result = await clinicalDecisionSupport({
      asaGrade,
      anesthesiaTechnique,
    });
    return result.alert;
  } catch (error) {
    console.error('Error getting clinical alert:', error);
    return null;
  }
}

export async function saveCaseLog(
  userId: string,
  caseData: Omit<CaseLog, 'id' | 'createdAt'>
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const casesCollection = collection(db, 'users', userId, 'cases');
  const docRef = await addDoc(casesCollection, {
    ...caseData,
    userId,
    createdAt: Timestamp.now(),
  });
  revalidatePath('/cases');
  revalidatePath('/');
  return { success: true, caseId: docRef.id };
}

export async function updateCaseLog(
  userId: string,
  caseId: string,
  caseData: Omit<CaseLog, 'id' | 'createdAt'>
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const caseDocRef = doc(db, 'users', userId, 'cases', caseId);
  // In Firestore, you can't store `undefined` values from the client SDKs.
  // We need to clean the object of any `undefined` properties.
  const cleanedData = Object.fromEntries(
    Object.entries(caseData).filter(([_, v]) => v !== undefined)
  );
  await updateDoc(caseDocRef, cleanedData);
  revalidatePath(`/cases/${caseId}`);
  revalidatePath('/cases');
  revalidatePath('/');
  return { success: true, caseId: caseId };
}
