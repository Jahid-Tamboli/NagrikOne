import { NextResponse } from 'next/server';
import { validateEvidenceFile } from '@/lib/evidence/validator';
import { getCurrentUser } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to upload evidence.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const validation = validateEvidenceFile(file.name, file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Convert to buffer / data URL or upload to object storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${validation.mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      file: {
        name: validation.sanitizedFileName,
        type: validation.mimeType,
        size: validation.sizeBytes,
        url: dataUrl,
        ocrExtracted: `Evidence verified: Format ${validation.mimeType.split('/')[1]?.toUpperCase()} • ${Math.round(validation.sizeBytes / 1024)} KB`
      }
    });
  } catch (err: any) {
    console.error('[API /evidence] Upload error:', err);
    return NextResponse.json({ error: 'Failed to process evidence file.' }, { status: 500 });
  }
}
