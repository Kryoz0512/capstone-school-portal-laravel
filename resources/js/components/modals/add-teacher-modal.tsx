import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState, useEffect } from 'react'

type AddTeacherModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function AddTeacherModal({ open, onOpenChange }: AddTeacherModalProps) {
    const [formData, setFormData] = useState({
        employeeNo: '',
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        grade: '',
        section: '',
        position: '',
        password: ''
    })

    // Auto-generate email pag tinype ung first saka lastname
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
            employeeNo: '',
            firstName: '',
            lastName: '',
            email: '',
            subject: '',
            grade: '',
            section: '',
            position: '',
            password: ''
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Teacher</DialogTitle>
                    <DialogDescription>
                        Create a new teacher account with subject and grade assignment
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employee Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={formData.employeeNo}
                            onChange={(e) => setFormData({ ...formData, employeeNo: e.target.value })}
                            placeholder="e.g., T-001, T-002"
                        />
                        <p className="text-xs text-gray-500 mt-1">Must be unique (e.g., T-001)</p>
                    </div>

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={formData.subject}
                                onValueChange={(value) => setFormData({ ...formData, subject: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                                    <SelectItem value="Science">Science</SelectItem>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Filipino">Filipino</SelectItem>
                                    <SelectItem value="Social Studies">Social Studies</SelectItem>
                                    <SelectItem value="Physical Education">Physical Education</SelectItem>
                                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grade Level <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={formData.grade}
                                onValueChange={(value) => setFormData({ ...formData, grade: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Grade 7</SelectItem>
                                    <SelectItem value="8">Grade 8</SelectItem>
                                    <SelectItem value="9">Grade 9</SelectItem>
                                    <SelectItem value="10">Grade 10</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Section <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                placeholder="e.g., A, B, C"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Position <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={formData.position}
                                onValueChange={(value) => setFormData({ ...formData, position: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Teacher I">Teacher I</SelectItem>
                                    <SelectItem value="Teacher II">Teacher II</SelectItem>
                                    <SelectItem value="Teacher III">Teacher III</SelectItem>
                                    <SelectItem value="Master Teacher I">Master Teacher I</SelectItem>
                                    <SelectItem value="Master Teacher II">Master Teacher II</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                            Create Teacher
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
