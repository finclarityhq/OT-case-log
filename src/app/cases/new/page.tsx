
'use client';

import PageHeader from '@/components/page-header';
import CaseForm from '@/components/cases/case-form';
import {
  saveCaseLog,
  getSurgerySuggestions,
  getClinicalAlert,
} from '@/lib/actions';
import AuthGuard from '@/components/auth/auth-guard';
import { CaseLog } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

function NewCasePageClient({ userId }: { userId: string }) {
  const firestore = useFirestore();

  const allCasesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users', userId, 'cases'), orderBy('createdAt', 'desc')) : null),
    [firestore, userId]
  );
  const { data: allCases, isLoading } = useCollection<CaseLog>(allCasesQuery);


  const handleSave = async (data: Omit<CaseLog, 'id' | 'createdAt'>) => {
    return saveCaseLog(userId, data);
  };
  
  const handleGetSurgerySuggestions = (specialty: string) => {
    const caseHistory = (allCases || []).filter(c => c.specialty === specialty).map(c => c.surgeryType);
    return getSurgerySuggestions(userId, specialty, caseHistory);
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Add New Case"
        description="Log a new anesthesia case with minimal typing."
      />
      <CaseForm
        onSave={handleSave}
        getSurgerySuggestions={handleGetSurgerySuggestions}
        getClinicalAlert={getClinicalAlert}
      />
    </div>
  );
}

export default function NewCasePage() {
  return <AuthGuard>{userId => <NewCasePageClient userId={userId} />}</AuthGuard>;
}
