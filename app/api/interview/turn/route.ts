import { NextResponse } from 'next/server';
import { ChatMessage } from '../../../../types';
import { getSchoolById, getProgramById } from '../../../../lib/loadData';

interface TurnRequest {
  sessionId?: string;
  messages: ChatMessage[];
  schoolId: string;
  programId: string;
}

/**
 * This API route processes a single interview turn. It receives the entire
 * conversation history along with the school and program identifiers, then
 * calls the Gemini API to generate the next interviewer question. If the
 * LLM fails or returns no usable text a generic follow‑up question is
 * returned instead.
 */
export async function POST(request: Request) {
  const body: TurnRequest = await request.json();
  const { messages, schoolId, programId } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ reply: null }, { status: 400 });
  }
  // Retrieve school/program context
  const school = await getSchoolById(schoolId);
  const program = await getProgramById(programId);

  // Construct a system prompt that instructs the model to act as a
  // professional admissions interviewer. We incorporate the school's
  // general values, interview tone and example question styles when
  // available. The prompt also asks the model to ask exactly one
  // question per turn and to base follow‑ups on the candidate's
  // previous responses.
  let systemPrompt = '';
  if (school) {
    systemPrompt += `You are an admissions interviewer for ${school.school_name}. `;
    if (school.general_values && school.general_values.length > 0) {
      systemPrompt += `Your school values ${school.general_values.join(', ')}. `;
    }
    if (school.interview_tone && school.interview_tone.length > 0) {
      systemPrompt += `Your interview tone should be ${school.interview_tone.join(', ')}. `;
    }
    if (school.example_question_style && school.example_question_style.length > 0) {
      systemPrompt += `Example question style includes: ${school.example_question_style.join('; ')}. `;
    }
  }
  if (program) {
    systemPrompt += `You are interviewing for the ${program.program_name} program. `;
    if (program.highlights && program.highlights.length > 0) {
      systemPrompt += `The program highlights include ${program.highlights.join(', ')}. `;
    }
  }
  systemPrompt += 'Ask one concise, open‑ended question at a time. Use previous answers to guide your follow‑up.';

  // Convert conversation history into a conversational transcript for
  // context. Label speaker roles clearly for the model.
  const transcript = messages
    .map((m) => {
      const speaker = m.role === 'user' ? 'Candidate' : 'Interviewer';
      return `${speaker}: ${m.content}`;
    })
    .join('\n');

  // Compose the final prompt for the model. We ask it to generate the next
  // question without a prefix so that the returned text can be used
  // directly.
  const finalPrompt = `${systemPrompt}\n\nConversation so far:\n${transcript}\n\nAs the interviewer, ask your next question.`;

  // Call the Gemini API. The API key must be provided via an environment
  // variable at runtime. Replace the placeholder below with your actual key.
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Please set it in your environment.');
  }
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
  try {
    const geminiRes = await fetch(geminiEndpoint, {
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
          temperature: 0.7,
          maxOutputTokens: 128,
        },
      }),
    });
    const data = await geminiRes.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      'Thank you for sharing. Could you provide a concrete example that illustrates your leadership?';
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Gemini API call failed', err);
    // Fallback reply if the API call fails
    return NextResponse.json({ reply: 'Thanks for your answer. Can you share a specific example where you drove a team towards a goal?' });
  }
}