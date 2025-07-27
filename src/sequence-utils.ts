// Shared sequence processing utility functions
import { CODON_TABLE, COMPLEMENT_MAP } from "./sequence-constants";

// Reverse complement sequence
export function reverseComplement(sequence: string): string {
  return sequence
    .replace(/\s/g, "")
    .split("")
    .map((base) => COMPLEMENT_MAP[base] || base)
    .reverse()
    .join("");
}

// DNA transcription to RNA
export function transcribe(sequence: string): string {
  return sequence.replace(/T/g, "U").replace(/t/g, "u");
}

// RNA reverse transcription to DNA
export function reverseTranscribe(sequence: string): string {
  return sequence.replace(/U/g, "T").replace(/u/g, "t");
}

// Translate sequence to protein
export function translate(sequence: string): string {
  const cleanSeq = sequence.replace(/\s/g, "").toUpperCase();
  let protein = "";

  for (let i = 0; i < cleanSeq.length - 2; i += 3) {
    const codon = cleanSeq.substring(i, i + 3);
    const aminoAcid = CODON_TABLE[codon] || "X";
    protein += aminoAcid;

    // Stop when encountering stop codon
    if (aminoAcid === "*") {
      break;
    }
  }

  return protein;
}

// RNA translation to protein (convert to DNA first then translate)
export function translateRNA(sequence: string): string {
  const dnaSeq = reverseTranscribe(sequence);
  return translate(dnaSeq);
}

// Calculate sequence length (excluding spaces)
export function getSequenceLength(sequence: string): number {
  return sequence.replace(/\s/g, "").length;
}

// Calculate sequence composition statistics
export function getSequenceComposition(sequence: string): { [key: string]: number } {
  const cleanSeq = sequence.replace(/\s/g, "");
  const composition: { [key: string]: number } = {};

  for (const char of cleanSeq.toUpperCase()) {
    composition[char] = (composition[char] || 0) + 1;
  }

  return composition;
}

// Remove newline characters
export function removeNewlines(sequence: string): string {
  return sequence.replace(/[\r\n]/g, "");
}

// Convert to uppercase
export function toUpperCase(sequence: string): string {
  return sequence.toUpperCase();
}

// Convert to lowercase
export function toLowerCase(sequence: string): string {
  return sequence.toLowerCase();
}
