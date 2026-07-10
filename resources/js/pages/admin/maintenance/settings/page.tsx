import { Head, useForm, usePage } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

type SchoolYearOption = {
    value: string
    label: string
}

type Props = {
    auth?: {
        user: {
            name: string
            email: string
            role: string
        }
        admin?: {
            role: string
            position: string
        }
    }
    currentSchoolYear: string
    schoolYears: SchoolYearOption[]
}

export default function SystemSettings({ auth, currentSchoolYear, schoolYears }: Props) {
    const { props } = usePage()
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [selectedSchoolYear, setSelectedSchoolYear] = useState(currentSchoolYear)
    
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
        school_year: currentSchoolYear,
        password: ''
    })

    const handleSaveClick = () => {
        setData('school_year', selectedSchoolYear)
        setIsPasswordModalOpen(true)
    }

    const confirmUpdate = (e: React.FormEvent) => {
        e.preventDefault()
        
        post('/admin/maintenance/settings/school-year', {
            preserveScroll: true,
            onSuccess: () => {
                setIsPasswordModalOpen(false)
                reset('password')
                clearErrors()
                // Update local state to match the newly saved currentSchoolYear
                // (though Inertia handles prop updates automatically)
            },
            onError: () => {
                // Keep modal open on error to show password error
            }
        })
    }

    const closePasswordModal = () => {
        setIsPasswordModalOpen(false)
        reset('password')
        clearErrors()
    }

    return (
        <AdminLayout
            currentPath="/admin/maintenance/settings"
            user={auth?.user}
            admin={auth?.admin}
        >
            <Head title="System Settings" />

            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Settings className="w-6 h-6 text-green-600" />
                            System Settings
                        </h1>
                        <p className="text-gray-500 mt-1">Manage core system configurations and defaults.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <div className="max-w-xl">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Default School Year</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                This determines the active school year that all pages will load by default. 
                                Note: Users can still manually select other school years from the dropdowns across the system.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                        Current Default School Year
                                    </Label>
                                    <Select 
                                        value={selectedSchoolYear} 
                                        onValueChange={setSelectedSchoolYear}
                                    >
                                        <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                                            <SelectValue placeholder="Select a school year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schoolYears.map((yearOption) => (
                                                <SelectItem key={yearOption.value} value={yearOption.value}>
                                                    {yearOption.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button 
                                    onClick={handleSaveClick}
                                    disabled={selectedSchoolYear === currentSchoolYear}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Confirmation Modal */}
                <Dialog open={isPasswordModalOpen} onOpenChange={closePasswordModal}>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={confirmUpdate}>
                            <DialogHeader>
                                <DialogTitle>Confirm Action</DialogTitle>
                                <DialogDescription>
                                    Changing the default school year affects the entire system's initial state. 
                                    Please enter your password to confirm this action.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="py-4 space-y-4">
                                {errors.password && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{errors.password}</AlertDescription>
                                    </Alert>
                                )}
                                
                                <div className="space-y-2">
                                    <Label htmlFor="password">Administrator Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={closePasswordModal}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    disabled={processing || !data.password}
                                >
                                    {processing ? 'Confirming...' : 'Confirm Update'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    )
}
