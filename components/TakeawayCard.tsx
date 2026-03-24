import { CSSProperties } from "react";

interface TakeawayCardProps {
  title: string;
  detail: string;
  action: string;
}

export default function TakeawayCard({ title, detail, action }: TakeawayCardProps) {
  return (
    <article style={styles.card}>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.detail}>{detail}</p>
      <p style={styles.action}>Next action: {action}</p>
    </article>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#fff",
    padding: 16,
    display: "grid",
    gap: 8,
  },
  title: {
    margin: 0,
    fontSize: 16,
  },
  detail: {
    margin: 0,
    color: "#374151",
    fontSize: 14,
  },
  action: {
    margin: 0,
    fontSize: 14,
    color: "#1f2937",
    fontWeight: 600,
  },
};
