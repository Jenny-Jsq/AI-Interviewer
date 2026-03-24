"use client";

import { CSSProperties, useMemo } from "react";
import { Program, School } from "../types";

interface SchoolSelectorProps {
  schools: School[];
  programs: Program[];
  selectedSchoolId: string;
  selectedProgramId: string;
  onSchoolChange: (schoolId: string) => void;
  onProgramChange: (programId: string) => void;
}

export default function SchoolSelector({
  schools,
  programs,
  selectedSchoolId,
  selectedProgramId,
  onSchoolChange,
  onProgramChange,
}: SchoolSelectorProps) {
  const filteredPrograms = useMemo(
    () => programs.filter((program) => program.school_id === selectedSchoolId),
    [programs, selectedSchoolId],
  );

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>1) Select your target school and program</h2>
      <label style={styles.label}>
        School
        <select
          style={styles.input}
          value={selectedSchoolId}
          onChange={(event) => onSchoolChange(event.target.value)}
        >
          <option value="">Choose a school</option>
          {schools.map((school) => (
            <option key={school.school_id} value={school.school_id}>
              {school.school_name} ({school.country})
            </option>
          ))}
        </select>
      </label>

      <label style={styles.label}>
        Program
        <select
          style={styles.input}
          value={selectedProgramId}
          onChange={(event) => onProgramChange(event.target.value)}
          disabled={!selectedSchoolId}
        >
          <option value="">Choose a program</option>
          {filteredPrograms.map((program) => (
            <option key={program.program_id} value={program.program_id}>
              {program.program_name} · {program.degree_type}
            </option>
          ))}
        </select>
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
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    background: "#fff",
  },
};
