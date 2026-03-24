import { ChatMessage, InterviewFeedback, InterviewSessionInput } from "../types";

/**
 * A small wrapper around the browser's fetch API that posts JSON to a relative
 * endpoint on the same origin. It returns the parsed JSON response or
 * `null` if the request fails for any reason. This helper centralises
 * error handling so that callers don't need to check `response.ok` on every
 * request.
 */
async function postToLocal<TPayload, TResponse>(endpoint: string, payload: TPayload): Promise<TResponse | null> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`API call failed: ${res.status} ${res.statusText}`);
      return null;
    }
    return (await res.json()) as TResponse;
  } catch (err) {
    console.error('API call error', err);
    return null;
  }
}

/**
 * Start a new interview session. The server will return a unique session ID
 * that can be passed back on subsequent calls. You must provide a
 * `schoolId` and `programId`; the resume text and cover letter are
 * optional.
 */
export async function startInterviewSession(payload: InterviewSessionInput): Promise<{ sessionId: string } | null> {
  return postToLocal<InterviewSessionInput, { sessionId: string }>('/api/interview/start', payload);
}

/**
 * Send a chat message during an active interview. The full conversation
 * history must be included along with the school and program IDs so that the
 * backend can construct an appropriate prompt. The server will respond
 * with the assistant's next reply. If the call fails or returns nothing
 * the caller should fall back to a generic follow‑up question.
 */
export async function sendInterviewMessage(payload: {
  sessionId?: string;
  messages: ChatMessage[];
  schoolId: string;
  programId: string;
}): Promise<{ reply: string } | null> {
  return postToLocal<typeof payload, { reply: string }>('/api/interview/turn', payload);
}

/**
 * Request final feedback for a completed interview. The backend will use
 * the full conversation history along with the school and program IDs to
 * generate a summary and several improvement takeaways. If the call fails
 * the frontend can display a fallback feedback object.
 */
export async function requestInterviewFeedback(payload: {
  sessionId?: string;
  messages: ChatMessage[];
  schoolId: string;
  programId: string;
}): Promise<InterviewFeedback | null> {
  return postToLocal<typeof payload, InterviewFeedback>('/api/interview/feedback', payload);
}