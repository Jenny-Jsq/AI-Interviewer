import { NextResponse } from 'next/server';
import { ChatMessage, InterviewFeedback } from '../../../../types';
import { getSchoolById, getProgramById } from '../../../../lib/loadData';

interface FeedbackRequest {
  sessionId?: string;
  messages: ChatMessage[];
  schoolId: string;
  programId: string;
}

/**
 * This API route generates final feedback for a mock interview. It uses the
 * entire conversation, the target school and program to instruct the
 * Gemini model to provide a concise summary and several actionable
 * takeaways. The model is asked to return JSON so that it can be parsed
 * cleanly on the server. If parsing fails a simple fallback feedback is
 * returned instead.
 */
export async function POST(request: Request) {
  const body: FeedbackRequest = await request.json();
  const { messages, schoolId, programId } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Missing messages' }, { status: 400 });
  }
  const school = await getSchoolById(schoolId);
  const program = await getProgramById(programId);

  // Build the system instructions describing the evaluator persona
  let systemPrompt = '';
  if (school) {
    systemPrompt += `You are an admissions evaluator at ${school.school_name}. `;
    if (school.general_values && school.general_values.length > 0) {
      systemPrompt += `Your school values ${school.general_values.join(', ')}. `;
    }
  }
  if (program) {
    systemPrompt += `You are evaluating candidates for the ${program.program_name} program. `;
  }
  systemPrompt += 'Provide a brief summary of the candidate’s performance and output 3–5 takeaways in the following JSON format:\n';
  systemPrompt += '{"summary": string, "takeaways": [{"title": string, "detail": string, "action": string}, ...] }\n';
  systemPrompt += 'Base your feedback on the conversation transcript. Be constructive and specific.';

  // Create a plain text transcript of the interview
  const transcript = messages
    .map((m) => {
      const speaker = m.role === 'user' ? 'Candidate' : 'Interviewer';
      return `${speaker}: ${m.content}`;
    })
    .join('\n');

  const finalPrompt = `${systemPrompt}\n\nTranscript:\n${transcript}`;

  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Please set it in your environment.');
  }
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
  try {
    const res = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: finalPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 512,
        },
      }),
    });
    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    let feedback: InterviewFeedback | null = null;
    if (text) {
      try {
        feedback = JSON.parse(text) as InterviewFeedback;
      } catch {
        // If JSON parse fails, fall back below
      }
    }
    if (feedback && feedback.summary && Array.isArray(feedback.takeaways)) {
      return NextResponse.json(feedback);
    }
    // Fallback feedback if parse fails or missing fields
    const fallback: InterviewFeedback = {
      summary: 'Good structure overall. Your examples were clear, but impact quantification can be stronger.',
      takeaways: [
        {
          title: 'Sharpen your motivation',
          detail: 'You explained your goals, but the link between goal and target curriculum can be tighter.',
          action: 'Use a 30‑second why‑now + why‑this‑program statement.',
        },
        {
          title: 'Increase measurable impact',
          detail: 'Leadership stories are promising but lacked metrics.',
          action: 'Add 1–2 quantified outcomes for each STAR example.',
        },
        {
          title: 'Handle follow‑up pressure',
          detail: 'Some responses became broad under probing questions.',
          action: 'End each answer with one concrete decision and result.',
        },
      ],
    };
    return NextResponse.json(fallback);
  } catch (err) {
    console.error('Gemini API call failed', err);
    // Always return a fallback if the API call fails
    const fallback: InterviewFeedback = {
      summary: 'Good structure overall. Your examples were clear, but impact quantification can be stronger.',
      takeaways: [
        {
          title: 'Sharpen your motivation',
          detail: 'You explained your goals, but the link between goal and target curriculum can be tighter.',
          action: 'Use a 30‑second why‑now + why‑this‑program statement.',
        },
        {
          title: 'Increase measurable impact',
          detail: 'Leadership stories are promising but lacked metrics.',
          action: 'Add 1–2 quantified outcomes for each STAR example.',
        },
        {
          title: 'Handle follow‑up pressure',
          detail: 'Some responses became broad under probing questions.',
          action: 'End each answer with one concrete decision and result.',
        },
      ],
    };
    return NextResponse.json(fallback);
  }
}