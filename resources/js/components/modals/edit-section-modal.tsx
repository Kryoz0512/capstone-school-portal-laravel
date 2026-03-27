import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm, router } from '@inertiajs/react'
import { update } from '@/routes/admin/enrollment/class-sections'
import { useEffect, useState } from 'react'
import axios from 'axios'

type GradeLevel = {
    id: number
    name: string
}

type Room = {
    id: number
    room_number: string
    capacity: number
}

type Section = {
    id: number
    section_name: string
    grade_level_id: number
    grade_level: string
    room_id: number | null
}

type EditSectionModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    section: Section | null
    gradeLevels: GradeLevel[]
    rooms: Room[]
}

export default function EditSectionModal({ open, onOpenChange, section, gradeLevels, rooms = [] }: EditSectionModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm<{
        section_name: string
        grade_level_id: string | undefined
        room_id: number | null
    }>({
        section_name: '',
        grade_level_id: undefined,
        room_id: null
    })

    const [sectionNameError, setSectionNameError] = useState('')
    const [isCheckingSectionName, setIsCheckingSectionName] = useState(false)
    const [initialSectionName, setInitialSectionName] = useState('')
    const [initialGradeLevelId, setInitialGradeLevelId] = useState('')
    const [showRoomDropdown, setShowRoomDropdown] = useState(false)
    const [roomNumberInput, setRoomNumberInput] = useState('')
    const [roomError, setRoomError] = useState('')
    const [isCheckingRoom, setIsCheckingRoom] = useState(false)

    // Reload page data when modal opens to get fresh room list
    useEffect(() => {
        if (open) {
            router.reload({ only: ['rooms', 'sections'] })
        }
    }, [open])

    useEffect(() => {
        if (section) {
            // Find the room number from the room_id
            const room = rooms.find(r => r.id === section.room_id)
            const roomNumber = room ? room.room_number : ''
            
            setData({
                section_name: section.section_name,
                grade_level_id: section.grade_level_id.toString(),
                room_id: section.room_id
            })
            setRoomNumberInput(roomNumber)
            setInitialSectionName(section.section_name)
            setInitialGradeLevelId(section.grade_level_id.toString())
            setSectionNameError('')
            setRoomError('')
        }
    }, [section, rooms])

    // Check room availability (only if changed from initial)
    useEffect(() => {
        if (!data.room_id) {
            setRoomError('')
            return
        }

        // Don't check if room is unchanged
        if (section && data.room_id === section.room_id) {
            setRoomError('')
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsCheckingRoom(true)
            try {
                const response = await axios.post('/admin/enrollment/class-sections/check-room', {
                    room_id: data.room_id,
                    section_id: section?.id
                })
                
                if (!response.data.available) {
                    setRoomError(response.data.message)
                } else {
                    setRoomError('')
                }
            } catch (error) {
                console.error('Error checking room availability:', error)
            } finally {
                setIsCheckingRoom(false)
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [data.room_id, section?.id, section?.room_id])

    // Check section name availability (only if changed from initial)
    useEffect(() => {
        if (!data.section_name) {
            setSectionNameError('')
            return
        }

        // Don't check if name is unchanged
        if (data.section_name.toLowerCase() === initialSectionName.toLowerCase()) {
            setSectionNameError('')
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsCheckingSectionName(true)
            try {
                const response = await axios.post('/admin/enrollment/class-sections/check-section-name', {
                    section_name: data.section_name,
                    section_id: section?.id
                })
                
                if (!response.data.available) {
                    setSectionNameError(response.data.message)
                } else {
                    setSectionNameError('')
                }
            } catch (error) {
                console.error('Error checking section name:', error)
            } finally {
                setIsCheckingSectionName(false)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [data.section_name, initialSectionName, section?.id])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!section) return

        if (sectionNameError || isCheckingSectionName) {
            return
        }

        if (roomError || isCheckingRoom) {
            return
        }

        if (!data.room_id) {
            alert('Please select a valid room from the suggestions.')
            return
        }

        put(update.url({ classSection: section.id }), {
            data: {
                section_name: data.section_name,
                grade_level_id: data.grade_level_id,
                room_id: data.room_id
            },
            onSuccess: () => {
                onOpenChange(false)
                reset()
                setRoomNumberInput('')
                setSectionNameError('')
                setRoomError('')
            }
        })
    }

    const handleRoomNumberChange = (value: string) => {
        setRoomNumberInput(value)
        setShowRoomDropdown(true)
        
        // Try to find matching room and set room_id
        const room = rooms.find(r => r.room_number.toLowerCase() === value.toLowerCase().trim())
        if (room) {
            setData('room_id', room.id)
        } else {
            setData('room_id', null)
        }
    }

    const handleRoomSelect = (room: Room) => {
        setRoomNumberInput(room.room_number)
        setData('room_id', room.id)
        setShowRoomDropdown(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Section</DialogTitle>
                    <DialogDescription>
                        Update the section name and grade level
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.section_name}
                            onChange={(e) => setData('section_name', e.target.value)}
                            placeholder="e.g., Section A, Section B"
                        />
                        {isCheckingSectionName && (
                            <p className="text-xs text-blue-500 mt-1">Checking availability...</p>
                        )}
                        {sectionNameError && (
                            <p className="text-xs text-red-500 mt-1">{sectionNameError}</p>
                        )}
                        {errors.section_name && <p className="text-xs text-red-500 mt-1">{errors.section_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grade Level <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.grade_level_id?.toString()}
                            onValueChange={(value) => setData('grade_level_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select grade level" />
                            </SelectTrigger>
                            <SelectContent>
                                {gradeLevels.map((level) => (
                                    <SelectItem key={level.id} value={level.id.toString()}>
                                        {level.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.grade_level_id && <p className="text-xs text-red-500 mt-1">{errors.grade_level_id}</p>}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assigned Room <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={roomNumberInput}
                            onChange={(e) => handleRoomNumberChange(e.target.value)}
                            onFocus={() => setShowRoomDropdown(true)}
                            onBlur={() => setTimeout(() => setShowRoomDropdown(false), 200)}
                            placeholder="Enter room number"
                        />
                        
                        {showRoomDropdown && roomNumberInput && rooms.length > 0 && (() => {
                            const filteredRooms = rooms
                                .filter(room => room.room_number.toLowerCase().includes(roomNumberInput.toLowerCase()))
                                .slice(0, 5);
                            
                            return filteredRooms.length > 0 ? (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                                    {filteredRooms.map((room) => (
                                        <button
                                            key={room.id}
                                            type="button"
                                            onClick={() => handleRoomSelect(room)}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
                                        >
                                            <div className="font-medium">{room.room_number}</div>
                                            <div className="text-xs text-gray-500">Capacity: {room.capacity}</div>
                                        </button>
                                    ))}
                                </div>
                            ) : null;
                        })()}
                        
                        {errors.room_id && <p className="text-xs text-red-500 mt-1">{errors.room_id}</p>}
                        {isCheckingRoom && (
                            <p className="text-xs text-blue-500 mt-1">Checking room availability...</p>
                        )}
                        {roomError && (
                            <p className="text-xs text-red-500 mt-1">{roomError}</p>
                        )}
                        {roomNumberInput && !data.room_id && !isCheckingRoom && (
                            <p className="text-xs text-amber-600 mt-1">Please select a room from the suggestions</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false)
                                reset()
                            }}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processing || isCheckingSectionName || !!sectionNameError || isCheckingRoom || !!roomError}
                        >
                            {processing ? 'Updating...' : 'Update Section'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
