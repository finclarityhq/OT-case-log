
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { CaseLog } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface RecentCasesProps {
  data: CaseLog[];
}

export default function RecentCases({ data }: RecentCasesProps) {
  const router = useRouter();

  const handleRowClick = (id: string) => {
    router.push(`/cases/${id}`);
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        No recent cases logged.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Patient ID</TableHead>
          <TableHead>Surgery</TableHead>
          <TableHead className="text-right">ASA</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(log => (
          <TableRow
            key={log.id}
            onClick={() => handleRowClick(log.id)}
            className="cursor-pointer"
          >
            <TableCell>
              {new Date(log.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </TableCell>
            <TableCell>{log.patientId}</TableCell>
            <TableCell>{log.surgeryType}</TableCell>
            <TableCell className="text-right">
              <Badge variant="secondary">ASA {log.asaGrade}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
