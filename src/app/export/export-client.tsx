'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CaseLog } from '@/lib/types';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


interface ExportClientProps {
    cases: CaseLog[];
}

function convertToCSV(data: CaseLog[]) {
    if (data.length === 0) return '';
    
    // Define headers dynamically but with a specific order
    const headers = [
        'id', 'date', 'location', 'isEmergency', 'patientId', 'age', 'sex', 'asaGrade', 
        'comorbidities', 'specialty', 'surgeryType', 'patientPosition', 'anesthesiaTechnique', 
        'duration', 'hemodynamicStatus', 'hasAirwayDifficulty', 'complications', 
        'postOpAnalgesia', 'rescueAnalgesiaRequired', 'notes',
        'blockType', 'blockLevel', 'blockSide', 'isUltrasoundGuided', 'localAnesthetic'
    ];
    
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            let value: any;
            if (header.startsWith('block')) {
                 const blockKey = header.replace('block', '').toLowerCase() as keyof NonNullable<CaseLog['blockDetails']>;
                 value = row.blockDetails ? row.blockDetails[blockKey] : '';
            } else {
                 value = row[header as keyof CaseLog];
            }

            if (value instanceof Date) {
                return value.toISOString();
            }
            if (Array.isArray(value)) {
                return `"${value.join('; ')}"`;
            }
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}


export default function ExportClient({ cases }: ExportClientProps) {
    const [isExportingCsv, setIsExportingCsv] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const handleExportCsv = () => {
        setIsExportingCsv(true);
        try {
            const csvData = convertToCSV(cases);
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                const date = new Date().toISOString().split('T')[0];
                link.setAttribute('href', url);
                link.setAttribute('download', `ot-case-log-export-${date}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } finally {
            setTimeout(() => setIsExportingCsv(false), 1000);
        }
    };

    const handleExportPdf = () => {
        setIsExportingPdf(true);
        try {
            const doc = new jsPDF();
            const date = new Date().toISOString().split('T')[0];
            const title = `OT Case Log Export - ${date}`;
            
            doc.text(title, 14, 16);

            const tableColumns = [
                { header: 'Date', dataKey: 'date' },
                { header: 'Patient ID', dataKey: 'patientId' },
                { header: 'Surgery', dataKey: 'surgeryType' },
                { header: 'ASA', dataKey: 'asaGrade' },
                { header: 'Technique', dataKey: 'anesthesiaTechnique' },
                { header: 'Duration (m)', dataKey: 'duration' },
            ];

            const tableRows = cases.map(c => ({
                date: c.date.toLocaleDateString('en-GB'),
                patientId: c.patientId,
                surgeryType: c.surgeryType,
                asaGrade: c.asaGrade,
                anesthesiaTechnique: c.anesthesiaTechnique,
                duration: c.duration,
            }));

            autoTable(doc, {
                head: [tableColumns.map(col => col.header)],
                body: tableRows.map(row => tableColumns.map(col => row[col.dataKey as keyof typeof row])),
                startY: 20,
                headStyles: { fillColor: [99, 189, 189] }, // Primary color
            });
            
            doc.save(`ot-case-log-export-${date}.pdf`);

        } finally {
            setTimeout(() => setIsExportingPdf(false), 1000);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Download All Data</CardTitle>
                <CardDescription>
                    You have a total of {cases.length} case logs recorded. Click a button below to download them.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <Button onClick={handleExportCsv} disabled={isExportingCsv || isExportingPdf}>
                        {isExportingCsv ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {isExportingCsv ? 'Exporting...' : 'Export to CSV'}
                    </Button>
                    <Button onClick={handleExportPdf} disabled={isExportingCsv || isExportingPdf} variant="outline">
                        {isExportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {isExportingPdf ? 'Exporting...' : 'Export to PDF'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
