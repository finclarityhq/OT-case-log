
'use client';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusSquare, Loader2 } from 'lucide-react';
import CasesTable from '@/components/cases/cases-table';
import AuthGuard from '@/components/auth/auth-guard';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { CaseLog } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';

function CasesPageClient({ userId }: { userId: string }) {
  const firestore = useFirestore();

  const casesQuery = useMemoFirebase(
    () => query(collection(firestore, 'users', userId, 'cases'), orderBy('createdAt', 'desc')),
    [firestore, userId]
  );
  
  const { data: cases, isLoading } = useCollection<CaseLog>(casesQuery);
  
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="All Cases"
        description="Search, filter, and view your logged cases."
      >
        <Button asChild>
          <Link href="/cases/new">
            <PlusSquare />
            <span>New Case</span>
          </Link>
        </Button>
      </PageHeader>

      {isLoading || cases === null ? (
         <div className="flex h-full min-h-[400px] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading cases...</p>
            </div>
       </div>
      ) : (
        <CasesTable initialCases={cases} />
      )}
    </div>
  );
}

export default function CasesPage() {
    return <AuthGuard>{userId => <CasesPageClient userId={userId} />}</AuthGuard>;
}
