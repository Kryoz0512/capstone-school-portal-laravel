import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { update } from '@/routes/admin/admission/accreditations'
import { useEffect } from 'react'

type Accreditation = {
    id: number
    accreditation_type: string
    accrediting_body: string
    certificate_number: string
    date_issued: string
    valid_from: string
    valid_until: string
    status: string
    description: string | null
}

type EditAccreditationModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    accreditation: Accreditation | null
}

export default function EditAccreditationModal({ open, onOpenChange, accreditation }: EditAccreditationModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        accreditation_type: '',
        accrediting_body: '',
        certificate_number: '',
        date_issued: '',
        valid_from: '',
        valid_until: '',
        status: 'Active',
        description: ''
    })

    useEffect(() => {
        if (accreditation) {
            setData({
                accreditation_type: accreditation.accreditation_type,
                accrediting_body: accreditation.accrediting_body,
                certificate_number: accreditation.certificate_number,
                date_issued: accreditation.date_issued,
                valid_from: accreditation.valid_from,
                valid_until: accreditation.valid_until,
                status: accreditation.status,
                description: accreditation.description || ''
            })
        }
    }, [accreditation])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (accreditation) {
            put(update.url({ accreditation: accreditation.id }), {
                onSuccess: () => {
                    onOpenChange(false)
                    reset()
                }
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Accreditation</DialogTitle>
                    <DialogDescription>
                        Update accreditation information
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Accreditation Type <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                required
                                placeholder="e.g., DepEd Recognition"
                                value={data.accreditation_type}
                                onChange={(e) => setData('accreditation_type', e.target.value)}
                            />
                            {errors.accreditation_type && <p className="text-xs text-red-500 mt-1">{errors.accreditation_type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Accrediting Body <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                required
                                placeholder="e.g., Department of Education"
                                value={data.accrediting_body}
                                onChange={(e) => setData('accrediting_body', e.target.value)}
                            />
                            {errors.accrediting_body && <p className="text-xs text-red-500 mt-1">{errors.accrediting_body}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certificate Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            required
                            placeholder="Enter certificate number"
                            value={data.certificate_number}
                            onChange={(e) => setData('certificate_number', e.target.value)}
                        />
                        {errors.certificate_number && <p className="text-xs text-red-500 mt-1">{errors.certificate_number}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Issued <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="date"
                                required
                                value={data.date_issued}
                                onChange={(e) => setData('date_issued', e.target.value)}
                            />
                            {errors.date_issued && <p className="text-xs text-red-500 mt-1">{errors.date_issued}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valid From <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="date"
                                required
                                value={data.valid_from}
                                onChange={(e) => setData('valid_from', e.target.value)}
                            />
                            {errors.valid_from && <p className="text-xs text-red-500 mt-1">{errors.valid_from}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valid Until <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="date"
                                required
                                value={data.valid_until}
                                onChange={(e) => setData('valid_until', e.target.value)}
                            />
                            {errors.valid_until && <p className="text-xs text-red-500 mt-1">{errors.valid_until}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.status}
                            onValueChange={(value) => setData('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Expired">Expired</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <Textarea
                            placeholder="Enter additional details or notes"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
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
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={processing}
                        >
                            {processing ? 'Updating...' : 'Update Accreditation'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
