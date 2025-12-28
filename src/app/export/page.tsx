
'use client';
import PageHeader from '@/components/page-header';
import ExportClient from './export-client';
import AuthGuard from '@/components/auth/auth-guard';
import { CaseLog } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';


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


function ExportPageClient({ userId }: { userId: string }) {
  const firestore = useFirestore();

  const casesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users', userId, 'cases'), orderBy('createdAt', 'desc')) : null),
    [firestore, userId]
  );
  
  const { data, isLoading } = useCollection<any>(casesQuery);
  
  // Convert Firestore Timestamps to JS Dates
  const cases: CaseLog[] | null = data ? data.map(c => ({
    id: c.id,
    ...convertTimestamps(c)
  }) as CaseLog) : null;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Export Data"
        description="Download your case logs in CSV format for audit and research."
      />
      {isLoading || cases === null ? (
        <div className="flex h-full min-h-[200px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ExportClient cases={cases} />
      )}
    </div>
  );
}

export default function ExportPage() {
    return <AuthGuard>{userId => <ExportPageClient userId={userId} />}</AuthGuard>
}
