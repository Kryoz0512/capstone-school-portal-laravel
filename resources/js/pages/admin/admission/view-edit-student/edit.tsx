import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect } from 'react'
import { update } from '@/routes/admin/admission/view-edit-student'

type Student = {
    id: number
    studentName: string
    lrn: string
    gender: string
    age: number | null
    gradeLevel: string
    section: string
    schoolYear: string
    lastName: string
    firstName: string
    middleName: string | null
    birthDate: string
    profile?: {
        extensionName?: string
        religion?: string
        indigenousPeople?: string
        indigenousType?: string
        pwd?: string
        pwdType?: string
        nationality?: string
        placeOfBirth?: string
        mobileNumber?: string
        contactNumber?: string
        guardianName?: string
        relation?: string
        houseNo?: string
        cityMunicipality?: string
        provinceState?: string
        zipCode?: string
        country?: string
        height?: number
        weight?: number
        build?: string
        eyeColor?: string
        hairColor?: string
        fatherLastName?: string
        fatherFirstName?: string
        fatherMiddleName?: string
        fatherExtensionName?: string
        motherLastName?: string
        motherFirstName?: string
        motherMiddleName?: string
        motherExtensionName?: string
        guardianLastName?: string
        guardianFirstName?: string
        guardianMiddleName?: string
        guardianExtensionName?: string
    } | null
}

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
    student: Student
}

