"use client";

import { CSSProperties, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TakeawayCard from "../../components/TakeawayCard";
import { requestInterviewFeedback } from "../../lib/api";
import { ChatMessage, InterviewFeedback } from "../../types";

// Fallback feedback used when the feedback API returns nothing. This
// provides candidates with some generic yet actionable guidance.
const fallbackFeedback: InterviewFeedback = {
  summary: "Good structure overall. Your examples were clear, but impact quantification can be stronger.",
  takeaways: [
    {
      title: "Sharpen your motivation",
      detail: "You explained your goals, but the link between goal and target curriculum can be tighter.",
      action: "Use a 30-second why-now + why-this-program statement.",
    },
    {
      title: "Increase measurable impact",
      detail: "Leadership stories are promising but lacked metrics.",
      action: "Add 1-2 quantified outcomes for each STAR example.",
    },
    {
      title: "Handle follow-up pressure",
      detail: "Some responses became broad under probing questions.",
      action: "End each answer with one concrete decision and result.",
    },
  ],
};

export default function ResultPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") ?? "";
  const rawMessages = searchParams.get("messages") ?? "[]";
  const schoolId = searchParams.get("schoolId") ?? "";
  const programId = searchParams.get("programId") ?? "";

  const parsedMessages = useMemo<ChatMessage[]>(() => {
    try {
      return JSON.parse(decodeURIComponent(rawMessages)) as ChatMessage[];
    } catch {
      return [];
    }
  }, [rawMessages]);

  const [feedback, setFeedback] = useState<InterviewFeedback>(fallbackFeedback);
  const [copied, setCopied] = useState(false);

  // Call the feedback API using the full transcript, session ID and context.
  const handleGenerateFeedback = async () => {
    const webhookFeedback = await requestInterviewFeedback({
      sessionId,
      messages: parsedMessages,
      schoolId,
      programId,
    });
    if (webhookFeedback) {
      setFeedback(webhookFeedback);
    }
  };

  // Copy the feedback summary and takeaways to the clipboard. Each takeaway
  // entry is formatted nicely for easy pasting into notes.
  const handleCopy = async () => {
    const text = [
      `Summary: ${feedback.summary}`,
      ...feedback.takeaways.map(
        (item, index) =>
          `${index + 1}. ${item.title}\nDetail: ${item.detail}\nNext action: ${item.action}`,
      ),
    ].join("\n\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Interview Feedback</h1>
        <p style={styles.subtitle}>{feedback.summary}</p>

        <div style={styles.buttonRow}>
          <button style={styles.secondaryButton} type="button" onClick={handleGenerateFeedback}>
            Refresh from API
          </button>
          <button style={styles.primaryButton} type="button" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy feedback"}
          </button>
        </div>

        <section style={styles.grid}>
          {feedback.takeaways.map((takeaway) => (
            <TakeawayCard
              key={takeaway.title}
              title={takeaway.title}
              detail={takeaway.detail}
              action={takeaway.action}
            />
          ))}
        </section>
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
    color: "#374151",
  },
  buttonRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "10px 14px",
    border: "none",
    borderRadius: 8,
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
};
