import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type Teacher = {
  id: number
  name: string
}

interface TeacherComboboxProps {
  teachers: Teacher[]
  value: string | null
  onValueChange: (value: string | null) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
}

export function TeacherCombobox({
  teachers,
  value,
  onValueChange,
  placeholder = "Type to search teacher...",
  emptyMessage = "No teacher found.",
  disabled = false,
}: TeacherComboboxProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  // Initialize selected teacher from value
  React.useEffect(() => {
    if (value) {
      const teacher = teachers.find((t) => t.id.toString() === value)
      if (teacher) {
        setSelectedTeacher(teacher)
        setInputValue(teacher.name)
      }
    } else {
      setSelectedTeacher(null)
      setInputValue("")
    }
  }, [value, teachers])

  // Filter teachers based on input
  const filteredTeachers = React.useMemo(() => {
    if (!inputValue) return teachers
    const searchLower = inputValue.toLowerCase()
    return teachers.filter((teacher) => {
      return teacher.name.toLowerCase().includes(searchLower)
    })
  }, [inputValue, teachers])

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
      setSelectedTeacher(null)
      onValueChange(null)
    }
  }

  const handleSelectTeacher = (teacher: Teacher | null) => {
    if (teacher) {
      setSelectedTeacher(teacher)
      setInputValue(teacher.name)
      onValueChange(teacher.id.toString())
    } else {
      setSelectedTeacher(null)
      setInputValue("")
      onValueChange(null)
    }
    setShowSuggestions(false)
  }

  const handleInputFocus = () => {
    if (!disabled) {
      setShowSuggestions(true)
    }
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
        disabled={disabled}
      />
      
      {showSuggestions && !disabled && (inputValue || !selectedTeacher) && (
        <div className="absolute z-[60] w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-[200px] overflow-y-auto">
          {filteredTeachers.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">
              {emptyMessage}
            </div>
          ) : (
            <>
              <div
                onClick={() => handleSelectTeacher(null)}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 transition-colors",
                  !selectedTeacher && "bg-slate-50"
                )}
              >
                None
              </div>
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  onClick={() => handleSelectTeacher(teacher)}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 transition-colors",
                    selectedTeacher?.id === teacher.id && "bg-slate-50"
                  )}
                >
                  {teacher.name}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
