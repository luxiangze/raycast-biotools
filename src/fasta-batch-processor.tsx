import { useState } from "react";
import { Action, ActionPanel, Form, showToast, Toast, Clipboard, Detail } from "@raycast/api";
import { batchProcess, BatchProcessResponse } from "./fasta-utils";

interface ToolOption {
  id: string;
  name: string;
  description: string;
  operation:
    | "reverse-complement"
    | "translate"
    | "rna-to-dna"
    | "dna-to-rna"
    | "remove-new-line"
    | "stats"
    | "to-lowercase"
    | "to-uppercase";
}

const BATCH_TOOLS: ToolOption[] = [
  {
    id: "reverse-complement",
    name: "Reverse Complement",
    description: "Generate reverse complement sequence of DNA",
    operation: "reverse-complement",
  },
  {
    id: "translate",
    name: "Translation",
    description: "Translate DNA/RNA sequence to protein sequence",
    operation: "translate",
  },
  {
    id: "stats",
    name: "Statistical Analysis",
    description: "Get sequence statistics (length, composition, GC content, etc.)",
    operation: "stats",
  },
  {
    id: "remove-new-line",
    name: "Remove Newlines",
    description: "Remove newline characters from FASTA sequences",
    operation: "remove-new-line",
  },
  {
    id: "to-lowercase",
    name: "Convert to Lowercase",
    description: "Convert all letters in FASTA sequences to lowercase",
    operation: "to-lowercase",
  },
  {
    id: "to-uppercase",
    name: "Convert to Uppercase",
    description: "Convert all letters in FASTA sequences to uppercase",
    operation: "to-uppercase",
  },
  {
    id: "dna-to-rna",
    name: "DNA to RNA",
    description: "Convert DNA sequence to RNA sequence (T→U)",
    operation: "dna-to-rna",
  },
  {
    id: "rna-to-dna",
    name: "RNA to DNA",
    description: "Convert RNA sequence to DNA sequence (U→T)",
    operation: "rna-to-dna",
  },
];

function formatBatchResults(response: BatchProcessResponse, operation: string): string {
  let output = `# Batch Processing Results - ${operation}\n\n`;
  output += `**Total**: ${response.totalCount} sequences\n`;
  output += `**Success**: ${response.successCount}\n`;
  output += `**Failed**: ${response.errorCount}\n\n`;

  if (response.errorCount > 0) {
    output += `## Error Information\n\n`;
    response.results
      .filter((r) => !r.success)
      .forEach((result) => {
        output += `- **${result.sequenceId}**: ${result.error}\n`;
      });
    output += `\n`;
  }

  const successResults = response.results.filter((r) => r.success);
  if (successResults.length > 0) {
    if (operation === "Statistical Analysis") {
      output += `## Statistical Results\n\n`;

      // Summary statistics
      const totalLength = successResults.reduce((sum, r) => sum + (r.stats?.length || 0), 0);
      const avgLength = Math.round(totalLength / successResults.length);
      output += `### Summary Information\n`;
      output += `- **Total Length**: ${totalLength.toLocaleString()} bp/aa\n`;
      output += `- **Average Length**: ${avgLength.toLocaleString()} bp/aa\n`;
      output += `- **Longest Sequence**: ${Math.max(...successResults.map((r) => r.stats?.length || 0)).toLocaleString()} bp/aa\n`;
      output += `- **Shortest Sequence**: ${Math.min(...successResults.map((r) => r.stats?.length || 0)).toLocaleString()} bp/aa\n\n`;

      // Detailed statistics
      output += `### Detailed Statistics\n\n`;
      successResults.forEach((result) => {
        if (result.stats) {
          output += `#### ${result.sequenceId}\n`;
          output += `- **Type**: ${result.sequenceType}\n`;
          output += `- **Length**: ${result.stats.length.toLocaleString()}\n`;

          if (result.stats.gcContent !== undefined) {
            output += `- **GC Content**: ${result.stats.gcContent}%\n`;
          }

          if (result.stats.molecularWeight !== undefined) {
            output += `- **Molecular Weight**: ${result.stats.molecularWeight.toLocaleString()} Da\n`;
          }

          output += `- **Composition**:\n`;
          const sortedComposition = Object.entries(result.stats.composition).sort(([, a], [, b]) => b - a);

          const total = Object.values(result.stats.composition).reduce((sum, c) => sum + c, 0);

          sortedComposition.forEach(([base, count]) => {
            const percent = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
            output += `  - ${base}: ${count} (${percent}%)\n`;
          });

          output += `\n`;
        }
      });
    } else {
      output += `## Processing Results\n\n`;
      output += `\`\`\`\n`;
      successResults.forEach((result) => {
        output += `>${result.sequenceId}\n`;
        output += `${result.result}\n`;
      });
      output += `\`\`\`\n`;
    }
  }

  return output;
}

