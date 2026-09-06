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

// In-memory fallback stores for development or initial preview
if (!global.__fallbackCasesStore) {
  global.__fallbackCasesStore = [
    {
      id: 'case_demo_101',
      caseNumber: 'N1-2026-00101',
      title: 'Road Potholes & Severely Damaged Streets',
      category: 'Civic & Municipal',
      priority: 'HIGH',
      status: 'VERIFIED',
      description: 'Dangerous pothole near Shivaji Nagar metro station pillar 42 causing two-wheeler skids.',
      location: 'Shivaji Nagar, Ward 42, Pune',
      problemId: 'civic-pothole',
      isUnknownIssue: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
      events: [
        {
          id: 'ev_1',
          caseId: 'case_demo_101',
          status: 'DRAFT',
          actorType: 'CITIZEN',
          note: 'Citizen initiated complaint draft with photo evidence',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'ev_2',
          caseId: 'case_demo_101',
          status: 'VERIFIED',
          actorType: 'NOVA_AI',
          note: 'NOVA verified geotag and prepared Municipal PWD routing dossier',
          createdAt: new Date(Date.now() - 43200000).toISOString()
        }
      ],
      evidenceList: [
        {
          id: 'evi_1',
          caseId: 'case_demo_101',
          fileName: 'pothole_pillar42.jpg',
          fileUrl: '/pothole_sample.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1048576,
          ocrExtracted: 'Geotag Ward 42 Pune • Timestamp 2026-09-05',
          verified: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
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
    if (!global.__prismaClientInstance) {
      global.__prismaClientInstance = new PrismaClient();
    }
    prismaClient = global.__prismaClientInstance;
  }
} catch (e) {
  console.warn('[NagrikOne DB] PrismaClient instantiation note:', e);
  prismaClient = null;
}

export const db = prismaClient || (new PrismaClient() as any);
export const fallbackStore = {
  cases: global.__fallbackCasesStore as any[],
  payments: global.__fallbackPaymentsStore as any[],
  problems: PROBLEM_TYPES
};
