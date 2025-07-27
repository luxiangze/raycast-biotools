// FASTA format processing and batch sequence processing utility library
// Removed unused imports
import * as SeqUtils from "./sequence-utils";

// Sequence type detection
export function detectSequenceType(sequence: string): "DNA" | "RNA" | "PROTEIN" | "UNKNOWN" {
  const cleanSeq = sequence.replace(/\s/g, "");

  // First check if it's a DNA sequence (supports uppercase/lowercase A/a, T/t, C/c, G/g)
  const dnaPattern = /^[ATCGatcg]+$/;
  if (dnaPattern.test(cleanSeq)) {
    return "DNA";
  }

  // Check if it's an RNA sequence (supports uppercase/lowercase A/a, U/u, C/c, G/g)
  const rnaPattern = /^[AUCGaucg]+$/;
  if (rnaPattern.test(cleanSeq)) {
    return "RNA";
  }

  // Finally check if it's a protein sequence (supports uppercase/lowercase amino acids)
  const proteinPattern = /^[ACDEFGHIKLMNPQRSTVWYacdefghiklmnpqrstvwy*]+$/;
  if (proteinPattern.test(cleanSeq)) {
    return "PROTEIN";
  }

  return "UNKNOWN";
}

// FASTA sequence parsing
export interface FastaSequence {
  id: string;
  description: string;
  sequence: string;
  type: "DNA" | "RNA" | "PROTEIN" | "UNKNOWN";
}

export function parseFasta(fastaContent: string): FastaSequence[] {
  const sequences: FastaSequence[] = [];
  const lines = fastaContent.trim().split("\n");

  let currentId = "";
  let currentDescription = "";
  let currentSequence = "";

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith(">")) {
      // Save the previous sequence
      if (currentId && currentSequence) {
        sequences.push({
          id: currentId,
          description: currentDescription,
          sequence: currentSequence,
          type: detectSequenceType(currentSequence),
        });
      }

      // Start new sequence
      const headerParts = trimmedLine.substring(1).split(" ");
      currentId = headerParts[0] || `seq_${sequences.length + 1}`;
      currentDescription = headerParts.slice(1).join(" ") || "";
      currentSequence = "";
    } else if (trimmedLine) {
      currentSequence += trimmedLine;
    }
  }

  // Save the last sequence
  if (currentId && currentSequence) {
    sequences.push({
      id: currentId,
      description: currentDescription,
      sequence: currentSequence,
      type: detectSequenceType(currentSequence),
    });
  }

  return sequences;
}

// Convert sequence array to FASTA format
export function sequencesToFasta(sequences: FastaSequence[]): string {
  return sequences
    .map((seq) => {
      const header = seq.description ? `>${seq.id} ${seq.description}` : `>${seq.id}`;
      return `${header}\n${seq.sequence}`;
    })
    .join("\n");
}

// Re-export sequence processing functions for backward compatibility
export const reverseComplement = SeqUtils.reverseComplement;
export const transcribe = SeqUtils.transcribe;
export const reverseTranscribe = SeqUtils.reverseTranscribe;
export const translate = SeqUtils.translate;

// Sequence statistics
export interface SequenceStats {
  length: number;
  composition: { [key: string]: number };
  gcContent?: number;
  molecularWeight?: number;
}

export function calculateStats(sequence: string, type: string): SequenceStats {
  const cleanSeq = sequence.replace(/\s/g, "").toUpperCase();
  const composition: { [key: string]: number } = {};

  // Count base/amino acid composition
  for (const char of cleanSeq) {
    composition[char] = (composition[char] || 0) + 1;
  }

  const stats: SequenceStats = {
    length: cleanSeq.length,
    composition,
  };

  // Calculate GC content (for DNA/RNA only)
  if (type === "DNA" || type === "RNA") {
    const gcCount = (composition["G"] || 0) + (composition["C"] || 0);
    const totalBases =
      (composition["A"] || 0) +
      (composition["T"] || 0) +
      (composition["U"] || 0) +
      (composition["G"] || 0) +
      (composition["C"] || 0);
    if (totalBases > 0) {
      stats.gcContent = Math.round((gcCount / totalBases) * 100 * 10) / 10;
    }
  }

  // Simple molecular weight estimation
  if (type === "DNA") {
    // DNA average molecular weight ~650 Da/bp
    stats.molecularWeight = Math.round(cleanSeq.length * 650);
  } else if (type === "RNA") {
    // RNA average molecular weight ~340 Da/nt
    stats.molecularWeight = Math.round(cleanSeq.length * 340);
  } else if (type === "PROTEIN") {
    // Protein average molecular weight ~110 Da/aa
    stats.molecularWeight = Math.round(cleanSeq.length * 110);
  }

  return stats;
}

// Batch processing result interface
export interface BatchProcessResult {
  success: boolean;
  sequenceId: string;
  originalSequence: string;
  result?: string;
  stats?: SequenceStats;
  error?: string;
  sequenceType: string;
}

export interface BatchProcessResponse {
  results: BatchProcessResult[];
  totalCount: number;
  successCount: number;
  errorCount: number;
}

// Batch processing function
export function batchProcess(
  fastaContent: string,
  operation:
    | "reverse-complement"
    | "translate"
    | "rna-to-dna"
    | "dna-to-rna"
    | "remove-new-line"
    | "stats"
    | "to-lowercase"
    | "to-uppercase",
): BatchProcessResponse {
  const sequences = parseFasta(fastaContent);
  const results: BatchProcessResult[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const seq of sequences) {
    try {
      let result: string | undefined;
      let stats: SequenceStats | undefined;

      switch (operation) {
        case "reverse-complement":
          if (seq.type !== "DNA") {
            throw new Error("Reverse complement only applies to DNA sequences");
          }
          result = SeqUtils.reverseComplement(seq.sequence);
          break;
        case "dna-to-rna":
          if (seq.type !== "DNA") {
            throw new Error("Transcription only applies to DNA sequences");
          }
          result = SeqUtils.transcribe(seq.sequence);
          break;
        case "rna-to-dna":
          if (seq.type !== "RNA") {
            throw new Error("Reverse transcription only applies to RNA sequences");
          }
          result = SeqUtils.reverseTranscribe(seq.sequence);
          break;
        case "translate":
          if (seq.type !== "DNA" && seq.type !== "RNA") {
            throw new Error("Translation only applies to DNA or RNA sequences");
          }
          result = SeqUtils.translate(seq.sequence);
          break;
        case "remove-new-line":
          result = SeqUtils.removeNewlines(seq.sequence);
          break;
        case "to-lowercase":
          result = SeqUtils.toLowerCase(seq.sequence);
          break;
        case "to-uppercase":
          result = SeqUtils.toUpperCase(seq.sequence);
          break;
        case "stats":
          stats = calculateStats(seq.sequence, seq.type);
          result = `Length: ${stats.length}, Composition: ${Object.entries(stats.composition)
            .map(([k, v]) => `${k}:${v}`)
            .join(", ")}`;
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      results.push({
        success: true,
        sequenceId: seq.id,
        originalSequence: seq.sequence,
        result,
        stats,
        sequenceType: seq.type,
      });
      successCount++;
    } catch (error) {
      results.push({
        success: false,
        sequenceId: seq.id,
        originalSequence: seq.sequence,
        error: error instanceof Error ? error.message : "Unknown error",
        sequenceType: seq.type,
      });
      errorCount++;
    }
  }

  return {
    results,
    totalCount: sequences.length,
    successCount,
    errorCount,
  };
}
