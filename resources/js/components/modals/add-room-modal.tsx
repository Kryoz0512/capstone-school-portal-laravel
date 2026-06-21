import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import InputError from '../input-error'
import axios from 'axios'

type AddRoomModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function AddRoomModal({ open, onOpenChange }: AddRoomModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        room_number: '',
        capacity: '',
        status: 'Available' as 'Available' | 'Vacant' | 'Occupied'
    })

    const [roomNumberError, setRoomNumberError] = useState('')
    const [isCheckingRoomNumber, setIsCheckingRoomNumber] = useState(false)

    // Check room number availability
    useEffect(() => {
        if (!data.room_number) {
            setRoomNumberError('')
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsCheckingRoomNumber(true)
            try {
                const response = await axios.post('/admin/enrollment/rooms/check-room-number', {
                    room_number: data.room_number
                })
                
                if (!response.data.available) {
                    setRoomNumberError(response.data.message)
                } else {
                    setRoomNumberError('')
                }
            } catch (error) {
                console.error('Error checking room number:', error)
            } finally {
                setIsCheckingRoomNumber(false)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [data.room_number])

    const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (roomNumberError || isCheckingRoomNumber) {
            return
        }
        
        post('/admin/enrollment/rooms', {
            onSuccess: () => {
                reset()
                setRoomNumberError('')
                onOpenChange(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Room</DialogTitle>
                    <DialogDescription>
                        Create a new room with capacity and status
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Room Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            // required
                            value={data.room_number}
                            onChange={(e) => setData('room_number', e.target.value)}
                            placeholder="e.g., 101, 102, Lab-1"
                        />
                        {isCheckingRoomNumber && (
                            <p className="text-xs text-blue-500 mt-1">Checking availability...</p>
                        )}
                        {roomNumberError && (
                            <p className="text-xs text-red-500 mt-1">{roomNumberError}</p>
                        )}
                        <InputError message={errors.room_number}/>
                        {/* {errors.room_number && (
                            <p className="text-xs text-red-500 mt-1">{errors.room_number}</p>
                        )} */}
                        <p className="text-xs text-gray-500 mt-1">Enter the room number or identifier</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Capacity <span className="text-red-500">*</span>
                        </label>
                        <Input
                            // required
                            type="number"
                            min="1"
                            value={data.capacity}
                            onChange={(e) => setData('capacity', e.target.value)}
                            placeholder="e.g., 40, 45, 50"
                        />
                        <InputError message={errors.capacity}/>
                        {/* {errors.capacity && (
                            <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>
                        )} */}
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
                            Available: Available for use | Vacant: Vacant | Occupied: Occupied
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
                            disabled={processing || isCheckingRoomNumber || !!roomNumberError}
                        >
                            {processing ? 'Creating...' : 'Create Room'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
