import { ChatMessage, InterviewFeedback, InterviewSessionInput } from "../types";

const MAKE_START_WEBHOOK = process.env.NEXT_PUBLIC_MAKE_START_WEBHOOK_URL;
const MAKE_CHAT_WEBHOOK = process.env.NEXT_PUBLIC_MAKE_CHAT_WEBHOOK_URL;
const MAKE_FEEDBACK_WEBHOOK = process.env.NEXT_PUBLIC_MAKE_FEEDBACK_WEBHOOK_URL;

async function postToMake<TPayload, TResponse>(url: string | undefined, payload: TPayload): Promise<TResponse | null> {
  if (!url) {
    return null;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Make webhook failed: ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export async function startInterviewSession(payload: InterviewSessionInput): Promise<{ sessionId: string } | null> {
  return postToMake<InterviewSessionInput, { sessionId: string }>(MAKE_START_WEBHOOK, payload);
}

export async function sendInterviewMessage(payload: {
  sessionId?: string;
  messages: ChatMessage[];
}): Promise<{ reply: string } | null> {
  return postToMake<typeof payload, { reply: string }>(MAKE_CHAT_WEBHOOK, payload);
}

export async function requestInterviewFeedback(payload: {
  sessionId?: string;
  messages: ChatMessage[];
}): Promise<InterviewFeedback | null> {
  return postToMake<typeof payload, InterviewFeedback>(MAKE_FEEDBACK_WEBHOOK, payload);
}
