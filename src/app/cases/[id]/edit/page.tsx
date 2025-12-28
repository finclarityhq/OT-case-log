
'use client';

import {
  updateCaseLog,
  getSurgerySuggestions,
  getClinicalAlert,
} from '@/lib/actions';
import PageHeader from '@/components/page-header';
import { notFound } from 'next/navigation';
import CaseForm from '@/components/cases/case-form';
import { CaseLog } from '@/lib/types';
import AuthGuard from '@/components/auth/auth-guard';
import { Loader2 } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, query, orderBy, Timestamp } from 'firebase/firestore';


// Helper to convert Firestore Timestamps to Dates in a CaseLog object
function convertTimestamps(
  data: Omit<CaseLog, 'id' | 'date' | 'createdAt'> & {
    date: Timestamp;
    createdAt: Timestamp;
  }
): Omit<CaseLog, 'id'> {
  return {
    ...data,
    date: data.date.toDate(),
    createdAt: data.createdAt.toDate(),
  };
}


function EditCasePageClient({
  userId,
  caseId,
}: {
  userId: string;
  caseId: string;
}) {
  const firestore = useFirestore();

  const caseDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', userId, 'cases', caseId) : null),
    [firestore, userId, caseId]
  );
  const { data: caseData, isLoading: isLoadingCase } = useDoc<any>(caseDocRef);
  
  // Convert Firestore Timestamps to JS Dates
  const caseLog: CaseLog | null = caseData ? {
    id: caseData.id,
    ...convertTimestamps(caseData)
  } as CaseLog : null;
  
  const allCasesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users', userId, 'cases'), orderBy('createdAt', 'desc')) : null),
    [firestore, userId]
  );
  const { data: allCases, isLoading: isLoadingAllCases } = useCollection<CaseLog>(allCasesQuery);
  
  const isLoading = isLoadingCase || isLoadingAllCases;

  const handleUpdate = async (data: Omit<CaseLog, 'id' | 'createdAt'>) => {
    return updateCaseLog(userId, caseId, data);
  };

  const handleGetSurgerySuggestions = (specialty: string) => {
    const caseHistory = (allCases || []).filter(c => c.specialty === specialty).map(c => c.surgeryType);
    return getSurgerySuggestions(userId, specialty, caseHistory);
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!caseLog) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Edit Case"
        description={`Editing case for patient ${caseLog.patientId}`}
      />
      <CaseForm
        initialData={caseLog}
        onSave={handleUpdate}
        getSurgerySuggestions={handleGetSurgerySuggestions}
        getClinicalAlert={getClinicalAlert}
      />
    </div>
  );
}

export default function EditCasePage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      {userId => <EditCasePageClient userId={userId} caseId={params.id} />}
    </AuthGuard>
  );
}
