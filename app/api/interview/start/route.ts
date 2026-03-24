import { NextResponse } from 'next/server';
import { InterviewSessionInput } from '../../../../types';

/**
 * API route that creates a new mock interview session. The client provides
 * the target school and program along with optional resume and cover letter
 * contents. We do not persist any session data on the server; instead
 * a unique session ID is generated and returned to the client. The client
 * should include this ID on subsequent requests.
 */
export async function POST(request: Request) {
  const body: InterviewSessionInput = await request.json();
  // Validate required fields
  if (!body.schoolId || !body.programId) {
    return NextResponse.json({ error: 'Missing schoolId or programId' }, { status: 400 });
  }
  const sessionId = crypto.randomUUID();
  return NextResponse.json({ sessionId });
}
