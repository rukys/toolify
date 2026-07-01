'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Globe, Plus, Trash2, Moon, Sun, Briefcase } from 'lucide-react'

const AVAILABLE_ZONES = [
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB - UTC+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT - UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST - UTC+9)' },
  { value: 'Europe/London', label: 'London (GMT/BST - UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST - UTC+1/+2)' },
  { value: 'America/New_York', label: 'New York (EST/EDT - UTC-5/-4)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT - UTC-6/-5)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT - UTC-7/-6)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT - UTC-8/-7)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT - UTC+10/+11)' },
]

export default function TimezonePlannerClient() {
  const tool = getToolById('timezone-planner')!
  const [baseDate, setBaseDate] = useState('2026-07-01')
  const [baseHour, setBaseHour] = useState(9) // Default: 9:00 AM local
  const [selectedZones, setSelectedZones] = useState<string[]>([
    'Asia/Jakarta',
    'America/New_York',
    'Europe/London',
  ])
  const [zoneToAdd, setZoneToAdd] = useState('Asia/Tokyo')

  const handleAddZone = () => {
    if (selectedZones.includes(zoneToAdd)) return
    setSelectedZones((prev) => [...prev, zoneToAdd])
  }

  const handleRemoveZone = (zone: string) => {
    setSelectedZones((prev) => prev.filter((z) => z !== zone))
  }

  // Get active local representation parameters
  const getLocalHourDetails = (zone: string, hourVal: number) => {
    try {
      const dt = new Date(`${baseDate}T00:00:00`)
      dt.setHours(hourVal)
      
      const hourFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        hour: 'numeric',
        hour12: false,
      })
      const labelFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
      const dateLabelFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })

      const rawHour = parseInt(hourFormatter.format(dt), 10)
      const hour = isNaN(rawHour) ? 0 : rawHour % 24

      // Classify overlap suitability:
      // Green (9am-5pm): Business Hours
      // Yellow (7am-9am, 5pm-10pm): Alert/Personal Hours
      // Red (10pm-7am): Sleep Hours
      let suitability: 'business' | 'personal' | 'sleep' = 'sleep'
      if (hour >= 9 && hour <= 17) suitability = 'business'
      else if ((hour >= 7 && hour < 9) || (hour > 17 && hour <= 21)) suitability = 'personal'

      return {
        hour,
        label: labelFormatter.format(dt),
        dateStr: dateLabelFormatter.format(dt),
        suitability,
      }
    } catch {
      return {
        hour: hourVal,
        label: `${hourVal}:00`,
        dateStr: baseDate,
        suitability: 'sleep' as const,
      }
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Core selector parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          {/* Base date picker */}
          <div className="space-y-2">
            <Label htmlFor="tz-base-date" className="text-xs font-semibold text-(--color-text-muted)">Meeting Date</Label>
            <input
              id="tz-base-date"
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="w-full h-9 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) text-(--color-text-primary)"
            />
          </div>

          {/* Add timezone controls */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tz-add-select" className="text-xs font-semibold text-(--color-text-muted)">Add New Timezone</Label>
            <div className="flex gap-2">
              <select
                id="tz-add-select"
                value={zoneToAdd}
                onChange={(e) => setZoneToAdd(e.target.value)}
                className="flex-1 h-9 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) text-(--color-text-primary)"
              >
                {AVAILABLE_ZONES.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAddZone}
                className="bg-(--color-primary) text-white hover:bg-(--color-primary-dark) cursor-pointer text-xs flex items-center gap-1 h-9 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Master time coordinate slider */}
        <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <Label htmlFor="master-time-slider" className="text-sm font-bold text-(--color-text-primary)">
              Adjust Meeting Time (Base Zone Hour)
            </Label>
            <span className="text-(--color-primary) font-bold text-sm">
              {baseHour.toString().padStart(2, '0')}:00
            </span>
          </div>
          <input
            id="master-time-slider"
            type="range"
            min={0}
            max={23}
            value={baseHour}
            onChange={(e) => setBaseHour(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
          />
          
          {/* Visual color guide keys */}
          <div className="flex gap-4 pt-1 justify-center text-[10px] font-bold text-(--color-text-muted)">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span>Standard Business (9am - 5pm)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Personal hours</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Night / Sleep</span>
            </div>
          </div>
        </div>

        {/* Tracker Stack list */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Timezone Overlaps & Schedule Coordinator</Label>

          <div className="space-y-3">
            {selectedZones.map((zone) => {
              const details = getLocalHourDetails(zone, baseHour)

              return (
                <div
                  key={zone}
                  className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  {/* Zone metadata titles */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-(--color-text-muted)" />
                      <h4 className="text-xs font-bold text-(--color-text-primary)">
                        {zone.replace('_', ' ')}
                      </h4>
                    </div>
                    <span className="text-[10px] text-(--color-text-muted) font-semibold block mt-0.5">
                      {details.dateStr}
                    </span>
                  </div>

                  {/* Overlap timeline 24h strip visualization */}
                  <div className="flex-1 max-w-md overflow-x-auto py-1">
                    <div className="flex gap-0.5 min-w-[240px]">
                      {Array.from({ length: 24 }).map((_, h) => {
                        const cell = getLocalHourDetails(zone, h)
                        const isActive = h === baseHour
                        
                        return (
                          <div
                            key={h}
                            title={`${cell.label} (${cell.suitability})`}
                            className={`flex-1 h-5 rounded-sm flex items-center justify-center text-[8px] font-bold transition-all ${
                              cell.suitability === 'business'
                                ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                : cell.suitability === 'personal'
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                : 'bg-red-500/10 text-red-700 dark:text-red-400'
                            } ${
                              isActive 
                                ? 'ring-2 ring-offset-2 ring-(--color-primary) ring-offset-(--color-surface) scale-110 font-black z-10' 
                                : 'opacity-65 hover:opacity-100'
                            }`}
                          >
                            {h}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Specific hour readout */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="flex items-center gap-2">
                      {details.suitability === 'business' ? (
                        <Briefcase className="w-4 h-4 text-green-500" />
                      ) : details.suitability === 'personal' ? (
                        <Sun className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Moon className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-mono text-xs font-bold text-(--color-text-primary)">
                        {details.label}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveZone(zone)}
                      disabled={selectedZones.length <= 1}
                      className="p-1 rounded-md text-(--color-text-muted) hover:text-(--color-danger) disabled:opacity-30 cursor-pointer shrink-0"
                      title="Remove timezone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
