import { SEQUENCE_TOOLS, processSequence } from "./bitools";

export default async function main() {
  await processSequence(SEQUENCE_TOOLS[6]); // RNA translation to protein
}
