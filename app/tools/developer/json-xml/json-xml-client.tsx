'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AlertCircle, ArrowLeftRight, Copy, Check } from 'lucide-react'

type Mode = 'json-to-xml' | 'xml-to-json'

export default function JSONXMLClient() {
  const tool = getToolById('json-xml')!
  const [mode, setMode] = useState<Mode>('json-to-xml')
  const [input, setInput] = useState(`{
  "book": {
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "year": 2008
  }
}`)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Convert JSON to XML
  const jsonToXml = (jsonStr: string): string => {
    const obj = JSON.parse(jsonStr.trim())
    
    function buildXmlNode(data: any, keyName: string): string {
      if (data === null || data === undefined) {
        return `<${keyName}/>`
      }
      if (Array.isArray(data)) {
        return data.map(item => buildXmlNode(item, keyName)).join('\n')
      }
      if (typeof data === 'object') {
        const keys = Object.keys(data)
        const children = keys.map(key => buildXmlNode(data[key], key)).join('')
        return `<${keyName}>${children}</${keyName}>`
      }
      // Escape XML entities
      const escaped = String(data)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
      return `<${keyName}>${escaped}</${keyName}>`
    }

    const keys = Object.keys(obj)
    if (keys.length === 1) {
      return `<?xml version="1.0" encoding="UTF-8"?>\n${buildXmlNode(obj[keys[0]], keys[0])}`
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n${buildXmlNode(obj, 'root')}`
  }

  // Convert XML to JSON
  const xmlToJson = (xmlStr: string): string => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlStr.trim(), 'application/xml')
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      throw new Error(`XML Parse Error: ${parserError.textContent}`)
    }

    function parseNode(node: Node): any {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        const obj: Record<string, any> = {}

        // Map attributes
        if (element.attributes.length > 0) {
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i]
            obj[`@${attr.name}`] = attr.value
          }
        }

        // Map children
        let hasElementChild = false
        for (let i = 0; i < element.childNodes.length; i++) {
          const child = element.childNodes[i]
          if (child.nodeType === Node.ELEMENT_NODE) {
            hasElementChild = true
            const childName = child.nodeName
            const childVal = parseNode(child)

            if (obj[childName] === undefined) {
              obj[childName] = childVal
            } else {
              if (!Array.isArray(obj[childName])) {
                obj[childName] = [obj[childName]]
              }
              obj[childName].push(childVal)
            }
          }
        }

        // Leaf Node
        if (!hasElementChild) {
          const textContent = element.textContent?.trim() || ''
          if (element.attributes.length === 0) {
            if (textContent === 'true') return true
            if (textContent === 'false') return false
            if (textContent !== '' && !isNaN(Number(textContent))) return Number(textContent)
            return textContent
          } else {
            obj['#text'] = textContent
          }
        }

        return obj
      }
      return null
    }

    const rootElement = doc.documentElement
    const resultObj = {
      [rootElement.nodeName]: parseNode(rootElement)
    }
    return JSON.stringify(resultObj, null, 2)
  }

  const handleConvert = () => {
    setError('')
    setOutput('')

    const cleaned = input.trim()
    if (!cleaned) return

    try {
      if (mode === 'json-to-xml') {
        const xml = jsonToXml(cleaned)
        setOutput(xml)
      } else {
        const json = xmlToJson(cleaned)
        setOutput(json)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed. Please verify syntax.')
    }
  }

  const handleToggleMode = () => {
    const nextMode = mode === 'json-to-xml' ? 'xml-to-json' : 'json-to-xml'
    setMode(nextMode)
    setError('')
    setOutput('')

    if (nextMode === 'xml-to-json') {
      setInput(`<?xml version="1.0" encoding="UTF-8"?>\n<book>\n  <title>Clean Code</title>\n  <author>Robert C. Martin</author>\n  <year>2008</year>\n</book>`)
    } else {
      setInput(`{\n  "book": {\n    "title": "Clean Code",\n    "author": "Robert C. Martin",\n    "year": 2008\n  }\n}`)
    }
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          <div className="text-sm font-semibold">
            Direction:{' '}
            <span className="text-(--color-primary) font-bold">
              {mode === 'json-to-xml' ? 'JSON to XML' : 'XML to JSON'}
            </span>
          </div>
          <Button
            onClick={handleToggleMode}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-xs border-(--color-border) hover:bg-(--color-surface) cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap Directions</span>
          </Button>
        </div>

        {/* Input area */}
        <div className="space-y-2">
          <Label htmlFor="json-xml-input" className="text-sm font-semibold">
            {mode === 'json-to-xml' ? 'JSON Input' : 'XML Input'}
          </Label>
          <textarea
            id="json-xml-input"
            rows={8}
            placeholder={
              mode === 'json-to-xml'
                ? '{\n  "root": {\n    "element": "value"\n  }\n}'
                : '<root>\n  <element>value</element>\n</root>'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted)"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1 bg-(--color-primary) text-white hover:bg-(--color-primary-dark) cursor-pointer">
            Convert
          </Button>
          <Button variant="outline" onClick={handleClear} className="border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer">
            Clear
          </Button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Output display */}
        {output && (
          <div className="space-y-2 pt-4 border-t border-(--color-border) animate-fade-in">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                {mode === 'json-to-xml' ? 'XML Output' : 'JSON Output'}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Output</span>
                  </>
                )}
              </Button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={output}
              className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none text-(--color-text-primary)"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
