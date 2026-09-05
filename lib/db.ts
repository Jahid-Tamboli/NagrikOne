import { PrismaClient } from '@prisma/client';
import { PROBLEM_TYPES } from './problemTypes';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClientInstance: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __fallbackCasesStore: any[] | undefined;
  // eslint-disable-next-line no-var
  var __fallbackPaymentsStore: any[] | undefined;
}

// In-memory fallback stores for demo, preview, and zero-DB deployments
if (!global.__fallbackCasesStore) {
  global.__fallbackCasesStore = [
    {
      id: 'case_demo_101',
      title: 'Road Pothole / Damaged Road',
      category: 'Civic',
      priority: 'HIGH',
      status: 'VERIFIED',
      description: 'Dangerous pothole near Shivaji Nagar metro station pillar 42.',
      location: 'Shivaji Nagar, Pune',
      problemId: 'civic-pothole',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
      events: [
        { id: 'ev_1', caseId: 'case_demo_101', status: 'DRAFT', note: 'Resolution draft created', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: 'ev_2', caseId: 'case_demo_101', status: 'VERIFIED', note: 'Evidence verified by citizen', createdAt: new Date(Date.now() - 43200000).toISOString() }
      ],
      payments: []
    }
  ];
}

if (!global.__fallbackPaymentsStore) {
  global.__fallbackPaymentsStore = [];
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
    // DATABASE_URL is either missing or non-postgres (e.g. SQLite dev.db in .env.example)
    // We instantiate lazily if valid, else use fallback
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
  cases: global.__fallbackCasesStore,
  payments: global.__fallbackPaymentsStore,
  problems: PROBLEM_TYPES
};
