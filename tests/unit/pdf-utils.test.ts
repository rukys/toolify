import { describe, expect, test } from 'vitest'
import { PDFDocument, degrees } from 'pdf-lib'

describe('Advanced PDF Utilities', () => {
  test('should create, modify metadata, and rotate pages in PDF document', async () => {
    // 1. Create a mock PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([400, 400])
    
    // 2. Set Metadata properties
    pdfDoc.setTitle('Test Report')
    pdfDoc.setAuthor('Antigravity Editor')
    pdfDoc.setSubject('Unit Testing')
    pdfDoc.setKeywords(['pdf', 'test', 'vitest'])

    expect(pdfDoc.getTitle()).toBe('Test Report')
    expect(pdfDoc.getAuthor()).toBe('Antigravity Editor')
    expect(pdfDoc.getSubject()).toBe('Unit Testing')
    expect(pdfDoc.getKeywords()).toBe('pdf test vitest')

    // 3. Rotate page
    page.setRotation(degrees(90))
    expect(page.getRotation().angle).toBe(90)

    // 4. Save and reload document to verify serialization
    const pdfBytes = await pdfDoc.save()
    expect(pdfBytes.length).toBeGreaterThan(0)

    const reloadedDoc = await PDFDocument.load(pdfBytes)
    expect(reloadedDoc.getTitle()).toBe('Test Report')
    
    const reloadedPages = reloadedDoc.getPages()
    expect(reloadedPages.length).toBe(1)
    expect(reloadedPages[0].getRotation().angle).toBe(90)
  })
})
