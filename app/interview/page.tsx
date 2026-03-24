"use client";

import { CSSProperties, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatWindow from "../../components/ChatWindow";
import ResumeUpload from "../../components/ResumeUpload";
import { sendInterviewMessage, startInterviewSession } from "../../lib/api";
import { ChatMessage } from "../../types";

const seedMessage: ChatMessage = {
  id: "assistant-1",
  role: "assistant",
  content:
    "Hello! Let's begin your mock interview. Tell me about yourself and why now is the right time for this program.",
  timestamp: Date.now(),
};

export default function InterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const schoolId = searchParams.get("schoolId") ?? "";
  const programId = searchParams.get("programId") ?? "";

  const [resumeFileName, setResumeFileName] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([seedMessage]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const canStart = useMemo(() => Boolean(schoolId) && Boolean(programId), [schoolId, programId]);

  const handleStartIfNeeded = async () => {
    if (sessionId || !canStart) return;
    const response = await startInterviewSession({ schoolId, programId, coverLetterText });
    if (response?.sessionId) {
      setSessionId(response.sessionId);
    }
  };

  const handleSendMessage = async (content: string) => {
    await handleStartIfNeeded();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    const webhookResponse = await sendInterviewMessage({
      sessionId,
      messages: nextMessages,
    });

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content:
        webhookResponse?.reply ??
        "Thanks for sharing. Can you give one concrete example where you showed leadership under pressure?",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
  };

  const handleFinish = () => {
    const payload = encodeURIComponent(JSON.stringify(messages));
    router.push(`/result?messages=${payload}&sessionId=${sessionId ?? ""}`);
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Interview Session</h1>
        <p style={styles.subtitle}>
          Target: <strong>{schoolId || "N/A"}</strong> · Program: <strong>{programId || "N/A"}</strong>
        </p>

        <ResumeUpload
          resumeFileName={resumeFileName}
          coverLetterText={coverLetterText}
          onResumeFileChange={setResumeFileName}
          onCoverLetterChange={setCoverLetterText}
        />

        <ChatWindow messages={messages} onSendMessage={handleSendMessage} />

        <button style={styles.button} type="button" onClick={handleFinish}>
          Finish and View Feedback
        </button>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "32px 16px",
  },
  container: {
    maxWidth: 860,
    margin: "0 auto",
    display: "grid",
    gap: 16,
  },
  h1: {
    margin: 0,
    fontSize: 30,
  },
  subtitle: {
    margin: 0,
    color: "#4b5563",
  },
  button: {
    justifySelf: "start",
    padding: "11px 16px",
    border: "none",
    borderRadius: 8,
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
};
