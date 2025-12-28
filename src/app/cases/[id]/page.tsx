
'use client';

import PageHeader from '@/components/page-header';
import { notFound } from 'next/navigation';
import CaseDetail from '@/components/cases/case-detail';
import { Button } from '@/components/ui/button';
import { Edit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/auth-guard';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { CaseLog } from '@/lib/types';
import { doc, Timestamp } from 'firebase/firestore';


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


function CaseDetailPageClient({
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

  const { data, isLoading } = useDoc<any>(caseDocRef);
  
  // Convert Firestore Timestamps to JS Dates
  const caseLog: CaseLog | null = data ? {
    id: data.id,
    ...convertTimestamps(data)
  } as CaseLog : null;


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
  
  const caseDate = caseLog.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Case: ${caseLog.patientId}`}
        description={`Details for case from ${caseDate}`}
      >
        <Button asChild variant="outline">
          <Link href={`/cases/${caseLog.id}/edit`}>
            <Edit /> Edit Case
          </Link>
        </Button>
      </PageHeader>

      <CaseDetail caseLog={caseLog} />
    </div>
  );
}

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      {userId => <CaseDetailPageClient userId={userId} caseId={params.id} />}
    </AuthGuard>
  );
}
