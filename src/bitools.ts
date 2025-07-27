import { showToast, Toast, Clipboard, showHUD } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { validateDNASequence, validateRNASequence } from "./sequence-constants";
import * as SeqUtils from "./sequence-utils";

// Define interface for sequence processing tools
interface SequenceTool {
  name: string;
  description: string;
  process: (sequence: string) => string;
  validate?: (sequence: string) => boolean;
}

// Define all sequence processing tools
const SEQUENCE_TOOLS: SequenceTool[] = [
  {
    name: "Reverse Complement",
    description: "Generate reverse complement sequence of DNA",
    validate: validateDNASequence,
    process: SeqUtils.reverseComplement,
  },
  {
    name: "To Lowercase",
    description: "Convert sequence to lowercase letters",
    process: SeqUtils.toLowerCase,
  },
  {
    name: "To Uppercase",
    description: "Convert sequence to uppercase letters",
    process: SeqUtils.toUpperCase,
  },
  {
    name: "DNA to RNA",
    description: "Transcribe DNA sequence to RNA sequence (T→U)",
    validate: validateDNASequence,
    process: SeqUtils.transcribe,
  },
  {
    name: "RNA to DNA",
    description: "Reverse transcribe RNA sequence to DNA sequence (U→T)",
    validate: validateRNASequence,
    process: SeqUtils.reverseTranscribe,
  },
  {
    name: "DNA Translate",
    description: "Translate DNA sequence to protein sequence",
    validate: validateDNASequence,
    process: SeqUtils.translate,
  },
  {
    name: "RNA Translate",
    description: "Translate RNA sequence to protein sequence",
    validate: validateRNASequence,
    process: SeqUtils.translateRNA,
  },
  {
    name: "Sequence Length",
    description: "Calculate the length of sequence (excluding spaces)",
    process: (sequence: string) => {
      const length = SeqUtils.getSequenceLength(sequence);
      return `Sequence length: ${length} bp/aa`;
    },
  },
  {
    name: "Sequence Statistics",
    description: "Count nucleotides/amino acids in the sequence",
    process: (sequence: string) => {
      const composition = SeqUtils.getSequenceComposition(sequence);
      return Object.entries(composition)
        .sort(([, a], [, b]) => b - a)
        .map(([char, count]) => `${char}: ${count}`)
        .join(", ");
    },
  },
  {
    name: "Remove Newlines",
    description: "Remove all newline characters from text",
    process: SeqUtils.removeNewlines,
  },
];

// Get clipboard content
async function getClipboardContent(): Promise<string> {
  try {
    const clipboardText = await Clipboard.readText();
    return clipboardText || "";
  } catch {
    // Failed to get clipboard content
    return "";
  }
}

// Main function to process sequence
async function processSequence(tool: SequenceTool) {
  try {
    // Get clipboard content
    const sequence = await getClipboardContent();

    if (!sequence.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Clipboard is empty, please copy the sequence to process first",
      });
      return;
    }

    // Validate sequence (if tool has validation function)
    if (tool.validate && !tool.validate(sequence)) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Invalid Sequence Format",
        message: `Input sequence does not meet the requirements for ${tool.name}`,
      });
      return;
    }

    // Process sequence
    const result = tool.process(sequence);

    // Copy result to clipboard
    await Clipboard.copy(result);

    // Show success notification
    await showHUD(`✅ ${tool.name} completed, result copied to clipboard`);
  } catch (error) {
    // Error occurred while processing sequence
    await showToast({
      style: Toast.Style.Failure,
      title: "Processing Failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Show tool selection menu
async function showToolMenu() {
  try {
    const toolNames = SEQUENCE_TOOLS.map((tool, index) => `${index + 1}. ${tool.name} - ${tool.description}`);
    const menuText = toolNames.join("\n");

    const script = `
      set toolList to "${menuText}"
      set userChoice to display dialog "Choose a biological tool to use:" & return & return & toolList default answer "1" with title "Biotools"
      set choiceNumber to text returned of userChoice as integer
      return choiceNumber
    `;

    const result = await runAppleScript(script);
    const toolIndex = parseInt(result.trim()) - 1;

    if (toolIndex >= 0 && toolIndex < SEQUENCE_TOOLS.length) {
      await processSequence(SEQUENCE_TOOLS[toolIndex]);
    } else {
      await showToast({
        style: Toast.Style.Failure,
        title: "Invalid Selection",
        message: "Please select a valid tool number",
      });
    }
  } catch {
    // Error occurred while showing tool menu
    // If AppleScript fails, use the first tool (Reverse Complement) directly
    await processSequence(SEQUENCE_TOOLS[0]);
  }
}

// Main function
export default async function main() {
  await showToolMenu();
}

// Export tool list for extensibility
export { SEQUENCE_TOOLS, processSequence };
export type { SequenceTool };
