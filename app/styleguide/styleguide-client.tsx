'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { DropZone } from '@/components/tool/drop-zone'
import { ProcessingButton } from '@/components/tool/processing-button'
import { OutputArea } from '@/components/tool/output-area'
import { CodeHighlight } from '@/components/tool/code-highlight'
import { useClipboard } from '@/hooks/use-clipboard'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sparkles, Sliders, Type, Grid } from 'lucide-react'

// Color definition metadata
interface ColorToken {
  name: string
  variable: string
  description: string
}

const COLOR_TOKENS: ColorToken[] = [
  { name: 'Primary (Blue)', variable: '--color-primary', description: 'Brand brand accent and primary triggers.' },
  { name: 'Primary Light', variable: '--color-primary-light', description: 'Used for hover borders, backgrounds, and badges.' },
  { name: 'Accent (Purple)', variable: '--color-accent', description: 'Secondary theme highlights, gradients, and brand marks.' },
  { name: 'Success (Green)', variable: '--color-success', description: 'Positive calculations, completion alerts, and status badges.' },
  { name: 'Danger (Red)', variable: '--color-danger', description: 'Error bounds, validation alerts, and clear buttons.' },
  { name: 'Surface Background', variable: '--color-surface', description: 'Main background of the application (light/dark mode).' },
  { name: 'Surface Alternate', variable: '--color-surface-alt', description: 'Subtle alternate background for sidebars, inputs, and code tags.' },
  { name: 'Border', variable: '--color-border', description: 'Main structural separator lines and component frames.' },
  { name: 'Text Primary', variable: '--color-text-primary', description: 'Used for page titles, headings, and core labels.' },
  { name: 'Text Secondary', variable: '--color-text-secondary', description: 'Used for subtitles, hints, and description parameters.' },
  { name: 'Text Muted', variable: '--color-text-muted', description: 'Used for timestamps, breadcrumbs, and disabled states.' },
]

