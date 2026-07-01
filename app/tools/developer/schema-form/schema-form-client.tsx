'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, Check, Copy } from 'lucide-react'

const DEFAULT_SCHEMA = `{
  "type": "object",
  "title": "Developer Profile",
  "properties": {
    "fullName": { "type": "string", "title": "Full Name" },
    "email": { "type": "string", "title": "Email Address" },
    "yearsOfExperience": { "type": "number", "title": "Years of Experience" },
    "receiveNewsletter": { "type": "boolean", "title": "Subscribe to Developer Newsletter" }
  },
  "required": ["fullName", "email"]
}`

interface SchemaProperty {
  type: string
  title?: string
}

interface parsedSchema {
  title?: string
  properties?: Record<string, SchemaProperty>
  required?: string[]
}

export default function SchemaFormClient() {
  const tool = getToolById('schema-form')!
  const [schemaText, setSchemaText] = useState(DEFAULT_SCHEMA)
  const [parsed, setParsed] = useState<parsedSchema | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [schemaError, setSchemaError] = useState('')
  const [copied, setCopied] = useState(false)

  // Parse schema when changed
  useEffect(() => {
    setSchemaError('')
    if (!schemaText.trim()) {
      setParsed(null)
      return
    }

    try {
      const obj = JSON.parse(schemaText)
      if (obj.type !== 'object') {
        setSchemaError('Schema root must be of type "object".')
        setParsed(null)
        return
      }
      setParsed(obj)
      
      // Initialize form fields defaults
      const defaults: Record<string, any> = {}
      if (obj.properties) {
        Object.entries(obj.properties).forEach(([key, prop]: [string, any]) => {
          if (prop.type === 'boolean') defaults[key] = false
          else if (prop.type === 'number') defaults[key] = ''
          else defaults[key] = ''
        })
      }
      setFormData(defaults)
    } catch (err: any) {
      setSchemaError(`JSON Syntax Error: ${err.message}`)
      setParsed(null)
    }
  }, [schemaText])

  // Perform validation on inputs
  useEffect(() => {
    if (!parsed) return
    const errors: string[] = []
    if (parsed.required) {
      parsed.required.forEach((field) => {
        const val = formData[field]
        if (val === undefined || val === '') {
          const label = parsed.properties?.[field]?.title || field
          errors.push(`Field "${label}" is required.`)
        }
      })
    }
    setValidationErrors(errors)
  }, [formData, parsed])

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(formData, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Split editor and builder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Schema Input Editor */}
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="schema-editor" className="text-sm font-semibold">JSON Schema Spec</Label>
            <textarea
              id="schema-editor"
              rows={12}
              placeholder="Paste JSON Schema here..."
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted) resize-y flex-1"
            />
            {schemaError && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-semibold mt-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{schemaError}</span>
              </div>
            )}
          </div>

          {/* Form visualizer & state output */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Interactive Visual Form Preview</Label>

            {parsed ? (
              <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4 shadow-sm">
                {parsed.title && (
                  <h3 className="text-sm font-bold text-(--color-text-primary) border-b border-(--color-border)/50 pb-2">
                    {parsed.title}
                  </h3>
                )}

                {/* Form fields rendering */}
                <div className="space-y-3.5">
                  {parsed.properties &&
                    Object.entries(parsed.properties).map(([key, prop]: [string, any]) => {
                      const isRequired = parsed.required?.includes(key)
                      const label = prop.title || key

                      return (
                        <div key={key} className="space-y-1.5">
                          <Label htmlFor={`form-field-${key}`} className="text-xs font-semibold text-(--color-text-secondary) flex items-center gap-1">
                            <span>{label}</span>
                            {isRequired && <span className="text-red-500 font-bold">*</span>}
                          </Label>

                          {prop.type === 'boolean' ? (
                            <label className="flex items-center gap-2 text-xs font-semibold text-(--color-text-secondary) cursor-pointer select-none">
                              <input
                                id={`form-field-${key}`}
                                type="checkbox"
                                checked={!!formData[key]}
                                onChange={(e) => handleFieldChange(key, e.target.checked)}
                                className="w-4 h-4 rounded border-(--color-border) text-(--color-primary) focus:ring-(--color-primary) cursor-pointer"
                              />
                              <span>Toggle Switch</span>
                            </label>
                          ) : prop.type === 'number' || prop.type === 'integer' ? (
                            <Input
                              id={`form-field-${key}`}
                              type="number"
                              placeholder={`Enter numeric ${label.toLowerCase()}...`}
                              value={formData[key] || ''}
                              onChange={(e) =>
                                handleFieldChange(
                                  key,
                                  e.target.value === '' ? '' : Number(e.target.value)
                                )
                              }
                              className="h-8.5 bg-(--color-surface) border-(--color-border) text-xs"
                            />
                          ) : (
                            <Input
                              id={`form-field-${key}`}
                              type="text"
                              placeholder={`Enter ${label.toLowerCase()}...`}
                              value={formData[key] || ''}
                              onChange={(e) => handleFieldChange(key, e.target.value)}
                              className="h-8.5 bg-(--color-surface) border-(--color-border) text-xs"
                            />
                          )}
                        </div>
                      )
                    })}
                </div>

                {/* Active Validation Warning Panel */}
                {validationErrors.length > 0 && (
                  <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block">Required Inputs Missing</span>
                    <ul className="list-disc pl-4 text-xs space-y-0.5 font-semibold">
                      {validationErrors.map((err) => (
                        <li key={err}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-(--color-border) bg-(--color-surface-alt) text-center text-xs text-(--color-text-muted) font-semibold italic">
                Fix syntax issues in JSON schema script to render form.
              </div>
            )}
          </div>
        </div>

        {/* Form Value JSON Output */}
        {parsed && (
          <div className="space-y-2 pt-4 border-t border-(--color-border)">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Live Form Data JSON</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500 font-semibold">Copied Data!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-[10px] text-(--color-text-primary) overflow-x-auto select-all leading-relaxed max-h-[140px]">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
