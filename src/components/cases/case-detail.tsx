import type { CaseLog } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface CaseDetailProps {
  caseLog: CaseLog;
}

const DetailItem = ({ label, value }: { label: string; value?: React.ReactNode }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="grid grid-cols-2 gap-2">
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="text-sm">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</dd>
        </div>
    );
};

export default function CaseDetail({ caseLog }: CaseDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Date" value={caseLog.date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })} />
            <DetailItem label="Patient ID" value={caseLog.patientId} />
            <DetailItem label="Age" value={caseLog.age} />
            <DetailItem label="Sex" value={caseLog.sex} />
            <DetailItem label="ASA Grade" value={<Badge variant="secondary">ASA {caseLog.asaGrade}</Badge>} />
            <DetailItem label="Emergency" value={caseLog.isEmergency} />
            <DetailItem label="Location" value={caseLog.location} />
          </dl>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Surgical Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <DetailItem label="Specialty" value={caseLog.specialty} />
             <DetailItem label="Surgery" value={caseLog.surgeryType} />
             <DetailItem label="Patient Position" value={caseLog.patientPosition} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pre-Anesthetic Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Comorbidities" value={caseLog.comorbidities.length > 0 ? caseLog.comorbidities.join(', ') : 'None'} />
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader><CardTitle>Anesthesia Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <DetailItem label="Primary Technique" value={caseLog.anesthesiaTechnique} />
          {caseLog.blockDetails && (
              <>
                <Separator className="my-4" />
                <h4 className="text-md font-semibold mb-2">Block Details</h4>
                <div className="pl-4 border-l-2 border-primary space-y-4">
                    <DetailItem label="Block Type" value={caseLog.blockDetails.type} />
                    <DetailItem label="Level & Side" value={`${caseLog.blockDetails.level}, ${caseLog.blockDetails.side}`} />
                    <DetailItem label="Ultrasound Guided" value={caseLog.blockDetails.isUltrasoundGuided} />
                    <DetailItem label="Local Anesthetic" value={caseLog.blockDetails.localAnesthetic} />
                </div>
              </>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
            <CardHeader><CardTitle>Intraoperative Course</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <DetailItem label="Duration" value={`${caseLog.duration} minutes`} />
                <DetailItem label="Hemodynamic Status" value={caseLog.hemodynamicStatus} />
                <DetailItem label="Airway Difficulty" value={caseLog.hasAirwayDifficulty} />
                <DetailItem label="Complications" value={caseLog.complications.length > 0 ? caseLog.complications.join(', ') : 'None'} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Postoperative Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <DetailItem label="Post-op Analgesia" value={caseLog.postOpAnalgesia} />
                <DetailItem label="Rescue Analgesia Required" value={caseLog.rescueAnalgesiaRequired} />
            </CardContent>
        </Card>
      </div>
      
      {caseLog.notes && (
          <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{caseLog.notes}</p>
              </CardContent>
          </Card>
      )}

    </div>
  );
}