export default function StyleguideClient() {
  const { copy } = useClipboard()

  // Sandbox states
  const [simulatedFiles, setSimulatedFiles] = useState<File[]>([])
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null)

  const handleFilesAccepted = (acceptedFiles: File[]) => {
    setSimulatedFiles(acceptedFiles)
    setOutputBlob(null)
    toast.success(`Dropped ${acceptedFiles.length} file(s) into sandbox!`)
  }

  const handleTriggerOutput = async () => {
    if (simulatedFiles.length === 0) {
      toast.error('Drop a file in the DropZone first to generate output!')
      throw new Error('No files dropped')
    }
    // Simulate 1.5 seconds background processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const sampleText = `Sample processed output from file: ${simulatedFiles[0].name}`
    setOutputBlob(new Blob([sampleText], { type: 'text/plain' }))
    toast.success('Generated simulated output!')
  }

  const handleClearSandbox = () => {
    setSimulatedFiles([])
    setOutputBlob(null)
    toast.success('Sandbox state cleared')
  }

  const codeSnippets = {
    dropzone: `<DropZone\n  accept={{ 'application/pdf': ['.pdf'] }}\n  maxSizeMB={50}\n  multiple\n  onFilesAccepted={(files) => handleFilesAccepted(files)}\n  onError={(msg) => toast.error(msg)}\n/>`,
    button: `<ProcessingButton\n  onClick={handleProcess}\n  label="Compress PDF Document"\n  className="w-full"\n/>`,
    output: `<OutputArea\n  mode="download"\n  filename="processed-document.pdf"\n  blob={outputBlob}\n  sizeInfo="2.4 MB → 1.1 MB (54% saved)"\n/>`,
    code: `<CodeHighlight \n  code={JSON.stringify({ active: true }, null, 2)} \n  language="json" \n/>`,
  }

  return (
    <div className="flex flex-col min-h-screen bg-(--color-surface) text-(--color-text-primary)">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Title Block */}
        <div className="space-y-2 border-b border-(--color-border) pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-(--color-primary-light) text-(--color-primary) border border-blue-200 dark:border-blue-900/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Toolify Design System</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Interactive Styleguide</h1>
          <p className="text-sm text-(--color-text-secondary) max-w-2xl">
            Live catalog of the CSS tokens, typographic scales, and UI component building blocks powering the Toolify utilities dashboard.
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="tokens" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-(--color-surface-alt)">
            <TabsTrigger value="tokens" className="cursor-pointer gap-1.5 text-xs sm:text-sm">
              <Sliders className="w-4 h-4" />
              Design Tokens
            </TabsTrigger>
            <TabsTrigger value="typography" className="cursor-pointer gap-1.5 text-xs sm:text-sm">
              <Type className="w-4 h-4" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="components" className="cursor-pointer gap-1.5 text-xs sm:text-sm">
              <Grid className="w-4 h-4" />
              UI Components
            </TabsTrigger>
          </TabsList>

          {/* Design Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-lg font-bold">Semantic Color Variables</h2>
              <p className="text-xs text-(--color-text-secondary)">
                Click any color swatch box to copy its CSS custom property string directly to your clipboard.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COLOR_TOKENS.map((token) => (
                <button
                  key={token.variable}
                  onClick={() => copy(`var(${token.variable})`)}
                  className="flex flex-col p-3 rounded-xl border border-(--color-border) bg-(--color-surface) hover:border-(--color-primary) text-left cursor-pointer transition-colors shadow-xs group"
                >
                  <div
                    className="w-full h-24 rounded-lg border border-(--color-border) shadow-inner mb-3 transition-transform group-hover:scale-[1.01]"
                    style={{ backgroundColor: `var(${token.variable})` }}
                  />
                  <span className="text-xs font-bold text-(--color-text-primary)">{token.name}</span>
                  <span className="font-mono text-[10px] text-(--color-primary) font-semibold mt-0.5">
                    {token.variable}
                  </span>
                  <p className="text-[10px] text-(--color-text-muted) mt-1 leading-relaxed">
                    {token.description}
                  </p>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-lg font-bold">Typography Scale & Weights</h2>
              <p className="text-xs text-(--color-text-secondary)">
                Utilizing Outfit for headings and Inter for body text. Outlines standard font sizes and spacing structures.
              </p>
            </div>

            <div className="p-6 border border-(--color-border) rounded-xl bg-(--color-surface-alt) space-y-6">
              <div className="space-y-1 pb-4 border-b border-(--color-border)">
                <span className="text-[10px] font-mono text-(--color-primary) font-bold">h1. Heading Large (30px / 1.875rem)</span>
                <h1 className="text-3xl font-extrabold tracking-tight">The quick brown fox jumps over the lazy dog</h1>
              </div>

              <div className="space-y-1 pb-4 border-b border-(--color-border)">
                <span className="text-[10px] font-mono text-(--color-primary) font-bold">h2. Heading Medium (20px / 1.25rem)</span>
                <h2 className="text-lg font-bold">The quick brown fox jumps over the lazy dog</h2>
              </div>

              <div className="space-y-1 pb-4 border-b border-(--color-border)">
                <span className="text-[10px] font-mono text-(--color-primary) font-bold">h3. Subtitle / Label (14px / 0.875rem)</span>
                <h3 className="text-sm font-semibold">The quick brown fox jumps over the lazy dog</h3>
              </div>

              <div className="space-y-1 pb-4 border-b border-(--color-border)">
                <span className="text-[10px] font-mono text-(--color-primary) font-bold">p. Body Regular (14px / 0.875rem / Leading Relaxed)</span>
                <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                  Toolify is a 100% free web utilities toolkit executing all code inside the client browser. No files or inputs ever leave the user device, keeping data private by default.
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-(--color-primary) font-bold">code. Monospace Code (13px / 0.8125rem)</span>
                <pre className="font-mono text-xs text-(--color-text-primary) bg-(--color-surface) p-3 rounded-lg border border-(--color-border)">
                  const app = &quot;Toolify&quot;;
                </pre>
              </div>
            </div>
          </TabsContent>

          {/* UI Components Tab */}
          <TabsContent value="components" className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-lg font-bold">UI Component Sandbox</h2>
              <p className="text-xs text-(--color-text-secondary)">
                Interact with the actual components, configure their loading and upload states, and copy the TSX layout codes.
              </p>
            </div>

            {/* Component 1: DropZone */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-b border-(--color-border) pb-8">
              <div className="lg:col-span-5 space-y-4">
                <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
                  1. Live DropZone Demo
                </Label>
                <div className="p-4 bg-(--color-surface-alt) border border-(--color-border) rounded-xl min-h-[160px] flex items-center justify-center">
                  <DropZone
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                    maxSizeMB={20}
                    onFilesAccepted={handleFilesAccepted}
                    onError={(msg) => toast.error(msg)}
                    files={simulatedFiles}
                  />
                </div>
                {simulatedFiles.length > 0 && (
                  <p className="text-xs text-(--color-success) font-semibold text-center">
                    Files loaded: {simulatedFiles.map((f) => f.name).join(', ')}
                  </p>
                )}
              </div>
              <div className="lg:col-span-7 space-y-2">
                <Label className="text-xs font-semibold text-(--color-text-secondary)">TSX Usage Code</Label>
                <CodeHighlight code={codeSnippets.dropzone} language="tsx" />
              </div>
            </div>

            {/* Component 2: ProcessingButton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-b border-(--color-border) pb-8">
              <div className="lg:col-span-5 space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
                    2. ProcessingButton Demo
                  </Label>
                </div>
                <div className="p-4 bg-(--color-surface-alt) border border-(--color-border) rounded-xl flex items-center justify-center min-h-[100px]">
                  <ProcessingButton
                    onClick={handleTriggerOutput}
                    label="Generate Output Area File"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="lg:col-span-7 space-y-2">
                <Label className="text-xs font-semibold text-(--color-text-secondary)">TSX Usage Code</Label>
                <CodeHighlight code={codeSnippets.button} language="tsx" />
              </div>
            </div>

            {/* Component 3: OutputArea */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-b border-(--color-border) pb-8">
              <div className="lg:col-span-5 space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
                    3. OutputArea Demo
                  </Label>
                  {outputBlob && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSandbox}
                      className="text-[10px] text-(--color-danger) h-7 cursor-pointer"
                    >
                      Clear State
                    </Button>
                  )}
                </div>
                <div className="p-4 bg-(--color-surface-alt) border border-(--color-border) rounded-xl min-h-[120px] flex items-center justify-center">
                  {outputBlob ? (
                    <OutputArea
                      mode="download"
                      filename="simulated-result.txt"
                      blob={outputBlob}
                      sizeInfo="Original file -> Transformed text output"
                    />
                  ) : (
                    <p className="text-xs text-(--color-text-muted) italic">
                      Upload a file above and click the button to generate this output area.
                    </p>
                  )}
                </div>
              </div>
              <div className="lg:col-span-7 space-y-2">
                <Label className="text-xs font-semibold text-(--color-text-secondary)">TSX Usage Code</Label>
                <CodeHighlight code={codeSnippets.output} language="tsx" />
              </div>
            </div>

            {/* Component 4: CodeHighlight */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
                  4. CodeHighlight Demo
                </Label>
                <div className="p-4 bg-(--color-surface-alt) border border-(--color-border) rounded-xl min-h-[140px] flex items-center justify-center">
                  <div className="w-full">
                    <CodeHighlight
                      code={`{\n  "projectName": "Toolify",\n  "status": "ready",\n  "version": 1.0\n}`}
                      language="json"
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-2">
                <Label className="text-xs font-semibold text-(--color-text-secondary)">TSX Usage Code</Label>
                <CodeHighlight code={codeSnippets.code} language="tsx" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