export default function EditStudentGSPIS({ auth, student }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        // Personal Information
        lastName: student.lastName || '',
        firstName: student.firstName || '',
        middleName: student.middleName || '',
        extensionName: student.profile?.extensionName || '',
        dateOfBirth: student.birthDate || '',
        age: student.age?.toString() || '',
        gender: student.gender || '',
        religion: student.profile?.religion || '',
        indigenousPeople: student.profile?.indigenousPeople || 'No',
        indigenousType: student.profile?.indigenousType || '',
        pwd: student.profile?.pwd || 'No',
        pwdType: student.profile?.pwdType || '',
        nationality: student.profile?.nationality || '',
        placeOfBirth: student.profile?.placeOfBirth || '',
        mobileNumber: student.profile?.mobileNumber || '',
        
        // Residence Data
        contactNumber: student.profile?.contactNumber || '',
        guardianName: student.profile?.guardianName || '',
        relation: student.profile?.relation || '',
        houseNo: student.profile?.houseNo || '',
        cityMunicipality: student.profile?.cityMunicipality || '',
        provinceState: student.profile?.provinceState || '',
        zipCode: student.profile?.zipCode || '',
        country: student.profile?.country || '',
        
        // Physical Description
        height: student.profile?.height?.toString() || '',
        weight: student.profile?.weight?.toString() || '',
        build: student.profile?.build || '',
        eyeColor: student.profile?.eyeColor || '',
        hairColor: student.profile?.hairColor || '',
        
        // Family Data - Father
        fatherLastName: student.profile?.fatherLastName || '',
        fatherFirstName: student.profile?.fatherFirstName || '',
        fatherMiddleName: student.profile?.fatherMiddleName || '',
        fatherExtensionName: student.profile?.fatherExtensionName || '',
        
        // Family Data - Mother
        motherLastName: student.profile?.motherLastName || '',
        motherFirstName: student.profile?.motherFirstName || '',
        motherMiddleName: student.profile?.motherMiddleName || '',
        motherExtensionName: student.profile?.motherExtensionName || '',
        
        // Family Data - Guardian
        guardianLastName: student.profile?.guardianLastName || '',
        guardianFirstName: student.profile?.guardianFirstName || '',
        guardianMiddleName: student.profile?.guardianMiddleName || '',
        guardianExtensionName: student.profile?.guardianExtensionName || '',
    })

    const handleSave = () => {
        put(update.url({ id: student.id }))
    }

    const handleCancel = () => {
        router.visit('/admin/admission/view-edit-student')
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Edit General Student Personal Information Sheet (GSPIS)" />

            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Edit General Student Personal Information Sheet (GSPIS)
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Update student information for {student.studentName}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
                    {/* Grade Level and School Year */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grade Level
                            </label>
                            <Input value={student.gradeLevel} readOnly className="bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                School Year
                            </label>
                            <Input value={student.schoolYear} readOnly className="bg-gray-50" />
                        </div>
                    </div>

                    {/* I - Learner's Personal Information */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">I - Learner's Personal Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <Input
                                    value={data.lastName}
                                    onChange={(e) => setData('lastName', e.target.value)}
                                    placeholder="Last Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <Input
                                    value={data.firstName}
                                    onChange={(e) => setData('firstName', e.target.value)}
                                    placeholder="First Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Middle Name
                                </label>
                                <Input
                                    value={data.middleName}
                                    onChange={(e) => setData('middleName', e.target.value)}
                                    placeholder="Middle Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Extn. Name if any
                                </label>
                                <Input
                                    value={data.extensionName}
                                    onChange={(e) => setData('extensionName', e.target.value)}
                                    placeholder="Jr., Sr., III"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth (mm/dd/yyyy)
                                </label>
                                <Input
                                    type="date"
                                    value={data.dateOfBirth}
                                    onChange={(e) => setData('dateOfBirth', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Age
                                </label>
                                <Input
                                    type="number"
                                    value={data.age}
                                    onChange={(e) => setData('age', e.target.value)}
                                    placeholder="Age"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                </label>
                                <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Religion
                                </label>
                                <Select value={data.religion} onValueChange={(value) => setData('religion', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select religion" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Roman Catholic">Roman Catholic</SelectItem>
                                        <SelectItem value="Islam">Islam</SelectItem>
                                        <SelectItem value="Iglesia ni Cristo">Iglesia ni Cristo</SelectItem>
                                        <SelectItem value="Protestant">Protestant</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Belonging to any Indigenous People (IP) Community / Indigenous Cultural Community?
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="indigenousPeople"
                                        value="No"
                                        checked={data.indigenousPeople === 'No'}
                                        onChange={(e) => setData('indigenousPeople', e.target.value)}
                                    />
                                    <span className="text-sm">No</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="indigenousPeople"
                                        value="Yes"
                                        checked={data.indigenousPeople === 'Yes'}
                                        onChange={(e) => setData('indigenousPeople', e.target.value)}
                                    />
                                    <span className="text-sm">Yes, if yes please specify:</span>
                                </label>
                                <Input
                                    value={data.indigenousType}
                                    onChange={(e) => setData('indigenousType', e.target.value)}
                                    placeholder="Type of Indigenous People"
                                    disabled={data.indigenousPeople === 'No'}
                                    className="max-w-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Is the learner a person with disability (PWD)?
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="pwd"
                                        value="No"
                                        checked={data.pwd === 'No'}
                                        onChange={(e) => setData('pwd', e.target.value)}
                                    />
                                    <span className="text-sm">No</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="pwd"
                                        value="Yes"
                                        checked={data.pwd === 'Yes'}
                                        onChange={(e) => setData('pwd', e.target.value)}
                                    />
                                    <span className="text-sm">Yes, if yes please specify:</span>
                                </label>
                                <Input
                                    value={data.pwdType}
                                    onChange={(e) => setData('pwdType', e.target.value)}
                                    placeholder="Type of Disability"
                                    disabled={data.pwd === 'No'}
                                    className="max-w-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nationality
                                </label>
                                <Input
                                    value={data.nationality}
                                    onChange={(e) => setData('nationality', e.target.value)}
                                    placeholder="Nationality"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Place of Birth
                                </label>
                                <Input
                                    value={data.placeOfBirth}
                                    onChange={(e) => setData('placeOfBirth', e.target.value)}
                                    placeholder="Place of Birth"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mobile Number
                                </label>
                                <Input
                                    value={data.mobileNumber}
                                    onChange={(e) => setData('mobileNumber', e.target.value)}
                                    placeholder="Mobile Number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* II - Learner's Residence Data */}
                    <div className="space-y-4 pt-6 border-t">
                        <h2 className="text-lg font-semibold text-gray-900">II - Learner's Learner's Residence Data</h2>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Current Contact Address:
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Number / Guardian Name
                                </label>
                                <Input
                                    value={data.contactNumber}
                                    onChange={(e) => setData('contactNumber', e.target.value)}
                                    placeholder="Contact Number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Relation
                                </label>
                                <Input
                                    value={data.relation}
                                    onChange={(e) => setData('relation', e.target.value)}
                                    placeholder="Relation"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    House No./Street/Barangay
                                </label>
                                <Input
                                    value={data.houseNo}
                                    onChange={(e) => setData('houseNo', e.target.value)}
                                    placeholder="House No./Street/Barangay"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City/Municipality
                                </label>
                                <Input
                                    value={data.cityMunicipality}
                                    onChange={(e) => setData('cityMunicipality', e.target.value)}
                                    placeholder="City/Municipality"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Province/State
                                </label>
                                <Input
                                    value={data.provinceState}
                                    onChange={(e) => setData('provinceState', e.target.value)}
                                    placeholder="Province/State"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Zip Code
                                </label>
                                <Input
                                    value={data.zipCode}
                                    onChange={(e) => setData('zipCode', e.target.value)}
                                    placeholder="Zip Code"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country
                                </label>
                                <Input
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                    placeholder="Country"
                                />
                            </div>
                        </div>
                    </div>

                    {/* III - Physical Description */}
                    <div className="space-y-4 pt-6 border-t">
                        <h2 className="text-lg font-semibold text-gray-900">III - Physical Description</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Height (cms)
                                </label>
                                <Input
                                    type="number"
                                    value={data.height}
                                    onChange={(e) => setData('height', e.target.value)}
                                    placeholder="Height"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Weight (kg)
                                </label>
                                <Input
                                    type="number"
                                    value={data.weight}
                                    onChange={(e) => setData('weight', e.target.value)}
                                    placeholder="Weight"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Build
                                </label>
                                <Input
                                    value={data.build}
                                    onChange={(e) => setData('build', e.target.value)}
                                    placeholder="Build"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Eye Color
                                </label>
                                <Input
                                    value={data.eyeColor}
                                    onChange={(e) => setData('eyeColor', e.target.value)}
                                    placeholder="Eye Color"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hair Color
                                </label>
                                <Input
                                    value={data.hairColor}
                                    onChange={(e) => setData('hairColor', e.target.value)}
                                    placeholder="Hair Color"
                                />
                            </div>
                        </div>
                    </div>

                    {/* IV - Family Data */}
                    <div className="space-y-6 pt-6 border-t">
                        <h2 className="text-lg font-semibold text-gray-900">IV - Family Data</h2>
                        
                        {/* Father's Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Input
                                        value={data.fatherLastName}
                                        onChange={(e) => setData('fatherLastName', e.target.value)}
                                        placeholder="Last Name"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={data.fatherFirstName}
                                        onChange={(e) => setData('fatherFirstName', e.target.value)}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={data.fatherMiddleName}
                                        onChange={(e) => setData('fatherMiddleName', e.target.value)}
                                        placeholder="Middle Name"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={data.fatherExtensionName}
                                        onChange={(e) => setData('fatherExtensionName', e.target.value)}
                                        placeholder="Extn. Name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mother's Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Input
                                        value={data.motherLastName}
                                        onChange={(e) => setData('motherLastName', e.target.value)}
                                        placeholder="Last Name"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={data.motherFirstName}
                                        onChange={(e) => setData('motherFirstName', e.target.value)}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={data.motherMiddleName}
                                        onChange={(e) => setData('motherMiddleName', e.target.value)}
                                        placeholder="Middle Name"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={data.motherExtensionName}
                                        onChange={(e) => setData('motherExtensionName', e.target.value)}
                                        placeholder="Extn. Name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Legal Guardian's Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Legal Guardian's Name</label>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Input
                                        value={data.guardianLastName}
                                        onChange={(e) => setData('guardianLastName', e.target.value)}
                                        placeholder="Last Name"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={data.guardianFirstName}
                                        onChange={(e) => setData('guardianFirstName', e.target.value)}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={data.guardianMiddleName}
                                        onChange={(e) => setData('guardianMiddleName', e.target.value)}
                                        placeholder="Middle Name"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={data.guardianExtensionName}
                                        onChange={(e) => setData('guardianExtensionName', e.target.value)}
                                        placeholder="Extn. Name"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleSave}
                            disabled={processing}
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
