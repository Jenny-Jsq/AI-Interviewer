"use client";

import { CSSProperties, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SchoolSelector from "../components/SchoolSelector";
import programs from "../data/programs.json";
import schools from "../data/schools.json";
import { Program, School } from "../types";

export default function HomePage() {
  const router = useRouter();
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");

  const schoolList = schools as School[];
  const programList = programs as Program[];

  const canContinue = useMemo(
    () => Boolean(selectedSchoolId) && Boolean(selectedProgramId),
    [selectedSchoolId, selectedProgramId],
  );

  const handleContinue = () => {
    if (!canContinue) return;

    const params = new URLSearchParams({
      schoolId: selectedSchoolId,
      programId: selectedProgramId,
    });

    router.push(`/interview?${params.toString()}`);
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>AI Mock Interview</h1>
        <p style={styles.subtitle}>Single-session interview practice for school admissions.</p>

        <SchoolSelector
          schools={schoolList}
          programs={programList}
          selectedSchoolId={selectedSchoolId}
          selectedProgramId={selectedProgramId}
          onSchoolChange={(schoolId) => {
            setSelectedSchoolId(schoolId);
            setSelectedProgramId("");
          }}
          onProgramChange={setSelectedProgramId}
        />

        <button style={styles.cta} type="button" onClick={handleContinue} disabled={!canContinue}>
          Continue to Interview Setup
        </button>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "40px 16px",
  },
  container: {
    maxWidth: 760,
    margin: "0 auto",
    display: "grid",
    gap: 18,
  },
  h1: {
    margin: 0,
    fontSize: 34,
  },
  subtitle: {
    margin: 0,
    color: "#4b5563",
  },
  cta: {
    justifySelf: "start",
    padding: "11px 16px",
    borderRadius: 8,
    border: "none",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
};
