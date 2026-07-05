import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type Section = {
  id: number
  section_name: string
  grade_level: string
  grade_level_id: number
}

interface SectionComboboxProps {
  sections: Section[]
  value: string | null
  onValueChange: (value: string | null) => void
  placeholder?: string
  emptyMessage?: string
}

export function SectionCombobox({
  sections,
  value,
  onValueChange,
  placeholder = "Type to search section...",
  emptyMessage = "No section found.",
}: SectionComboboxProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [selectedSection, setSelectedSection] = React.useState<Section | null>(null)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  // Initialize selected section from value
  React.useEffect(() => {
    if (value) {
      const section = sections.find((s) => s.id.toString() === value)
      if (section) {
        setSelectedSection(section)
        setInputValue(`${section.grade_level} - ${section.section_name}`)
      }
    } else {
      setSelectedSection(null)
      setInputValue("")
    }
  }, [value, sections])

  // Filter sections based on input
  const filteredSections = React.useMemo(() => {
    if (!inputValue) return sections
    const searchLower = inputValue.toLowerCase()
    return sections.filter((section) => {
      return (
        section.section_name.toLowerCase().includes(searchLower) ||
        section.grade_level.toLowerCase().includes(searchLower) ||
        `${section.grade_level} - ${section.section_name}`
          .toLowerCase()
          .includes(searchLower)
      )
    })
  }, [inputValue, sections])

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setShowSuggestions(true)
    
    // Clear selection if input is cleared
    if (!newValue) {
      setSelectedSection(null)
      onValueChange(null)
    }
  }

  const handleSelectSection = (section: Section | null) => {
    if (section) {
      setSelectedSection(section)
      setInputValue(`${section.grade_level} - ${section.section_name}`)
      onValueChange(section.id.toString())
    } else {
      setSelectedSection(null)
      setInputValue("")
      onValueChange(null)
    }
    setShowSuggestions(false)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className="w-full"
        autoComplete="off"
      />
      
      {showSuggestions && (inputValue || !selectedSection) && (
        <div className="absolute z-[60] w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-[200px] overflow-y-auto">
          {filteredSections.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">
              {emptyMessage}
            </div>
          ) : (
            <>
              <div
                onClick={() => handleSelectSection(null)}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 transition-colors",
                  !selectedSection && "bg-slate-50"
                )}
              >
                None
              </div>
              {filteredSections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => handleSelectSection(section)}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 transition-colors",
                    selectedSection?.id === section.id && "bg-slate-50"
                  )}
                >
                  {section.grade_level} - {section.section_name}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
