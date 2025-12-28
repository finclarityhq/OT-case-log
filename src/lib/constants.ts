export const ASA_GRADES = ['I', 'II', 'III', 'IV', 'V'] as const;
export const SEX_OPTIONS = ['Male', 'Female', 'Other'] as const;
export const COMORBIDITIES_OPTIONS = [
  'HTN',
  'DM',
  'CAD',
  'CKD',
  'COPD',
  'Other',
] as const;
export const SURGICAL_SPECIALTIES = [
  'Cardiothoracic Surgery',
  'Colorectal Surgery',
  'Emergency',
  'General Surgery',
  'Neurosurgery',
  'Obstetrics and Gynecology',
  'Ophthalmology',
  'Oral and Maxillofacial Surgery',
  'Orthopedic Surgery',
  'Otolaryngology (ENT)',
  'Pediatric Surgery',
  'Plastic and Reconstructive Surgery',
  'Urology',
  'Vascular Surgery',
  'Other',
] as const;

export const COMMON_SURGERIES_BY_SPECIALTY: Record<string, string[]> = {
  'Cardiothoracic Surgery': [
    'Coronary Artery Bypass Grafting (CABG)',
    'Valve Repair/Replacement',
    'Aortic Aneurysm Repair',
    'Lobectomy',
    'Pneumonectomy',
  ],
  'Colorectal Surgery': [
    'Colectomy',
    'Hemorrhoidectomy',
    'Fistulectomy',
    'Rectopexy',
  ],
  'General Surgery': [
    'Appendectomy',
    'Cholecystectomy',
    'Hernia Repair (Inguinal, Umbilical, etc.)',
    'Mastectomy',
    'Thyroidectomy',
  ],
  'Neurosurgery': [
    'Craniotomy for Tumor Resection',
    'Spinal Fusion',
    'Laminectomy',
    'Ventriculoperitoneal (VP) Shunt',
    'Carotid Endarterectomy',
  ],
  'Obstetrics and Gynecology': [
    'Cesarean Section',
    'Hysterectomy (Abdominal, Vaginal, Laparoscopic)',
    'Oophorectomy',
    'Dilation and Curettage (D&C)',
    'Myomectomy',
  ],
  'Ophthalmology': [
    'Cataract Extraction',
    'Vitrectomy',
    'Trabeculectomy',
    'Corneal Transplant',
  ],
  'Oral and Maxillofacial Surgery': [
    'Wisdom Tooth Extraction',
    'Jaw Reconstruction',
    'Dental Implants',
  ],
  'Orthopedic Surgery': [
    'Total Hip Replacement',
    'Total Knee Replacement',
    'Arthroscopy (Knee, Shoulder)',
    'Open Reduction Internal Fixation (ORIF)',
    'Spinal Decompression',
  ],
  'Otolaryngology (ENT)': [
    'Tonsillectomy',
    'Septoplasty',
    'Tympanoplasty',
    'Functional Endoscopic Sinus Surgery (FESS)',
    'Laryngoscopy',
  ],
  'Pediatric Surgery': [
    'Hernia Repair',
    'Orchidopexy',
    'Pyloromyotomy',
    'Appendectomy',
  ],
  'Plastic and Reconstructive Surgery': [
    'Breast Reconstruction',
    'Skin Grafting',
    'Rhinoplasty',
    'Liposuction',
  ],
  'Urology': [
    'Transurethral Resection of the Prostate (TURP)',
    'Cystoscopy',
    'Nephrectomy',
    'Ureteroscopy',
    'Vasectomy',
  ],
  'Vascular Surgery': [
    'Carotid Endarterectomy',
    'Aneurysm Repair (Aortic, Peripheral)',
    'Angioplasty/Stenting',
    'Varicose Vein Stripping',
  ],
};

export const PATIENT_POSITIONS = [
  'Supine',
  'Prone',
  'Lithotomy',
  'Lateral',
] as const;
export const ANESTHESIA_TECHNIQUES = [
  'GA',
  'Spinal',
  'Epidural',
  'CSE',
  'Paravertebral Block',
  'Peripheral Nerve Block',
  'MAC/Sedation',
] as const;
export const HEMODYNAMIC_STATUS_OPTIONS = [
  'Stable',
  'Mild fluctuations',
  'Significant instability',
] as const;
export const COMPLICATION_OPTIONS = [
  'Hypotension',
  'Bradycardia',
  'Desaturation',
  'High spinal',
  'PONV',
  'Block failure',
  'None',
] as const;
export const POST_OP_ANALGESIA_OPTIONS = ['Adequate', 'Inadequate'] as const;
export const BLOCK_SIDE_OPTIONS = ['Left', 'Right', 'Bilateral'] as const;
