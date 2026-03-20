import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState, useEffect } from 'react'

type AddAdminModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function AddAdminModal({ open, onOpenChange }: AddAdminModalProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        role: 'Staff' as 'Admin' | 'Staff',
        password: ''
    })

    useEffect(() => {
        if (formData.firstName || formData.lastName) {
            const firstName = formData.firstName.toLowerCase().trim()
            const lastName = formData.lastName.toLowerCase().trim()
            const generatedEmail = firstName && lastName 
                ? `${lastName}.${firstName}@snhs.edu.ph`
                : firstName 
                    ? `${firstName}@snhs.edu.ph`
                    : lastName
                        ? `${lastName}@snhs.edu.ph`
                        : ''
            setFormData(prev => ({ ...prev, email: generatedEmail }))
        } else {
            setFormData(prev => ({ ...prev, email: '' }))
        }
    }, [formData.firstName, formData.lastName])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form data:', formData)
        onOpenChange(false)
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            position: '',
            role: 'Staff',
            password: ''
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
                                value={formData.firstName}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                                    setFormData({ ...formData, firstName: value })
                                }}
                                placeholder="Enter first name"
                                pattern="[A-Za-z\s]+"
                                title="Only letters are allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                value={formData.lastName}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                                    setFormData({ ...formData, lastName: value })
                                }}
                                placeholder="Enter last name"
                                pattern="[A-Za-z\s]+"
                                title="Only letters are allowed"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            type="email"
                            value={formData.email}
                            readOnly
                            className="bg-gray-50"
                            placeholder="lastname.firstname@snhs.edu.ph"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-generated from first and last name</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            placeholder="e.g., Principal, Registrar, Admin Staff"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={formData.role}
                            onValueChange={(value: 'Admin' | 'Staff') => setFormData({ ...formData, role: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Staff">Staff</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                            Admin: Full access | Staff: Limited access
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Enter password"
                            minLength={8}
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Create Admin
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
