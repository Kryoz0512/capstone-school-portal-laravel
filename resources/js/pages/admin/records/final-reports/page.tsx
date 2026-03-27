import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Eye, Download, Search } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

type Student = {
    id: number
    lrn: string
    studentName: string
    gradeLevel: string
    section: string
    finalAverage: number | null
    remarks: 'Passed' | 'Failed' | null
}

type GradeLevel = {
    id: number
    name: string
}

type Section = {
    id: number
    name: string
    grade_level_id: number
    grade_level_name: string
}

type SchoolYear = {
    value: string
    label: string
}

type Props = {
    schoolYears: SchoolYear[]
    gradeLevels: GradeLevel[]
    sections: Section[]
    students: Student[]
    filters: {
        school_year: string
        grade_level_id: number | null
        section_id: number | null
    }
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
}

export default function FinalReports({ schoolYears, gradeLevels, sections, students, filters, auth }: Props) {
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')
    const [gradeLevel, setGradeLevel] = useState(filters.grade_level_id?.toString() || '')
    const [section, setSection] = useState(filters.section_id?.toString() || '')
    const [searchQuery, setSearchQuery] = useState('')

    // Update filters when selections change
    useEffect(() => {
        const params = new URLSearchParams()
        if (schoolYear) params.set('school_year', schoolYear)
        if (gradeLevel) params.set('grade_level_id', gradeLevel)
        if (section) params.set('section_id', section)

        router.get(`/admin/records/final-reports?${params.toString()}`, {}, {
            preserveState: true,
            preserveScroll: true,
        })
    }, [schoolYear, gradeLevel, section])

    // Reset section when grade level changes
    useEffect(() => {
        if (gradeLevel && section) {
            const selectedSection = sections.find(s => s.id.toString() === section)
            if (selectedSection && selectedSection.grade_level_id.toString() !== gradeLevel) {
                setSection('')
            }
        }
    }, [gradeLevel])

    // Filter students by search query (name or LRN)
    const filteredStudents = useMemo(() => {
        if (!searchQuery) return students
        
        const query = searchQuery.toLowerCase()
        return students.filter(student => 
            student.studentName.toLowerCase().includes(query) ||
            student.lrn.toLowerCase().includes(query)
        )
    }, [students, searchQuery])

    // Get selected details
    const selectedSection = sections.find(s => s.id.toString() === section)
    const selectedGradeLevel = gradeLevels.find(g => g.id.toString() === gradeLevel)

    const passedCount = filteredStudents.filter(s => s.remarks === 'Passed').length
    const failedCount = filteredStudents.filter(s => s.remarks === 'Failed').length

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Final Reports" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Final Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage student final grade reports
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Students</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{filteredStudents.length}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Passed</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{passedCount}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600 font-medium">Failed</p>
                        <p className="text-3xl font-bold text-red-900 mt-2">{failedCount}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-base font-semibold text-gray-900">Filter Options</h2>
                        <p className="text-sm text-gray-500 mt-1">Select criteria to view final reports</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    School Year <span className="text-red-500">*</span>
                                </label>
                                <Select value={schoolYear} onValueChange={setSchoolYear}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select school year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {schoolYears.map((year) => (
                                            <SelectItem key={year.value} value={year.value}>
                                                {year.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Grade Level <span className="text-red-500">*</span>
                                </label>
                                <Select value={gradeLevel} onValueChange={setGradeLevel} disabled={!schoolYear}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={schoolYear ? "Select grade level" : "Select school year first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gradeLevels.map((level) => (
                                            <SelectItem key={level.id} value={level.id.toString()}>
                                                {level.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Section <span className="text-red-500">*</span>
                                </label>
                                <Select value={section} onValueChange={setSection} disabled={!gradeLevel || sections.length === 0}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={gradeLevel ? "Select section" : "Select grade first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections
                                            .filter(s => !gradeLevel || s.grade_level_id.toString() === gradeLevel)
                                            .map((sec) => (
                                                <SelectItem key={sec.id} value={sec.id.toString()}>
                                                    {sec.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Search Student
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Name or LRN..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                        disabled={!section}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {!section ? (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Note:</span> Please select school year, grade level, and section to view final reports.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Table */}
                {section ? (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">Student Final Reports</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedGradeLevel?.name} - {selectedSection?.name} | School Year: {schoolYear}
                                </p>
                            </div>
                            <p className="text-sm text-gray-600">
                                Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">No.</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">LRN</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Final Average</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Remarks</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student, index) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.lrn}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{student.studentName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{student.section}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">
                                                    {student.finalAverage !== null ? student.finalAverage : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {student.remarks ? (
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                            student.remarks === 'Passed' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {student.remarks}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button className="text-gray-600 hover:text-blue-600" title="View Details">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-gray-600 hover:text-green-600" title="Download Report">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                                                {searchQuery 
                                                    ? 'No students found matching your search.'
                                                    : 'No students found or no final grades available for this section.'
                                                }
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Section Selected</h3>
                            <p className="text-sm text-gray-500">
                                Please select school year, grade level, and section from the filters above to view student final reports.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
