import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SectionCombobox } from '@/components/ui/section-combobox'
import { useForm } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import axios from 'axios'

type Room = {
    id: number
    room_name: string
    capacity: number
    status: 'Available' | 'Vacant' | 'Occupied'
    section_id?: number | null
}

type EditRoomModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    room: Room | null
    classSections?: Array<{
        id: number
        section_name: string
        grade_level: string
        grade_level_id: number
    }>
}

export default function EditRoomModal({ open, onOpenChange, room, classSections = [] }: EditRoomModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        room_name: '',
        capacity: '',
        status: 'Available' as 'Available' | 'Vacant' | 'Occupied',
        section_id: null as string | null
    })

    const [roomNameError, setRoomNameError] = useState('')
    const [isCheckingRoomName, setIsCheckingRoomName] = useState(false)
    const [initialRoomName, setInitialRoomName] = useState('')

    useEffect(() => {
        if (room) {
            setData({
                room_name: room.room_name,
                capacity: room.capacity.toString(),
                status: room.status,
                section_id: room.section_id ? room.section_id.toString() : null
            })
            setInitialRoomName(room.room_name)
            setRoomNameError('')
        }
    }, [room])

    // Check room name availability (only if changed from initial)
    useEffect(() => {
        if (!data.room_name || data.room_name === initialRoomName) {
            setRoomNameError('')
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsCheckingRoomName(true)
            try {
                const response = await axios.post('/admin/enrollment/rooms/check-room-number', {
                    room_name: data.room_name,
                    room_id: room?.id
                })

                if (!response.data.available) {
                    setRoomNameError(response.data.message)
                } else {
                    setRoomNameError('')
                }
            } catch (error) {
                console.error('Error checking room name:', error)
            } finally {
                setIsCheckingRoomName(false)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [data.room_name, initialRoomName, room?.id])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!room) return

        if (roomNameError || isCheckingRoomName) {
            return
        }

        put(`/admin/enrollment/rooms/${room.id}`, {
            onSuccess: () => {
                reset()
                setRoomNameError('')
                onOpenChange(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Room</DialogTitle>
                    <DialogDescription>
                        Update room information
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Room Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.room_name}
                            onChange={(e) => setData('room_name', e.target.value)}
                            placeholder="e.g., 101, 102, Lab-1"
                        />
                        {isCheckingRoomName && (
                            <p className="text-xs text-blue-500 mt-1">Checking availability...</p>
                        )}
                        {roomNameError && (
                            <p className="text-xs text-red-500 mt-1">{roomNameError}</p>
                        )}
                        {errors.room_name && (
                            <p className="text-xs text-red-500 mt-1">{errors.room_name}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Enter the room name or identifier</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Capacity <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            type="number"
                            min="1"
                            value={data.capacity}
                            onChange={(e) => setData('capacity', e.target.value)}
                            placeholder="e.g., 40, 45, 50"
                        />
                        {errors.capacity && (
                            <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Maximum number of students</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.status}
                            onValueChange={(value: 'Available' | 'Vacant' | 'Occupied') => setData('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="Vacant">Vacant</SelectItem>
                                <SelectItem value="Occupied">Occupied</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-xs text-red-500 mt-1">{errors.status}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Available: Ready for use | Vacant: Empty but assignable | Occupied: Currently in use
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign to Section <span className="text-gray-400">(Optional)</span>
                        </label>
                        <SectionCombobox
                            sections={classSections}
                            value={data.section_id}
                            onValueChange={(value) => setData('section_id', value)}
                            placeholder="Select a section (optional)"
                            emptyMessage="No section found."
                        />
                        {errors.section_id && (
                            <p className="text-xs text-red-500 mt-1">{errors.section_id}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Optionally assign this room to a class section
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processing || isCheckingRoomName || !!roomNameError}
                        >
                            {processing ? 'Updating...' : 'Update Room'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
