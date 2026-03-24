"use client";

import { CSSProperties, FormEvent, useState } from "react";
import { ChatMessage } from "../types";

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
}

export default function ChatWindow({ messages, onSendMessage }: ChatWindowProps) {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;

    setIsSending(true);
    await onSendMessage(draft.trim());
    setDraft("");
    setIsSending(false);
  };

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>3) Mock interview chat</h2>
      <div style={styles.messageList}>
        {messages.map((message) => (
          <article
            key={message.id}
            style={{
              ...styles.bubble,
              ...(message.role === "user" ? styles.userBubble : styles.assistantBubble),
            }}
          >
            {message.content}
          </article>
        ))}
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          style={styles.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type your answer..."
        />
        <button style={styles.button} type="submit" disabled={isSending}>
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    display: "grid",
    gap: 14,
  },
  title: {
    margin: 0,
    fontSize: 20,
  },
  messageList: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#f9fafb",
    padding: 12,
    minHeight: 220,
    maxHeight: 320,
    overflowY: "auto",
    display: "grid",
    gap: 10,
  },
  bubble: {
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 14,
    lineHeight: 1.4,
    maxWidth: "85%",
  },
  userBubble: {
    justifySelf: "end",
    background: "#dbeafe",
  },
  assistantBubble: {
    justifySelf: "start",
    background: "#ecfeff",
  },
  form: {
    display: "flex",
    gap: 10,
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
  },
  button: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
};
