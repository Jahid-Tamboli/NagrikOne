export interface DynamicQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'boolean' | 'file';
  placeholder?: string;
  options?: string[];
  required: boolean;
  helpText?: string;
}

/**
 * Returns tailored, contextual questions based on the problem category and description.
 */
export function getDynamicQuestions(problemId: string, description: string): DynamicQuestion[] {
  const norm = (description || '').toLowerCase();

  // 1. Streetlight
  if (problemId.includes('streetlight') || norm.includes('street light') || norm.includes('pole')) {
    return [
      {
        id: 'q_location',
        question: 'Where is the streetlight located?',
        type: 'text',
        placeholder: 'e.g. Near Pole #42, Main Market Road, Ward 12',
        required: true,
        helpText: 'Pole ID numbers or nearby landmarks enable rapid municipal team dispatch.'
      },
      {
        id: 'q_duration',
        question: 'Since when has the light been inactive or broken?',
        type: 'choice',
        options: ['1-3 days', '4-7 days', 'More than 2 weeks', 'Intermittently flickering'],
        required: true
      },
      {
        id: 'q_area_scope',
        question: 'Is the entire street dark or just this single pole?',
        type: 'choice',
        options: ['Entire street/colony dark', 'Single light fixture broken', 'Multiple consecutive poles'],
        required: true
      },
      {
        id: 'q_safety_risk',
        question: 'Is there an immediate safety risk (e.g., crime risk, blind turn, seniors walking)?',
        type: 'choice',
        options: ['High risk area / dark spot', 'Moderate pedestrian traffic', 'Standard residential lane'],
        required: false
      }
    ];
  }

  // 2. Road Pothole
  if (problemId.includes('pothole') || norm.includes('road') || norm.includes('khadda')) {
    return [
      {
        id: 'q_pothole_location',
        question: 'Where is the road damage / pothole located?',
        type: 'text',
        placeholder: 'e.g. Near Metro Pillar 114, Outer Ring Road',
        required: true
      },
      {
        id: 'q_severity',
        question: 'What is the severity of the road damage?',
        type: 'choice',
        options: ['Deep crater causing two-wheeler accidents', 'Broken asphalt with water logging', 'Missing manhole cover / fatal risk'],
        required: true
      },
      {
        id: 'q_traffic_impact',
        question: 'Is it blocking traffic or causing major congestion?',
        type: 'choice',
        options: ['Major arterial road / heavy traffic', 'Inner residential colony street', 'Highway / express corridor'],
        required: true
      }
    ];
  }

  // 3. UPI / Bank Transaction Dispute
  if (problemId.includes('bank') || problemId.includes('upi') || norm.includes('upi') || norm.includes('gpay') || norm.includes('phonepe')) {
    return [
      {
        id: 'q_txn_app',
        question: 'Which banking app or payment method was used?',
        type: 'choice',
        options: ['Google Pay (GPay)', 'PhonePe', 'Paytm', 'BHIM UPI', 'Cred / Bank App', 'Direct NetBanking / IMPS'],
        required: true
      },
      {
        id: 'q_txn_amount',
        question: 'What was the disputed transaction amount in ₹?',
        type: 'text',
        placeholder: 'e.g. 1500',
        required: true
      },
      {
        id: 'q_txn_rrn',
        question: 'Do you have the 12-digit UPI Reference / UTR / RRN number?',
        type: 'text',
        placeholder: 'e.g. 423892019481 (Found on transaction receipt)',
        required: false,
        helpText: 'The 12-digit RRN is mandatory for NPCI automated reversal compensation claims.'
      },
      {
        id: 'q_merchant_status',
        question: 'Did the merchant confirm non-receipt while your bank debited the amount?',
        type: 'choice',
        options: ['Yes, merchant did not receive payment', 'Transaction status shows Pending in app', 'Double amount debited for single purchase'],
        required: true
      }
    ];
  }

  // 4. Cyber Scam / Fraud
  if (problemId.includes('cyber') || norm.includes('fraud') || norm.includes('scam') || norm.includes('otp')) {
    return [
      {
        id: 'q_incident_type',
        question: 'What type of cyber incident or fraudulent contact occurred?',
        type: 'choice',
        options: [
          'Fake Police / Digital Arrest video call',
          'Telegram / YouTube like-and-earn task scam',
          'Malicious Loan App (APK) contact blackmail',
          'OTP phishing link / Unauthorized bank debit',
          'Sextortion / Video call threat',
          'Other online deception'
        ],
        required: true
      },
      {
        id: 'q_financial_loss',
        question: 'What was the financial loss incurred (if any)?',
        type: 'text',
        placeholder: 'e.g. ₹25,000 (Enter 0 if caught before transfer)',
        required: true
      },
      {
        id: 'q_time_elapsed',
        question: 'Did the fraudulent transfer occur within the last 2 hours (Golden Hour)?',
        type: 'choice',
        options: ['Yes, in the last 2 hours (High freeze chance via 1930)', 'Today (Within 24 hours)', '2 to 7 days ago', 'More than a week ago'],
        required: true
      },
      {
        id: 'q_creds_shared',
        question: 'Were any passwords, OTPs, or screen-sharing tools (AnyDesk/TeamViewer) installed?',
        type: 'choice',
        options: ['Yes, OTP was shared or APK installed', 'Screen sharing app was installed', 'No, only money was directly transferred', 'None of these'],
        required: true
      }
    ];
  }

  // 5. Landlord / Tenant Dispute
  if (norm.includes('landlord') || norm.includes('deposit') || norm.includes('rent') || norm.includes('eviction')) {
    return [
      {
        id: 'q_deposit_amount',
        question: 'What is the security deposit amount withheld by the landlord?',
        type: 'text',
        placeholder: 'e.g. ₹45,000',
        required: true
      },
      {
        id: 'q_agreement_status',
        question: 'Do you have a registered or signed Rent Agreement?',
        type: 'choice',
        options: ['Yes, registered rent agreement', 'Notarized rent agreement', 'Oral agreement / bank transfer proof only'],
        required: true
      },
      {
        id: 'q_handover_status',
        question: 'Have keys and property possession already been handed back to landlord?',
        type: 'choice',
        options: ['Yes, keys handed over with move-out inspection', 'Move-out pending in next 30 days', 'Landlord attempting forced lockout'],
        required: true
      }
    ];
  }

  // Default / Unknown Problem Questions
  return [
    {
      id: 'q_main_impact',
      question: 'What is the primary loss or disruption you are experiencing?',
      type: 'text',
      placeholder: 'e.g. Service disconnected, money withheld, safety hazard...',
      required: true
    },
    {
      id: 'q_prior_communication',
      question: 'Have you lodged a formal complaint with the company or local authority?',
      type: 'choice',
      options: ['Yes, ticket number received but no action', 'Spoke to customer care / official verbally', 'No prior formal complaint filed yet'],
      required: true
    },
    {
      id: 'q_desired_relief',
      question: 'What resolution or remedy are you seeking through this case?',
      type: 'choice',
      options: ['Immediate repair / restoration of service', 'Full refund / financial compensation', 'Formal statutory escalation and accountability'],
      required: true
    }
  ];
}