export default function FastaBatchProcessor() {
  const [fastaContent, setFastaContent] = useState("");
  const [selectedTool, setSelectedTool] = useState("reverse-complement");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string>("");
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async () => {
    if (!fastaContent.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Please enter FASTA format sequence content",
      });
      return;
    }

    setIsLoading(true);

    try {
      const tool = BATCH_TOOLS.find((t) => t.id === selectedTool);
      if (!tool) {
        throw new Error("Specified tool not found");
      }

      // Use local processing
      const response = batchProcess(fastaContent, tool.operation);
      const formattedResults = formatBatchResults(response, tool.name);

      setResults(formattedResults);
      setShowResults(true);

      showToast({
        style: Toast.Style.Success,
        title: "Processing Complete",
        message: `Successfully processed ${response.successCount} sequences`,
      });
    } catch (error) {
      console.error("Batch processing failed:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Processing Failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResults = async () => {
    if (selectedTool === "stats") {
      // Copy statistics results as text directly
      await Clipboard.copy(results);
      showToast({
        style: Toast.Style.Success,
        title: "Copied",
        message: "Statistics results copied to clipboard",
      });
    } else {
      // Copy other results in FASTA format
      const fastaResults = results.match(/```\n([\s\S]*?)\n```/)?.[1] || "";
      await Clipboard.copy(fastaResults);
      showToast({
        style: Toast.Style.Success,
        title: "Copied",
        message: "FASTA format results copied to clipboard",
      });
    }
  };

  if (showResults) {
    return (
      <Detail
        markdown={results}
        actions={
          <ActionPanel>
            <Action title="Copy Results" onAction={copyResults} />
            <Action title="Back" onAction={() => setShowResults(false)} />
            <Action
              title="Clear and Restart"
              onAction={() => {
                setShowResults(false);
                setFastaContent("");
                setResults("");
              }}
            />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Start Batch Processing" onSubmit={handleSubmit} />
          <Action
            title="Paste from Clipboard"
            onAction={async () => {
              const clipboardText = await Clipboard.readText();
              if (clipboardText) {
                setFastaContent(clipboardText);
              }
            }}
          />
          <Action
            title="Clear Content"
            onAction={() => {
              setFastaContent("");
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="Enter FASTA format sequence content here and select processing tools for batch operations. All processing is done locally without requiring network connection." />

      <Form.Dropdown id="tool" title="Select Processing Tool" value={selectedTool} onChange={setSelectedTool}>
        {BATCH_TOOLS.map((tool) => (
          <Form.Dropdown.Item key={tool.id} value={tool.id} title={tool.name} />
        ))}
      </Form.Dropdown>

      <Form.TextArea
        id="fastaContent"
        title="FASTA Content"
        placeholder={`Please enter FASTA format sequences, for example:

>seq1_dna_sample
ATCGATCGATCGATCGATCG
>seq2_longer_dna
ATGAAATTTGGGCCCAAATTTGGGCCC
>seq3_rna_sample
AUCGAUCGAUCGAUCGAUCG`}
        value={fastaContent}
        onChange={setFastaContent}
      />

      <Form.Description text={`${fastaContent.split(">").length - 1} sequences entered`} />
    </Form>
  );
}
