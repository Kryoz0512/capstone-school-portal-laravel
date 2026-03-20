import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { useEffect } from 'react'

type Room = {
    id: number
    room_number: string
    capacity: number
    status: 'Active' | 'Maintenance'
}

type EditRoomModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    room: Room | null
}

export default function EditRoomModal({ open, onOpenChange, room }: EditRoomModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        room_number: '',
        capacity: '',
        status: 'Active' as 'Active' | 'Maintenance'
    })

    useEffect(() => {
        if (room) {
            setData({
                room_number: room.room_number,
                capacity: room.capacity.toString(),
                status: room.status
            })
        }
    }, [room])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!room) return

        put(`/admin/enrollment/rooms/${room.id}`, {
            onSuccess: () => {
                reset()
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
                            Room Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.room_number}
                            onChange={(e) => setData('room_number', e.target.value)}
                            placeholder="e.g., 101, 102, Lab-1"
                        />
                        {errors.room_number && (
                            <p className="text-xs text-red-500 mt-1">{errors.room_number}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Enter the room number or identifier</p>
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
                            onValueChange={(value: 'Active' | 'Maintenance') => setData('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-xs text-red-500 mt-1">{errors.status}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Active: Available for use | Maintenance: Under repair
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
                            disabled={processing}
                        >
                            {processing ? 'Updating...' : 'Update Room'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
