# Biotools

A powerful biological sequence processing toolkit for Raycast. Process DNA, RNA, and protein sequences with ease using various bioinformatics operations.

## Features

- **Reverse Complement** - Generate reverse complement sequences for DNA
- **Transcription & Translation** - Convert DNA to RNA and translate to proteins
- **Case Conversion** - Transform sequences to uppercase or lowercase
- **Sequence Analysis** - Calculate length and nucleotide/amino acid statistics
- **Batch Processing** - Process multiple FASTA sequences simultaneously
- **Local Processing** - All operations run locally without internet connection

## Commands

### Individual Tools
- `Reverse Complement` - Generate DNA reverse complement (ATCG → CGAT)
- `Dna to Rna` - Transcribe DNA to RNA (T → U)
- `Rna to Dna` - Reverse transcribe RNA to DNA (U → T)
- `Dna Translate` - Translate DNA sequences to proteins
- `Rna Translate` - Translate RNA sequences to proteins
- `Sequence Length` - Calculate sequence length (excluding spaces)
- `Sequence Statistics` - Analyze nucleotide/amino acid composition
- `Remove Newlines` - Clean up sequence formatting
- `To Lowercase` / `To Uppercase` - Convert sequence case

### Batch Processing
- `Fasta Batch Processor` - Process multiple sequences in FASTA format with various operations

## Usage

1. Copy your biological sequence to the clipboard
2. Open Raycast and search for the desired Biotools command
3. The processed result is automatically copied back to your clipboard
4. A success notification confirms the operation

### Batch Processing

1. Use the `Fasta Batch Processor` command
2. Paste your FASTA-formatted sequences
3. Select the desired operation
4. View results and copy them to clipboard

## Supported Formats

- **DNA sequences**: A, T, C, G (case insensitive)
- **RNA sequences**: A, U, C, G (case insensitive)
- **Protein sequences**: Standard 20 amino acids
- **FASTA format**: Multi-sequence processing with headers

## Examples

### DNA Reverse Complement
```
Input:  ATCGATCG
Output: CGATCGAT
```

### DNA to RNA Transcription
```
Input:  ATCGATCG
Output: AUCGAUCG
```

### DNA Translation
```
Input:  ATGAAATTTGGGCCC
Output: MKFGP
```

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build extension
npm run build

# Lint and format
npm run lint
```

## Requirements

- Raycast 1.50.0 or later
- Node.js 16 or later

## License

MIT
- Extensible architecture design