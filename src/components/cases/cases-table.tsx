'use client';

import { useState, useMemo } from 'react';
import type { CaseLog } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ASA_GRADES, ANESTHESIA_TECHNIQUES } from '@/lib/constants';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface CasesTableProps {
  initialCases: CaseLog[];
}

export default function CasesTable({ initialCases }: CasesTableProps) {
  const router = useRouter();
  const [filters, setFilters] = useState({
    surgeryType: '',
    asaGrade: 'all',
    technique: 'all',
    dateRange: undefined as DateRange | undefined,
  });

  const uniqueSurgeryTypes = useMemo(() => {
    const types = new Set(initialCases.map(c => c.surgeryType));
    return Array.from(types);
  }, [initialCases]);

  const filteredCases = useMemo(() => {
    return initialCases.filter(c => {
      const { surgeryType, asaGrade, technique, dateRange } = filters;
      const caseDate = new Date(c.date);
      caseDate.setHours(0,0,0,0);

      const matchesSurgery = surgeryType
        ? c.surgeryType.toLowerCase().includes(surgeryType.toLowerCase())
        : true;
      const matchesAsa = asaGrade !== 'all' ? c.asaGrade === asaGrade : true;
      const matchesTechnique =
        technique !== 'all' ? c.anesthesiaTechnique === technique : true;
      const matchesDate = dateRange
        ? (!dateRange.from || caseDate >= dateRange.from) &&
          (!dateRange.to || caseDate <= dateRange.to)
        : true;
      
      return matchesSurgery && matchesAsa && matchesTechnique && matchesDate;
    });
  }, [initialCases, filters]);

  const handleRowClick = (id: string) => {
    router.push(`/cases/${id}`);
  };

  const clearFilters = () => {
    setFilters({
      surgeryType: '',
      asaGrade: 'all',
      technique: 'all',
      dateRange: undefined,
    });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-card p-4">
        <Input
          placeholder="Filter by surgery..."
          value={filters.surgeryType}
          onChange={e =>
            setFilters(prev => ({ ...prev, surgeryType: e.target.value }))
          }
          className="max-w-xs"
        />
        <Select
          value={filters.asaGrade}
          onValueChange={value =>
            setFilters(prev => ({ ...prev, asaGrade: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ASA Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ASA Grades</SelectItem>
            {ASA_GRADES.map(grade => (
              <SelectItem key={grade} value={grade}>
                ASA {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.technique}
          onValueChange={value =>
            setFilters(prev => ({ ...prev, technique: value }))
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Technique" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Techniques</SelectItem>
            {ANESTHESIA_TECHNIQUES.map(tech => (
              <SelectItem key={tech} value={tech}>
                {tech}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className="w-[280px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                    {format(filters.dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(filters.dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={filters.dateRange}
              onSelect={range =>
                setFilters(prev => ({ ...prev, dateRange: range }))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" onClick={clearFilters} size="icon">
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filters</span>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Patient ID</TableHead>
              <TableHead>Surgery</TableHead>
              <TableHead>Technique</TableHead>
              <TableHead className="text-right">ASA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.map(c => (
              <TableRow
                key={c.id}
                onClick={() => handleRowClick(c.id)}
                className="cursor-pointer"
              >
                <TableCell>
                  {c.date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </TableCell>
                <TableCell>{c.patientId}</TableCell>
                <TableCell>{c.surgeryType}</TableCell>
                <TableCell>{c.anesthesiaTechnique}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline">ASA {c.asaGrade}</Badge>
                </TableCell>
              </TableRow>
            ))}
             {filteredCases.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
