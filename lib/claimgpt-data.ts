export const FEATURES = [
  'Around 14,000 ICD codes via on-prem RAG',
  'SLA-tracked processing queue',
  '14 Indian languages supported',
];

export const TRUST_BADGES = ['IRDAI', 'ISO 27001', 'HIPAA-aligned'];

export const INSURERS = [
  'Star Health',
  'HDFC ERGO',
  'ICICI Lombard',
  'Niva Bupa',
  'Care Health',
  'Other',
];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'kn', label: '<ctrl42>ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'অসমীয়া' },
  { code: 'ur', label: 'اردو' },
  { code: 'sa', label: 'संस्कृत' },
];

export type Stage = 'staged' | 'ocr' | 'parsing' | 'coding' | 'scoring';

export const PIPELINE: { key: Stage; label: string }[] = [
  { key: 'staged', label: 'Claim Attached' },
  { key: 'ocr', label: 'OCR Text Capture' },
  { key: 'parsing', label: 'Parsing (LLM agent)' },
  { key: 'coding', label: 'ICD-10 / CPT Coding' },
  { key: 'scoring', label: 'Compliance & Risk Scoring' },
];

export const STAGED_FILES = [
  { name: 'hospital_bill_main.pdf', size: '248 KB' },
  { name: 'lab_report_bloodwork.jpg', size: '1.2 MB' },
  { name: 'discharge_summary.pdf', size: '512 KB' },
];

export type LineItem = {
  id: string;
  category: string;
  description: string;
  amount: number;
  box: { x: number; y: number; w: number; h: number };
};

export const LINE_ITEMS: LineItem[] = [
  {
    id: 'room',
    category: 'Room Rent & Nursing',
    description: 'Deluxe Private Room (4 days @ ₹7,500)',
    amount: 30000,
    box: { x: 8, y: 30, w: 84, h: 7 },
  },
  {
    id: 'icu',
    category: 'ICU Charges',
    description: 'Intensive Care Monitoring (1 day)',
    amount: 18000,
    box: { x: 8, y: 40, w: 84, h: 7 },
  },
  {
    id: 'ot',
    category: 'OT & Surgeon Fees',
    description: 'Laparoscopic Surgery + Anesthesia',
    amount: 45000,
    box: { x: 8, y: 50, w: 84, h: 7 },
  },
  {
    id: 'pharmacy',
    category: 'Pharmacy & Consumables',
    description: 'IV Antibiotics, Analgesics, Surgical Disposables',
    amount: 12500,
    box: { x: 8, y: 60, w: 84, h: 7 },
  },
  {
    id: 'diagnostics',
    category: 'Diagnostics & Pathology',
    description: 'Contrast CT Abdomen, CBC, LFT, KFT',
    amount: 9800,
    box: { x: 8, y: 70, w: 84, h: 7 },
  },
];

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
