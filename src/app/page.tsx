
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookText, CalendarDays, Activity, Layers3, Loader2 } from 'lucide-react';
import AsaDistributionChart from '@/components/dashboard/asa-distribution-chart';
import TechniqueDistributionChart from '@/components/dashboard/technique-distribution-chart';
import RecentCases from '@/components/dashboard/recent-cases';
import PageHeader from '@/components/page-header';
import AuthGuard from '@/components/auth/auth-guard';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { CaseLog, DashboardStats } from '@/lib/types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { ANESTHESIA_TECHNIQUES, ASA_GRADES } from '@/lib/constants';

function calculateDashboardStats(allCases: CaseLog[]): DashboardStats {
  if (allCases.length === 0) {
    return {
      totalCases: 0,
      monthlyCaseCount: 0,
      mostCommonAsaGrade: 'N/A',
      mostCommonTechnique: 'N/A',
      asaGradeDistribution: [],
      techniqueDistribution: [],
    };
  }

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyCases = allCases.filter(log => new Date(log.createdAt) >= firstDayOfMonth);

  const asaCounts = ASA_GRADES.reduce(
    (acc, grade) => ({ ...acc, [grade]: 0 }),
    {} as Record<(typeof ASA_GRADES)[number], number>
  );
  allCases.forEach(log => {
    if (asaCounts[log.asaGrade] !== undefined) {
      asaCounts[log.asaGrade]++;
    }
  });

  const techCounts = ANESTHESIA_TECHNIQUES.reduce(
    (acc, tech) => ({ ...acc, [tech]: 0 }),
    {} as Record<(typeof ANESTHESIA_TECHNIQUES)[number], number>
  );

  allCases.forEach(log => {
    const techKey = log.anesthesiaTechnique as keyof typeof techCounts;
    if (techCounts[techKey] !== undefined) {
      techCounts[techKey]++;
    }
  });

  const mostCommonAsa = Object.entries(asaCounts).sort((a, b) => b[1] - a[1])[0];
  const mostCommonTech = Object.entries(techCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  return {
    totalCases: allCases.length,
    monthlyCaseCount: monthlyCases.length,
    mostCommonAsaGrade: mostCommonAsa ? `ASA ${mostCommonAsa[0]}` : 'N/A',
    mostCommonTechnique: mostCommonTech ? mostCommonTech[0] : 'N/A',
    asaGradeDistribution: Object.entries(asaCounts).map(([name, value]) => ({
      name: `ASA ${name}`,
      value,
    })),
    techniqueDistribution: Object.entries(techCounts).map(
      ([name, value], i) => ({
        name,
        value,
        fill: chartColors[i % chartColors.length],
      })
    ),
  };
};

function Dashboard({ userId }: { userId: string }) {
  const firestore = useFirestore();

  const allCasesQuery = useMemoFirebase(
    () => collection(firestore, 'users', userId, 'cases'),
    [firestore, userId]
  );
  const { data: allCases, isLoading: isLoadingAllCases } = useCollection<CaseLog>(allCasesQuery);

  const recentCasesQuery = useMemoFirebase(
    () => query(collection(firestore, 'users', userId, 'cases'), orderBy('createdAt', 'desc'), limit(5)),
    [firestore, userId]
  );
  const { data: recentCases, isLoading: isLoadingRecentCases } = useCollection<CaseLog>(recentCasesQuery);

  const stats = useMemoFirebase(() => calculateDashboardStats(allCases || []), [allCases]);
  
  const isLoading = isLoadingAllCases || isLoadingRecentCases;

  if (isLoading || !stats || !recentCases) {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="A quick overview of your case logs."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <BookText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases}</div>
            <p className="text-xs text-muted-foreground">
              All-time cases logged
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cases This Month
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyCaseCount}</div>
            <p className="text-xs text-muted-foreground">
              In {new Date().toLocaleString('default', { month: 'long' })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Common ASA
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mostCommonAsaGrade}</div>
            <p className="text-xs text-muted-foreground">
              Most frequent patient status
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Technique</CardTitle>
            <Layers3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mostCommonTechnique}</div>
            <p className="text-xs text-muted-foreground">
              Most frequent anesthesia type
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ASA Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <AsaDistributionChart data={stats.asaGradeDistribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Anesthesia Technique Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <TechniqueDistributionChart data={stats.techniqueDistribution} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentCases data={recentCases} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return <AuthGuard>{userId => <Dashboard userId={userId} />}</AuthGuard>;
}
