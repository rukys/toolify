import { PDFDocument } from 'pdf-lib'

export type CompressionLevel = 'light' | 'balanced' | 'strong'

export async function compressPDF(file: File, level: CompressionLevel): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer()
  
  // ignoreEncryption allows loading but won't decrypt protected files (which is safe and standard)
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

  // Strip all tracking/identifying metadata to optimize size and protect privacy
  pdf.setTitle('')
  pdf.setAuthor('')
  pdf.setSubject('')
  pdf.setKeywords([])
  pdf.setProducer('')
  pdf.setCreator('')

  return pdf.save({
    // Object streams are supported in PDF 1.5+ and pack multiple objects into single streams
    useObjectStreams: level !== 'light',
    addDefaultPage: false,
  })
}
