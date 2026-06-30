'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

type Category = 'storage' | 'length' | 'weight' | 'temperature'

interface UnitOption {
  value: string
  label: string
  factor?: number // factor relative to base unit
}

const STORAGE_UNITS: UnitOption[] = [
  { value: 'b', label: 'Bytes (B)', factor: 1 },
  { value: 'kb', label: 'Kilobytes (KB - 10³)', factor: 1e3 },
  { value: 'mb', label: 'Megabytes (MB - 10⁶)', factor: 1e6 },
  { value: 'gb', label: 'Gigabytes (GB - 10⁹)', factor: 1e9 },
  { value: 'tb', label: 'Terabytes (TB - 10¹²)', factor: 1e12 },
  { value: 'kib', label: 'Kibibytes (KiB - 2¹⁰)', factor: 1024 },
  { value: 'mib', label: 'Mebibytes (MiB - 2²⁰)', factor: 1024 ** 2 },
  { value: 'gib', label: 'Gibibytes (GiB - 2³⁰)', factor: 1024 ** 3 },
  { value: 'tib', label: 'Tebibytes (TiB - 2⁴⁰)', factor: 1024 ** 4 },
]

const LENGTH_UNITS: UnitOption[] = [
  { value: 'mm', label: 'Millimeters (mm)', factor: 0.001 },
  { value: 'cm', label: 'Centimeters (cm)', factor: 0.01 },
  { value: 'm', label: 'Meters (m)', factor: 1 },
  { value: 'km', label: 'Kilometers (km)', factor: 1000 },
  { value: 'in', label: 'Inches (in)', factor: 0.0254 },
  { value: 'ft', label: 'Feet (ft)', factor: 0.3048 },
  { value: 'yd', label: 'Yards (yd)', factor: 0.9144 },
  { value: 'mi', label: 'Miles (mi)', factor: 1609.344 },
]

const WEIGHT_UNITS: UnitOption[] = [
  { value: 'mg', label: 'Milligrams (mg)', factor: 0.001 },
  { value: 'g', label: 'Grams (g)', factor: 1 },
  { value: 'kg', label: 'Kilograms (kg)', factor: 1000 },
  { value: 'oz', label: 'Ounces (oz)', factor: 28.349523125 },
  { value: 'lb', label: 'Pounds (lbs)', factor: 453.59237 },
]

const TEMP_UNITS: UnitOption[] = [
  { value: 'c', label: 'Celsius (°C)' },
  { value: 'f', label: 'Fahrenheit (°F)' },
  { value: 'k', label: 'Kelvin (K)' },
]

export default function UnitsConverterClient() {
  const tool = getToolById('units')!
  const [category, setCategory] = useState<Category>('storage')
  const [inputVal, setInputVal] = useState('1')
  const [fromUnit, setFromUnit] = useState('mb')
  const [toUnit, setToUnit] = useState('gb')
  const [outputVal, setOutputVal] = useState('')
  const [copied, setCopied] = useState(false)

  // Reset defaults on category change
  useEffect(() => {
    if (category === 'storage') {
      setFromUnit('mb')
      setToUnit('gb')
    } else if (category === 'length') {
      setFromUnit('m')
      setToUnit('km')
    } else if (category === 'weight') {
      setFromUnit('kg')
      setToUnit('lb')
    } else if (category === 'temperature') {
      setFromUnit('c')
      setToUnit('f')
    }
  }, [category])

  // Get active unit options
  const getUnitOptions = (): UnitOption[] => {
    switch (category) {
      case 'storage': return STORAGE_UNITS
      case 'length': return LENGTH_UNITS
      case 'weight': return WEIGHT_UNITS
      case 'temperature': return TEMP_UNITS
    }
  }

  const handleConvert = () => {
    const num = parseFloat(inputVal)
    if (isNaN(num)) {
      setOutputVal('')
      return
    }

    if (fromUnit === toUnit) {
      setOutputVal(inputVal)
      return
    }

    // Special temperature logic
    if (category === 'temperature') {
      let celsius = num
      if (fromUnit === 'f') celsius = (num - 32) * 5 / 9
      if (fromUnit === 'k') celsius = num - 273.15

      let targetVal = celsius
      if (toUnit === 'f') targetVal = (celsius * 9 / 5) + 32
      if (toUnit === 'k') targetVal = celsius + 273.15

      setOutputVal(targetVal.toFixed(4).replace(/\.?0+$/, ''))
      return
    }

    // Factor-based conversion (storage, length, weight)
    const options = getUnitOptions()
    const fromOpt = options.find((o) => o.value === fromUnit)
    const toOpt = options.find((o) => o.value === toUnit)

    if (fromOpt?.factor && toOpt?.factor) {
      const baseVal = num * fromOpt.factor
      const converted = baseVal / toOpt.factor
      // Format cleanly up to 8 decimal places and strip trailing zeros
      setOutputVal(converted.toFixed(8).replace(/\.?0+$/, ''))
    }
  }

  useEffect(() => {
    handleConvert()
  }, [inputVal, fromUnit, toUnit, category])

  const handleCopy = async () => {
    if (!outputVal) return
    await navigator.clipboard.writeText(outputVal)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Category Tabs */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-(--color-text-muted)">Select Conversion Category</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {([
              { value: 'storage', label: 'Data Storage' },
              { value: 'length', label: 'Length' },
              { value: 'weight', label: 'Weight' },
              { value: 'temperature', label: 'Temperature' },
            ] as { value: Category; label: string }[]).map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`text-xs font-semibold py-2 px-3 rounded-lg border transition-colors cursor-pointer ${
                  category === cat.value
                    ? 'bg-(--color-primary) text-white border-transparent'
                    : 'border-(--color-border) bg-(--color-surface-alt) hover:bg-(--color-surface) text-(--color-text-secondary)'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          {/* Input Value */}
          <div className="space-y-2">
            <Label htmlFor="unit-input-val" className="text-xs font-semibold text-(--color-text-muted)">Input Value</Label>
            <Input
              id="unit-input-val"
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="bg-(--color-surface) border-(--color-border) font-mono text-sm focus-visible:ring-(--color-primary)"
            />
          </div>

          {/* From Unit */}
          <div className="space-y-2">
            <Label htmlFor="unit-from" className="text-xs font-semibold text-(--color-text-muted)">From Unit</Label>
            <select
              id="unit-from"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full h-9 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) text-(--color-text-primary)"
            >
              {getUnitOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* To Unit */}
          <div className="space-y-2">
            <Label htmlFor="unit-to" className="text-xs font-semibold text-(--color-text-muted)">To Unit</Label>
            <select
              id="unit-to"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full h-9 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) text-(--color-text-primary)"
            >
              {getUnitOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Output display swatches */}
        {outputVal && (
          <div className="space-y-2 pt-4 border-t border-(--color-border) animate-fade-in">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Converted Result</Label>
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
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
            <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-base font-bold text-(--color-text-primary) tracking-wide">
              {outputVal} {toUnit.toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
