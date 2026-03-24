import { promises as fs } from 'fs';
import path from 'path';
import { School, Program } from '../types';

/**
 * Helpers to load school and program data from the local JSON files. The data
 * files are read lazily and cached in memory so that repeated calls do not
 * re‑read the files from disk. If an ID is not found the helpers return
 * `null` instead of throwing. The JSON files live in the `data/` folder at
 * the project root.
 */

let schoolsCache: School[] | null = null;
let programsCache: Program[] | null = null;

async function loadSchools(): Promise<School[]> {
  if (schoolsCache) return schoolsCache;
  const filePath = path.join(process.cwd(), 'data', 'schools.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  schoolsCache = JSON.parse(fileContent) as School[];
  return schoolsCache;
}

async function loadPrograms(): Promise<Program[]> {
  if (programsCache) return programsCache;
  const filePath = path.join(process.cwd(), 'data', 'programs.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  programsCache = JSON.parse(fileContent) as Program[];
  return programsCache;
}

export async function getSchoolById(id: string): Promise<School | null> {
  const schools = await loadSchools();
  return schools.find((s) => s.school_id === id) ?? null;
}

export async function getProgramById(id: string): Promise<Program | null> {
  const programs = await loadPrograms();
  return programs.find((p) => p.program_id === id) ?? null;
}