"use client";

import { CSSProperties, ChangeEvent } from "react";

interface ResumeUploadProps {
  resumeFileName: string;
  coverLetterText: string;
  onResumeFileChange: (fileName: string) => void;
  onCoverLetterChange: (text: string) => void;
}

export default function ResumeUpload({
  resumeFileName,
  coverLetterText,
  onResumeFileChange,
  onCoverLetterChange,
}: ResumeUploadProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onResumeFileChange(file?.name ?? "");
  };

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>2) Upload resume + optional cover letter</h2>

      <label style={styles.label}>
        Resume (PDF/DOC)
        <input type="file" accept=".pdf,.doc,.docx" style={styles.input} onChange={handleFileChange} />
      </label>
      {resumeFileName ? <p style={styles.hint}>Selected: {resumeFileName}</p> : null}

      <label style={styles.label}>
        Cover letter text (optional)
        <textarea
          style={styles.textarea}
          rows={6}
          placeholder="Paste your cover letter text..."
          value={coverLetterText}
          onChange={(event) => onCoverLetterChange(event.target.value)}
        />
      </label>
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
  label: {
    display: "grid",
    gap: 8,
    fontWeight: 600,
  },
  input: {
    padding: 8,
  },
  textarea: {
    padding: 12,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    resize: "vertical",
    fontSize: 14,
  },
  hint: {
    margin: 0,
    color: "#4b5563",
    fontSize: 14,
  },
};
