import { SEQUENCE_TOOLS, processSequence } from "./bitools";

export default async function main() {
  await processSequence(SEQUENCE_TOOLS[3]); // DNA transcription to RNA
}
