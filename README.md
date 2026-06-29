# Toolify

**Toolify** is a premium, feature-rich suite of 100% client-side utility tools built for developers, designers, and everyday users. By running all file parsing, encoding, compression, and conversions directly in the browser, Toolify guarantees maximum privacy, speed, and security—your data never leaves your device.

---

## Key Features

- **100% Client-Side Processing**: No servers, no data collection, no lag. Files, text, and keys are parsed locally.
- **Highly Performance Optimized**:
  - **O(1) Memory Text Scanner**: Statistics are compiled in a single pass without allocating huge arrays.
  - **Parallel File Batching**: Bulk operations (like PDF merging/splitting and image compression) execute concurrently using web workers and `Promise.all`.
  - **Fluid Rendering**: Integrates React's `useDeferredValue` and `useMemo` to eliminate input lag when typing or analyzing large documents.
- **Modern Responsive UI**: Built with a sleek, polished dark/light mode, custom animations, drag-and-drop lists, and custom themes.
- **No Logins or Paywalls**: Entirely free to use with no usage limits.

---

## The Tool Chest

### Developer Tools

- **JSON Formatter**: Format, validate, minify, and clean JSON payloads with syntax highlighting.
- **Base64 Encode/Decode**: Translate text or files to and from Base64 formats.
- **URL Encode/Decode**: Perform percent-encoding/decoding for safe URLs.
- **JWT Debugger**: Safely decode and inspect JSON Web Tokens locally.
- **Regex Tester**: Test regular expressions in real-time with match highlights.
- **Color Picker**: Choose colors and convert instantly between HEX, RGB, HSL, and CMYK. Includes contrast checks and tints/shades generation.
- **Timestamp Converter**: Convert Unix timestamps to human-readable datetime formats.
- **Hash Generator**: Generate MD5, SHA-1, SHA-256, and SHA-512 hashes.

### Text Utilities

- **Word Counter**: Real-time analysis of words, characters, sentences, paragraphs, reading time, and speaking time.
- **Case Converter**: Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case.
- **Markdown Preview**: A live Markdown editor with synchronized side-by-side rendering.
- **Diff Checker**: Compare two text inputs and highlight inline and line-by-line differences.

### PDF Utilities

- **PDF Merge**: Combine multiple PDF files. Reorder them easily using drag-and-drop.
- **PDF Split**: Extract individual pages, custom page ranges (e.g. `1-3, 5`), or split into N-page batches.
- **PDF Compress**: Optimize and shrink PDF files by stripping metadata and packing streams.
- **Image to PDF**: Convert JPG, PNG, WEBP, and GIF files into clean, styled PDFs with margin controls.

### Image Utilities

- **Image Compress**: Compress JPEG, PNG, and WEBP images with custom quality settings.
- **Image Resize**: Scale images by width, height, percentage, or common social media presets.
- **Image Convert**: Convert images between formats (JPEG, PNG, WEBP, GIF, BMP) while preserving canvas layers.
- **Image Crop**: Crop images using adjustable freeform or locked aspect ratios.

### Generators

- **QR Code Generator**: Create high-quality QR codes for links, text, email, or telephone numbers.
- **Password Generator**: Customize and generate strong, cryptographically secure passwords.
- **UUID Generator**: Instantly generate random UUID v4, v7, and ULID identifiers.
- **Lorem Ipsum**: Generate placeholder text matching exact word, sentence, or paragraph counts.

---

## Technology Stack

- **Core Framework**: [Next.js](https://nextjs.org/) (React 19)
- **Styling & Theme**: Vanilla CSS (TailwindCSS integration for core layouts) + [lucide-react](https://lucide.dev/) icons
- **Drag & Drop**: [@dnd-kit/core](https://dnd-kit.com/) & [@dnd-kit/sortable](https://dnd-kit.com/)
- **Utility Engines**:
  - `pdf-lib`: Local PDF generation, merge, split, and compression.
  - `browser-image-compression`: Fast image compression using multi-threaded web workers.
  - `jszip`: Bundles multiple split/converted files into single ZIP downloads.
  - `qrcode`: Generates browser-drawn canvas QR codes.
  - `uuid` & `ulid`: Generates standardized identifiers.
- **Testing**: [Vitest](https://vitest.dev/) (Unit testing framework)

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended) and `yarn` or `npm`.

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:rukys/toolify.git
   cd toolify
   ```

2. Install dependencies:

   ```bash
   yarn install
   # or
   npm install
   ```

3. Run the development server:

   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Testing and Quality Control

### Unit Tests

Verify text statistics, color conversion math, and PDF parsing calculations:

```bash
yarn test:run
# or
npm run test:run
```

### Production Build Verification

Ensure TypeScript compile-checks and Next.js static page generation compile flawlessly:

```bash
yarn build
# or
npm run build
```

---

## Security & Privacy Statement

Toolify is built with a **security-first** architecture:

1. **Zero Data Uploads**: All uploads remain inside the browser memory (via Web APIs like Blob, File, and Canvas).
2. **Offline-Ready**: Since no requests are made to backend servers for core tools, the app can run entirely offline.
3. **No Tracking**: No analytical profiles are compiled or shared. Your operations are 100% private.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
