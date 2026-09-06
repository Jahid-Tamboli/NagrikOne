import { PrismaClient } from '@prisma/client';
import { PROBLEM_TYPES } from './problemTypes';

export interface FallbackMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  structuredData?: any;
  createdAt: string;
}

export interface FallbackConversation {
  id: string;
  userId?: string;
  title?: string;
  category?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  messages: FallbackMessage[];
}

export interface FallbackCase {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  description?: string;
  location?: string;
  statutoryRoute?: string;
  suggestedUrgency?: string;
  evidence?: any;
  userId?: string;
  problemId?: string;
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
  events?: { id: string; caseId: string; status: string; note?: string; createdAt: string }[];
  payments?: any[];
}

declare global {
  // eslint-disable-next-line no-var
  var __prismaClientInstance: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __fallbackCasesStore: FallbackCase[] | undefined;
  // eslint-disable-next-line no-var
  var __fallbackPaymentsStore: any[] | undefined;
  // eslint-disable-next-line no-var
  var __fallbackConversationsStore: FallbackConversation[] | undefined;
}

// In-memory fallback stores for demo, preview, and zero-DB deployments
if (!global.__fallbackCasesStore) {
  global.__fallbackCasesStore = [
    {
      id: 'CASE-2026-8921',
      title: 'Road Potholes & Severely Damaged Streets',
      category: 'Civic & Municipal',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      description: 'Severe pothole crater near Shivaji Nagar Metro Station Gate 2 causing two-wheeler accidents.',
      location: 'Ward 42, Shivaji Nagar, Pune',
      statutoryRoute: 'Municipal Corporation / PWD Grievance Portal',
      suggestedUrgency: 'HIGH',
      problemId: 'civic-pothole',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      events: [
        { id: 'ev_1', caseId: 'CASE-2026-8921', status: 'DRAFT', note: 'Issue analyzed and drafted by NOVA AI', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: 'ev_2', caseId: 'CASE-2026-8921', status: 'SUBMITTED', note: 'Case dispatched to Ward Junior Engineer & PWD Portal', createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString() },
        { id: 'ev_3', caseId: 'CASE-2026-8921', status: 'IN_PROGRESS', note: 'Inspection work order #PWD-PN-8819 generated; asphalt crew scheduled', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() }
      ],
      payments: []
    },
    {
      id: 'CASE-2026-4412',
      title: 'Unauthorized UPI Deduction & Bank Reversal Dispute',
      category: 'Banking & Finance',
      priority: 'CRITICAL',
      status: 'WAITING_FOR_CITIZEN',
      description: 'Amount ₹14,500 debited via UPI RRN 419283719200 but merchant failed with timeout; bank denied chargeback.',
      location: 'Bank Branch, Connaught Place, New Delhi',
      statutoryRoute: 'RBI Banking Ombudsman Scheme / CMS Portal',
      suggestedUrgency: 'CRITICAL',
      problemId: 'bank-failed-upi-chargeback',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      events: [
        { id: 'ev_4', caseId: 'CASE-2026-4412', status: 'DRAFT', note: 'Bank grievance docket compiled with statutory RBI turnaround citations', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: 'ev_5', caseId: 'CASE-2026-4412', status: 'WAITING_FOR_CITIZEN', note: 'Pending citizen bank statement PDF upload for Ombudsman filing', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() }
      ],
      payments: []
    }
  ];
}

if (!global.__fallbackPaymentsStore) {
  global.__fallbackPaymentsStore = [];
}

if (!global.__fallbackConversationsStore) {
  global.__fallbackConversationsStore = [];
}

let prismaClient: PrismaClient | null = null;

try {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
    if (!global.__prismaClientInstance) {
      global.__prismaClientInstance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
      });
    }
    prismaClient = global.__prismaClientInstance;
  } else {
    if (!global.__prismaClientInstance) {
      global.__prismaClientInstance = new PrismaClient();
    }
    prismaClient = global.__prismaClientInstance;
  }
} catch (e) {
  console.warn('[NagrikOne DB] PrismaClient initialization deferred; fallback mode enabled:', e);
  prismaClient = null;
}

export const db = prismaClient || (new PrismaClient() as any);
export const fallbackStore = {
  cases: global.__fallbackCasesStore as FallbackCase[],
  payments: global.__fallbackPaymentsStore as any[],
  conversations: global.__fallbackConversationsStore as FallbackConversation[],
  problems: PROBLEM_TYPES
};

