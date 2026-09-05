export interface ProblemTypeDefinition {
  id: string;
  name: string;
  category: 'Civic' | 'Safety' | 'Consumer' | 'Government' | 'Telecom' | 'Banking' | 'Home' | 'Vehicle';
  route: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedResolutionDays: number;
  icon: string;
  tags: string[];
  questions: string[];
  evidence: string[];
  guidelines: string;
}

export const PROBLEM_TYPES: ProblemTypeDefinition[] = [
  {
    id: 'civic-pothole',
    name: 'Road Pothole / Damaged Road',
    category: 'Civic',
    route: 'Municipal Corporation / PWD Grievance Portal',
    priority: 'HIGH',
    estimatedResolutionDays: 3,
    icon: 'AlertTriangle',
    tags: ['pothole', 'road damage', 'khadda', 'sadak', 'traffic risk', 'street damage'],
    questions: [
      'What is the exact street/landmark or GPS location?',
      'How deep or dangerous is the pothole for two-wheelers/pedestrians?',
      'When did this damage start or when did you first notice it?'
    ],
    evidence: ['Geotagged photo of pothole', 'Exact road / landmark address', 'Nearby landmark details'],
    guidelines: 'Citizens should not stand on active roadways while capturing photos. Ensure photos clearly show scale.'
  },
  {
    id: 'civic-streetlight',
    name: 'Street Light Not Working / Dark Spot',
    category: 'Civic',
    route: 'Municipal Ward Electric Department / MSEDCL/Discom',
    priority: 'MEDIUM',
    estimatedResolutionDays: 2,
    icon: 'Lightbulb',
    tags: ['streetlight', 'light band', 'dark road', 'pole damage', 'no lighting', 'night hazard'],
    questions: [
      'Pole number or closest building / shop address?',
      'How many streetlights are non-functional in the stretch?',
      'Is there a safety risk for women or senior citizens at night?'
    ],
    evidence: ['Pole number photo', 'Nighttime photo of affected area', 'Ward / locality name'],
    guidelines: 'Look for the yellow pole sticker with pole ID for 2x faster municipal response.'
  },
  {
    id: 'civic-garbage',
    name: 'Garbage Dumping / Overflowing Waste Bin',
    category: 'Civic',
    route: 'Solid Waste Management (SWM) Department',
    priority: 'MEDIUM',
    estimatedResolutionDays: 2,
    icon: 'Trash2',
    tags: ['garbage', 'kachra', 'dumping', 'waste', 'smell', 'dustbin overflow'],
    questions: [
      'Is it a public dump site, private vacant plot, or overflowing municipal bin?',
      'How many days has the garbage been piling up?',
      'Is waste burning or foul odor affecting residents/schools?'
    ],
    evidence: ['Photo of waste accumulation', 'GPS location or Google Maps pin', 'Area landmark'],
    guidelines: 'Indicate if biomedical or hazardous chemical waste is present for emergency dispatch.'
  },
  {
    id: 'cyber-scam',
    name: 'Online Fraud / Cyber Scam / Financial Fraud',
    category: 'Safety',
    route: 'National Cyber Crime Reporting Portal (1930) & Bank Fraud Cell',
    priority: 'URGENT',
    estimatedResolutionDays: 1,
    icon: 'ShieldAlert',
    tags: ['fraud', 'scam', 'cybercrime', 'otp', 'phishing', 'unauthorized transaction', 'fake app', 'telegram scam'],
    questions: [
      'When did the fraudulent event occur (exact date and time)?',
      'What was the amount lost, and what is the 12-digit UTR/transaction reference ID?',
      'Which bank, wallet, or UPI app was used?',
      'Did you share any OTP, click any suspicious link, or install remote screen-sharing software (e.g. AnyDesk)?'
    ],
    evidence: [
      'Bank/UPI transaction debit SMS or statement PDF',
      'Screenshots of chat / WhatsApp / Telegram conversation',
      'Fraudster phone number, email, or UPI handle',
      'Fake website URL or malicious APK file name'
    ],
    guidelines: 'CRITICAL: If the fraud occurred within the last 2 hours ("Golden Hour"), immediately call 1930 and freeze your bank account via your official banking app.'
  },
  {
    id: 'bank-transaction',
    name: 'Banking / UPI Payment Dispute / ATM Cash Not Dispensed',
    category: 'Banking',
    route: 'Bank Grievance Cell & RBI Banking Ombudsman',
    priority: 'HIGH',
    estimatedResolutionDays: 5,
    icon: 'CreditCard',
    tags: ['bank', 'upi', 'transaction failed', 'atm', 'money deducted', 'chargeback', 'refund stuck'],
    questions: [
      'What is the 12-digit UPI reference number (RRN) or bank transaction ID?',
      'Did the recipient receive the funds, or did your account deduct without credit?',
      'Have 48 banking hours passed since the transaction attempt?'
    ],
    evidence: ['Bank account statement snippet', 'Transaction history screenshot with RRN', 'Merchant confirmation screenshot'],
    guidelines: 'Under RBI circulars, banks must compensate ₹100 per day if failed ATM/auto-reversals are delayed beyond T+5 days.'
  },
  {
    id: 'consumer-refund',
    name: 'E-commerce Refund Stuck / Defective Product Dispute',
    category: 'Consumer',
    route: 'National Consumer Helpline (NCH / INGRAM) & Consumer Disputes Redressal Commission',
    priority: 'MEDIUM',
    estimatedResolutionDays: 7,
    icon: 'ShoppingBag',
    tags: ['refund', 'return', 'delivery', 'warranty', 'e-commerce', 'damaged product', 'fake item', 'amazon', 'flipkart'],
    questions: [
      'What is the order ID and name of the shopping platform/merchant?',
      'What was the purchase date, payment method, and amount paid?',
      'What reason did customer support give for denying or delaying the refund?'
    ],
    evidence: ['Order invoice PDF / screenshot', 'Photos/videos of defective product / unboxing', 'Email or chat transcript with customer support'],
    guidelines: 'Consumer Protection (E-Commerce) Rules protect against misleading advertisements and unfair trade practices.'
  },
  {
    id: 'govt-certificate',
    name: 'Government Certificate / Document Delay (Aadhaar, PAN, Caste, Birth)',
    category: 'Government',
    route: 'Official State Citizen Service Centre / UIDAI / Income Tax Grievance',
    priority: 'MEDIUM',
    estimatedResolutionDays: 14,
    icon: 'FileText',
    tags: ['certificate', 'passport', 'aadhaar', 'pan', 'government', 'sarkar', 'ration card', 'caste', 'income certificate'],
    questions: [
      'Which document or certificate did you apply for?',
      'What is your Application Number / Acknowledgement Number?',
      'Which state/district department is processing the file?'
    ],
    evidence: ['Application acknowledgement receipt', 'Original appointment or submission slip', 'Government portal tracking screenshot'],
    guidelines: 'Check your state Right to Public Services (RTS) Act timeline for legal delivery guarantee.'
  },
  {
    id: 'telecom-network',
    name: 'Mobile Network / Fiber Broadband Service Disruption',
    category: 'Telecom',
    route: 'Telecom Appellate Authority & Department of Telecommunications (DoT)',
    priority: 'MEDIUM',
    estimatedResolutionDays: 3,
    icon: 'Wifi',
    tags: ['internet', 'wifi', 'mobile network', 'sim', 'broadband', 'call drops', 'fiber cut', 'jio', 'airtel', 'vi'],
    questions: [
      'Who is your telecom/broadband service provider?',
      'What is your registered customer ID or broadband account number?',
      'Is the issue total loss of signal, slow speed, or billing overcharge?'
    ],
    evidence: ['Broadband router / signal screenshot', 'Previous service complaint ticket number', 'Speed test screenshot'],
    guidelines: 'Escalate to the telecom appellate officer if an unaddressed ticket remains unresolved for over 72 hours.'
  },
  {
    id: 'vehicle-service',
    name: 'Automobile / Bike Service Dispute & Warranty Claim',
    category: 'Vehicle',
    route: 'Automotive Manufacturer Grievance & Consumer Redressal Forum',
    priority: 'MEDIUM',
    estimatedResolutionDays: 7,
    icon: 'Wrench',
    tags: ['bike', 'car', 'scooter', 'vehicle', 'service', 'mechanic', 'engine failure', 'warranty denied', 'showroom'],
    questions: [
      'What is the vehicle make, model, registration number, and current mileage?',
      'Which authorized service center performed the work?',
      'What defect recurred after service, or why was the warranty denied?'
    ],
    evidence: ['Service job card and final billing tax invoice', 'Photos/videos of recurring defect', 'Warranty booklet page'],
    guidelines: 'Keep all job cards signed by service advisors as legal evidence of repeated complaints.'
  },
  {
    id: 'home-service',
    name: 'Home Appliance Breakdown (AC, Fridge, Washing Machine)',
    category: 'Home',
    route: 'Manufacturer Brand Support & Consumer Redressal Desk',
    priority: 'MEDIUM',
    estimatedResolutionDays: 4,
    icon: 'Home',
    tags: ['appliance', 'ac', 'fridge', 'washing machine', 'geyser', 'repair', 'amc', 'technician no show'],
    questions: [
      'What is the appliance brand, model, and serial number?',
      'Is the appliance under brand warranty or extended AMC?',
      'Did a technician visit and diagnose the fault? What was the diagnosis?'
    ],
    evidence: ['Original purchase invoice', 'AMC agreement document if applicable', 'Photo of appliance model sticker'],
    guidelines: 'Brand service centers are legally required to provide genuine OEM spare parts for the product life cycle.'
  }
];

export function getProblemById(id: string): ProblemTypeDefinition | undefined {
  return PROBLEM_TYPES.find(p => p.id === id);
}

export function getAllProblems(): ProblemTypeDefinition[] {
  return PROBLEM_TYPES;
}
