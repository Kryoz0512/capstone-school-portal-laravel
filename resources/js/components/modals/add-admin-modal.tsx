import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState, useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import { store } from '@/routes/admin'

type AddAdminModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function AddAdminModal({ open, onOpenChange }: AddAdminModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        position: '',
        password: ''
    })

    const [generatedEmail, setGeneratedEmail] = useState('')

    // Helper function to capitalize first letter of each word
    const toTitleCase = (str: string) => {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    useEffect(() => {
        if (data.first_name && data.last_name) {
            const firstName = data.first_name.toUpperCase().trim().replace(/\s+/g, '')
            const lastName = data.last_name.toUpperCase().trim().replace(/\s+/g, '')
            const email = `SNHS-${lastName}-${firstName}`
            setGeneratedEmail(email)
        } else {
            setGeneratedEmail('')
        }
    }, [data.first_name, data.last_name])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        post(store.url(), {
            onSuccess: () => {
                reset()
                setGeneratedEmail('')
                onOpenChange(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Admin</DialogTitle>
                    <DialogDescription>
                        Create a new admin account with role-based access control
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                value={data.first_name}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                                    setData('first_name', toTitleCase(value))
                                }}
                                placeholder="Enter first name"
                                pattern="[A-Za-z\s]+"
                                title="Only letters are allowed"
                            />
                            {errors.first_name && (
                                <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                value={data.last_name}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                                    setData('last_name', toTitleCase(value))
                                }}
                                placeholder="Enter last name"
                                pattern="[A-Za-z\s]+"
                                title="Only letters are allowed"
                            />
                            {errors.last_name && (
                                <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            type="email"
                            value={generatedEmail}
                            readOnly
                            className="bg-gray-50"
                            placeholder="SNHS-LASTNAME-FIRSTNAME"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-generated as SNHS-LASTNAME-FIRSTNAME</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.position}
                            onChange={(e) => setData('position', e.target.value)}
                            placeholder="e.g., Principal, Registrar, Admin Staff"
                        />
                        {errors.position && (
                            <p className="text-xs text-red-500 mt-1">{errors.position}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter password"
                            minLength={8}
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                        {errors.password && (
                            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset()
                                setGeneratedEmail('')
                                onOpenChange(false)
                            }}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processing}
                        >
                            {processing ? 'Creating...' : 'Create Admin'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
