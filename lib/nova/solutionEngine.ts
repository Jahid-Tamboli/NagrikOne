import { ProblemTypeDefinition } from '@/lib/problemTypes';

export interface NovaSolution {
  headline: string;
  legalAssessment: string;
  immediateActionSteps: string[];
  formalNoticeDraft?: string;
  statutoryAuthority: {
    department: string;
    act: string;
    helpline?: string;
    slaDays: number;
    portalUrl?: string;
  };
  evidenceChecklist: string[];
  followUpSuggestions: string[];
  chatResponseText: string;
}

/**
 * Generates comprehensive, genuine, ChatGPT-style solutions for citizen problems.
 */
export function generateNovaSolution(
  problem: ProblemTypeDefinition,
  rawText: string,
  location?: string,
  history: Array<{ sender: 'citizen' | 'nova'; text: string }> = []
): NovaSolution {
  const norm = rawText.toLowerCase();
  const loc = location || 'your city / jurisdiction';

  // Check if this is a follow-up query in an ongoing conversation
  const isFollowUp = history.length > 2;

  // 1. TENANCY / SECURITY DEPOSIT DISPUTE
  if (
    problem.id.includes('tenant') ||
    problem.id.includes('landlord') ||
    norm.includes('landlord') ||
    norm.includes('security deposit') ||
    norm.includes('kirayedar') ||
    norm.includes('rent deposit')
  ) {
    const amountMatch = rawText.match(/(?:rs\.?|inr|₹)\s*([\d,]+)|\b(\d{4,6})\b/i);
    const amountStr = amountMatch ? `₹${amountMatch[1] || amountMatch[2]}` : 'the security deposit amount';

    const notice = `LEGAL NOTICE OF DEMAND FOR REFUND OF SECURITY DEPOSIT
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

To:
The Landlord / Property Owner
Subject Property: [Insert Rented Flat/Room Address, ${loc}]

Dear Sir/Madam,

RE: DEMAND FOR IMMEDIATE REFUND OF SECURITY DEPOSIT OF ${amountStr} UNDER SECTION 10 OF THE MODEL TENANCY ACT AND INDIAN CONTRACT ACT, 1872

1. I was a lawful tenant in the aforementioned premises and have duly surrendered vacant, peaceful possession along with the keys after fulfilling all rental dues up to date.
2. In terms of our tenancy and statutory provisions governing residential leases, the security deposit of ${amountStr} was required to be refunded within 30 days of vacating the premises.
3. Despite repeated oral and written reminders, you have failed to refund the said amount without any lawful justification or itemized damage assessment.
4. TAKE NOTICE that you are hereby called upon to transfer the full deposit sum of ${amountStr} to my bank account within SEVEN (7) DAYS of receipt of this notice, failing which I shall be constrained to initiate formal statutory proceedings before the Rent Authority / Civil Court / District Consumer Dispute Redressal Commission for recovery, along with 18% penal interest and damages for mental harassment.

Yours faithfully,
[Your Full Name]
Phone: [Your Mobile Number]
Account / UPI: [Your Bank Details]`;

    const chatResponseText = `### Statutory Legal Solution: Unreturned Security Deposit

**Your Legal Standing & Rights:**
Under the **Model Tenancy Act** and the **Indian Contract Act (Section 73 & 74)**, a landlord cannot unilaterally withhold or forfeit your security deposit without providing an itemized inspection bill of actual tenant-inflicted damages. Normal wear and tear (e.g. minor paint fading, routine age depreciation) is legally non-deductible.

---

### Step-by-Step Immediate Action Plan:

1. **Step 1 — Send Formal Statutory Notice (Today):**
   Send the pre-drafted legal demand notice below via WhatsApp and registered Email / Speed Post giving a mandatory 7-day cure window. In over 70% of cases, landlords settle upon receiving a formal legal notice quoting the Model Tenancy Act.

2. **Step 2 — File Online Grievance with Rent Authority / Consumer Commission:**
   If the landlord does not respond within 7 days, file an online grievance with the **District Consumer Dispute Redressal Commission** under the Consumer Protection Act, 2019 for "Deficiency of Service" and unfair trade practice, or before the local **Rent Authority (Sub-Divisional Magistrate / Civil Judge)**.

3. **Step 3 — Safeguard Electronic Evidence:**
   Preserve bank transfer receipts of deposit payment, move-out photos/videos showing the flat condition, WhatsApp chat threads, and the key handover confirmation.

---

### Pre-Drafted Legal Demand Notice:
*(You can copy this notice and send it directly)*

\`\`\`
${notice}
\`\`\`

**Statutory Authority & Helpline:**
- **Nodal Agency:** Rent Court / District Consumer Redressal Commission (${loc})
- **National Consumer Helpline:** Call **1915** (Toll-Free) or register on **consumerhelpline.gov.in**
- **Statutory Resolution SLA:** 14 Days`;

    return {
      headline: `Recovery Strategy for Withheld Security Deposit (${amountStr})`,
      legalAssessment: 'Under the Model Tenancy Act and Indian Contract Act, landlords must return security deposits within 30 days of vacant possession handover. Forfeiture without mutual inspection and itemized bills is unlawful.',
      immediateActionSteps: [
        'Dispatch the formal 7-Day Legal Demand Notice via WhatsApp and Speed Post today.',
        'Compile move-out timestamped photos, bank deposit proof, and key handover chats.',
        'Lodge a consumer grievance on National Consumer Helpline (consumerhelpline.gov.in / 1915) if unpaid after 7 days.'
      ],
      formalNoticeDraft: notice,
      statutoryAuthority: {
        department: 'Rent Authority / District Consumer Disputes Redressal Commission',
        act: 'Model Tenancy Act & Consumer Protection Act, 2019',
        helpline: '1915',
        slaDays: 14,
        portalUrl: 'https://consumerhelpline.gov.in'
      },
      evidenceChecklist: [
        'Original Rent Agreement copy (Notarized or Registered)',
        'Bank transaction statement showing security deposit transfer',
        'Photos/videos of the empty apartment at move-out',
        'Written chat or email confirming return of keys'
      ],
      followUpSuggestions: [
        'Can the landlord deduct painting charges automatically?',
        'How do I file a case on the e-Daakhil consumer portal?',
        'Can I claim 18% interest on the delayed security deposit?'
      ],
      chatResponseText
    };
  }

  // 2. UNPAID SALARY / EMPLOYMENT DISPUTE
  if (
    problem.id.includes('labour') ||
    problem.id.includes('salary') ||
    norm.includes('unpaid salary') ||
    norm.includes('salary delay') ||
    norm.includes('salary nahi mili') ||
    norm.includes('tankhwah') ||
    norm.includes('fnf') ||
    norm.includes('terminated')
  ) {
    const notice = `LEGAL DEMAND NOTICE FOR UNPAID WAGES AND FULL & FINAL SETTLEMENT
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

To:
The Board of Directors / HR Head
[Company / Employer Name]
[Office Address, ${loc}]

Dear Management,

RE: DEMAND FOR DISBURSEMENT OF PENDING SALARY & STATUTORY DUES UNDER SECTION 15 OF THE PAYMENT OF WAGES ACT, 1936 AND INDUSTRIAL DISPUTES ACT, 1947

1. I was employed as [Your Designation] with Employee ID [Your ID] from [Start Date] to [End Date].
2. In accordance with Section 15 of the Payment of Wages Act and employment regulations, earned wages and statutory full & final dues are required to be cleared within 7 to 10 days of the wage period / separation.
3. Despite completion of exit formalities and repeated follow-ups, my earned wages and statutory entitlements amounting to [Total Unpaid Amount in ₹] remain wrongfully withheld.
4. TAKE NOTICE that you are hereby called upon to disburse the entire pending sum into my salary bank account within SEVEN (7) DAYS of this notice, failing which I shall initiate proceedings before the Labour Commissioner, National Company Law Tribunal (Insolvency petition for operational debt), and Magistrate Court under Section 406/420 of BNS for criminal breach of trust.

Yours sincerely,
[Your Name]
Phone: [Your Phone]`;

    const chatResponseText = `### Statutory Legal Solution: Unpaid Salary & Full-and-Final Settlement

**Your Legal Standing & Rights:**
Under the **Payment of Wages Act, 1936** and the **Code on Wages, 2019**, withholding earned wages is a cognizable labour offense. Employers are mandated to clear earned salary by the 7th or 10th of every month, and all exit dues within 2 working days of separation.

---

### Step-by-Step Immediate Action Plan:

1. **Step 1 — Serve Formal Notice of Demand (Today):**
   Serve the formal demand notice below to Company Directors and HR via official email and WhatsApp. State that non-payment constitutes an operational default.

2. **Step 2 — File Complaint on the Samadhan Labour Portal:**
   File an online industrial dispute with the **District Labour Commissioner** on the Ministry of Labour's **Samadhan Portal (samadhan.labour.gov.in)**. Labour officers issue a direct conciliation summons to the employer within 15 days.

3. **Step 3 — EPFO & Gratuity Non-Remittance Action:**
   If the employer deducted PF from your payslip but failed to deposit it with EPFO, file an immediate complaint on the **EPFiGMS Portal (epfigms.gov.in)**. Unremitted PF is treated as criminal breach of trust.

---

### Pre-Drafted Legal Demand Notice:
*(Copy and send directly to HR and Management)*

\`\`\`
${notice}
\`\`\`

**Statutory Authority & Helpline:**
- **Nodal Agency:** Office of the Labour Commissioner / Samadhan Portal (${loc})
- **National Labour Helpline:** Shram Suvidha **1800-180-1111**
- **Statutory Resolution SLA:** 15 Days`;

    return {
      headline: 'Legal Recovery Framework for Unpaid Wages & F&F Dues',
      legalAssessment: 'Withholding wages violates the Payment of Wages Act and Code on Wages. Employers face statutory interest penalties up to 10x the delayed amount under Labour Court orders.',
      immediateActionSteps: [
        'Send the 7-Day Formal Wage Demand Notice to Company Directors and HR today.',
        'File an online grievance on the Ministry of Labour Samadhan Portal (samadhan.labour.gov.in).',
        'Check EPFO passbook for unremitted PF contributions and flag via EPFiGMS.'
      ],
      formalNoticeDraft: notice,
      statutoryAuthority: {
        department: 'Labour Commissionerate & Industrial Tribunal',
        act: 'Payment of Wages Act, 1936 & Code on Wages, 2019',
        helpline: '1800-180-1111',
        slaDays: 15,
        portalUrl: 'https://samadhan.labour.gov.in'
      },
      evidenceChecklist: [
        'Offer letter and appointment agreement',
        'Last 3 months salary slips or bank statements showing previous credits',
        'Official email resignation or termination letter',
        'Timesheet or biometric attendance records proving work done'
      ],
      followUpSuggestions: [
        'Can the company legally withhold experience letter or relieving letter?',
        'How do I file on the Samadhan labour portal online?',
        'What if the company claims it has a financial crisis?'
      ],
      chatResponseText
    };
  }

  // 3. EDUCATION / MARKSHEET & DEGREE WITHHELD
  if (
    problem.id.includes('edu') ||
    norm.includes('college') ||
    norm.includes('marksheet') ||
    norm.includes('degree') ||
    norm.includes('original document') ||
    norm.includes('tc')
  ) {
    const notice = `STATUTORY DEMAND FOR RETURN OF ORIGINAL CERTIFICATES & MARKSHEETS
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

To:
The Principal / Registrar
[College / University Name]
[Address, ${loc}]

Dear Sir/Madam,

RE: UNLAWFUL RETENTION OF ORIGINAL EDUCATIONAL CERTIFICATES IN VIOLATION OF UGC MANDATE (NOTIFICATION F.NO. 1-3/2007) AND AICTE GUIDELINES

1. I was enrolled in / applied for admission to [Course Name] with Enrollment/Application ID [Your ID].
2. My original 10th, 12th, and Transfer/Degree certificates were submitted solely for physical verification at the time of counseling/admission.
3. Under University Grants Commission (UGC) public notifications and Supreme Court directions, no higher education institution can retain original personal academic certificates of any student under any circumstances or coerce fee forfeiture.
4. TAKE NOTICE that you are requested to return all my original certificates within THREE (3) DAYS of receipt of this notice, failing which an immediate statutory complaint shall be lodged on the UGC e-Samadhan portal, AICTE Grievance Cell, and the District Collector for cancellation of institutional accreditation.

Yours faithfully,
[Your Name]
Phone: [Your Phone]`;

    const chatResponseText = `### Statutory Legal Solution: Educational Certificates Withheld

**Your Legal Standing & Rights:**
Under **UGC Notification F.No. 1-3/2007 (CPP-II)** and **AICTE Regulations**, colleges and universities are strictly prohibited from retaining original academic certificates (10th/12th marksheets, migration certificates, degrees) under any pretext, including unpaid fees or course cancellation. Doing so attracts immediate withdrawal of university recognition and penal action.

---

### Step-by-Step Immediate Action Plan:

1. **Step 1 — Serve Statutory UGC Notice to Principal (Today):**
   Serve the formal notice below directly to the College Principal, Registrar, and Management in writing with an acknowledgement stamp.

2. **Step 2 — File Complaint on UGC e-Samadhan Portal:**
   Register an emergency grievance on **UGC e-Samadhan (samadhan.ugc.ac.in)** or the **AICTE Centralized Grievance Portal**. UGC assigns an ombudsperson who directly issues a show-cause notice to the university registrar.

3. **Step 3 — Escalate to District Collector:**
   If the college does not release the documents within 48 hours, file a representation before the **District Magistrate / Collector** under the Right to Education & Public Service Guarantee Act.

---

### Pre-Drafted Statutory Notice:
\`\`\`
${notice}
\`\`\`

**Statutory Authority & Helpline:**
- **Nodal Agency:** University Grants Commission (UGC e-Samadhan) (${loc})
- **UGC Student Grievance Helpline:** **1800-111-656**
- **Statutory Resolution SLA:** 7 Days`;

    return {
      headline: 'Statutory Retrieval Pathway for Withheld Original Academic Documents',
      legalAssessment: 'Retaining original marksheets violates UGC and AICTE regulations. Colleges must verify originals and return them immediately at the time of admission.',
      immediateActionSteps: [
        'Deliver the UGC Statutory Notice to the Principal and Registrar with receiving copy.',
        'File an emergency ticket on UGC e-Samadhan (samadhan.ugc.ac.in).',
        'Escalate to District Magistrate for emergency administrative retrieval.'
      ],
      formalNoticeDraft: notice,
      statutoryAuthority: {
        department: 'University Grants Commission (UGC) & State Higher Education Council',
        act: 'UGC Fee Refund and Non-Retention of Original Certificates Mandate',
        helpline: '1800-111-656',
        slaDays: 7,
        portalUrl: 'https://samadhan.ugc.ac.in'
      },
      evidenceChecklist: [
        'Admission fee receipt / application acknowledgement',
        'Document submission acknowledgement slip issued by college',
        'Written request or email to college requesting return of certificates',
        'College response or denial email'
      ],
      followUpSuggestions: [
        'Can the college charge fine or penalty for cancelling admission?',
        'What is the UGC timeline for full fee refund after cancellation?',
        'Can I file a police complaint for illegal retention of documents?'
      ],
      chatResponseText
    };
  }

  // 4. GENERAL CITIZEN DISPUTE / CONSUMER / CIVIC / DEFAULT
  const genericChatText = `### Statutory Action Plan for ${problem.name}

**Your Legal Standing & Rights:**
Under **${problem.legalAct || 'Applicable Statutory and Administrative Law'}**, citizens are legally entitled to standard service delivery within a defined Right to Public Services timeline.

---

### Step-by-Step Immediate Action Plan:

1. **Step 1 — Formal Documentation:**
   Collate all primary evidence (receipts, correspondence, photographs, or transaction IDs) into a structured case dossier.

2. **Step 2 — File with Designated Statutory Department:**
   Lodge your grievance before **${problem.route}** (${loc}). Under statutory service delivery rules, the department must take cognizance within **${problem.estimatedResolutionDays} days**.

3. **Step 3 — Statutory Escalation Pathway:**
   If unresolved after ${problem.estimatedResolutionDays} days, escalate according to: **${problem.escalationLevel}**.

---

**Statutory Authority & Guidelines:**
- **Authority:** ${problem.route}
- **Governing Framework:** ${problem.legalAct}
- **Resolution SLA:** ${problem.estimatedResolutionDays} Days
- **Key Action:** ${problem.guidelines}`;

  return {
    headline: `Resolution Blueprint: ${problem.name}`,
    legalAssessment: problem.guidelines || 'Governed by statutory service delivery standards and public accountability frameworks.',
    immediateActionSteps: [
      `File formal representation before ${problem.route}.`,
      `Track status against the mandatory ${problem.estimatedResolutionDays}-day statutory SLA.`,
      `Escalate through ${problem.escalationLevel} if unaddressed.`
    ],
    statutoryAuthority: {
      department: problem.route,
      act: problem.legalAct,
      slaDays: problem.estimatedResolutionDays
    },
    evidenceChecklist: problem.evidence || [
      'Written correspondence or complaint receipts',
      'Proof of identity and address',
      'Photographs or document evidence'
    ],
    followUpSuggestions: [
      'What happens if the department exceeds the statutory SLA?',
      'How do I file an online RTI application for this case?',
      'Can I claim financial compensation for delayed public service?'
    ],
    chatResponseText: genericChatText
  };
}
