import { processSequence, SEQUENCE_TOOLS } from "./bitools";

export default async function main() {
  // Find the remove newlines tool
  const removeNewlinesTool = SEQUENCE_TOOLS.find((tool) => tool.name === "Remove Newlines");

  if (removeNewlinesTool) {
    await processSequence(removeNewlinesTool);
  }
}
