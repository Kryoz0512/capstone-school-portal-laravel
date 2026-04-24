import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Search, Download, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react'

type Student = {
    id: number
    lrn: string
    name: string
    gender: string
    grade_level?: string
    section: string
    school_year: string
    has_psa_birth_certificate: boolean
    has_sf9: boolean
    has_report_card: boolean
    has_good_moral: boolean
}

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
        admin?: {
            role: string
            position: string
        }
    }
    allStudents: Student[]
    grade7Students: Student[]
    grade8Students: Student[]
    grade9Students: Student[]
    grade10Students: Student[]
    pastStudents: any[]
}

export default function StudentChecklist({ 
    auth,
    allStudents = [],
    grade7Students = [], 
    grade8Students = [], 
    grade9Students = [], 
    grade10Students = [],
    pastStudents = []
}: Props) {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const getDocumentStatus = (student: Student) => {
        const required = [
            student.has_psa_birth_certificate,
            student.has_sf9 || student.has_report_card,
        ]
        const completed = required.filter(Boolean).length
        const total = required.length
        return { completed, total, percentage: (completed / total) * 100 }
    }

    const filterStudents = (students: Student[]) => {
        if (!searchQuery) return students
        return students.filter(student => 
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.lrn.includes(searchQuery)
        )
    }

    const paginateStudents = (students: Student[]) => {
        const filtered = filterStudents(students)
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return {
            data: filtered.slice(startIndex, endIndex),
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / itemsPerPage),
            currentPage: currentPage
        }
    }

    // Reset to page 1 when search query or tab changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        setCurrentPage(1)
    }

    const renderStudentTable = (students: Student[], gradeLevel: string, showGradeColumn = false) => {
        const paginated = paginateStudents(students)
        const filteredStudents = paginated.data

        return (
            <div className="space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Students</p>
                                <p className="text-2xl font-bold text-blue-900">{students.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Complete Docs</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {students.filter(s => getDocumentStatus(s).percentage === 100).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Incomplete Docs</p>
                                <p className="text-2xl font-bold text-yellow-900">
                                    {students.filter(s => getDocumentStatus(s).percentage < 100 && getDocumentStatus(s).percentage > 0).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600">No Documents</p>
                                <p className="text-2xl font-bold text-red-900">
                                    {students.filter(s => getDocumentStatus(s).percentage === 0).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Student Info
                                    </th>
                                    {showGradeColumn && (
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Grade Level
                                        </th>
                                    )}
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Section
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        PSA Birth Cert
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        SF9/Report Card
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Good Moral
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={showGradeColumn ? 7 : 6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <p className="text-sm text-gray-600">No students found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => {
                                        const status = getDocumentStatus(student)
                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                                        <p className="text-xs text-gray-500">LRN: {student.lrn}</p>
                                                    </div>
                                                </td>
                                                {showGradeColumn && (
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-700">{student.grade_level || 'N/A'}</span>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-700">{student.section || 'Not Assigned'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {student.has_psa_birth_certificate ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {student.has_sf9 || student.has_report_card ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {student.has_good_moral ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                                    ) : (
                                                        <span className="text-xs text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            status.percentage === 100 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : status.percentage > 0 
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {status.completed}/{status.total}
                                                        </span>
                                                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                            <div 
                                                                className={`h-1.5 rounded-full ${
                                                                    status.percentage === 100 
                                                                        ? 'bg-green-600' 
                                                                        : status.percentage > 0 
                                                                            ? 'bg-yellow-600'
                                                                            : 'bg-red-600'
                                                                }`}
                                                                style={{ width: `${status.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {paginated.totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, paginated.total)}</span> of{' '}
                                    <span className="font-medium">{paginated.total}</span> results
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8"
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: paginated.totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                // Show first page, last page, current page, and pages around current
                                                return page === 1 || 
                                                       page === paginated.totalPages || 
                                                       Math.abs(page - currentPage) <= 1
                                            })
                                            .map((page, index, array) => (
                                                <div key={page} className="flex items-center">
                                                    {index > 0 && array[index - 1] !== page - 1 && (
                                                        <span className="px-2 text-gray-400">...</span>
                                                    )}
                                                    <Button
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                    >
                                                        {page}
                                                    </Button>
                                                </div>
                                            ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(paginated.totalPages, prev + 1))}
                                        disabled={currentPage === paginated.totalPages}
                                        className="h-8"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Student Checklist" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Student Document Checklist</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Track and manage student document submissions
                        </p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search by student name or LRN..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10 h-11"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-6 mb-6">
                        <TabsTrigger value="all">All Students</TabsTrigger>
                        <TabsTrigger value="grade7">Grade 7</TabsTrigger>
                        <TabsTrigger value="grade8">Grade 8</TabsTrigger>
                        <TabsTrigger value="grade9">Grade 9</TabsTrigger>
                        <TabsTrigger value="grade10">Grade 10</TabsTrigger>
                        <TabsTrigger value="past">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Past Students</span>
                            </div>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        {renderStudentTable(allStudents, 'All Students', true)}
                    </TabsContent>

                    <TabsContent value="grade7">
                        {renderStudentTable(grade7Students, 'Grade 7')}
                    </TabsContent>

                    <TabsContent value="grade8">
                        {renderStudentTable(grade8Students, 'Grade 8')}
                    </TabsContent>

                    <TabsContent value="grade9">
                        {renderStudentTable(grade9Students, 'Grade 9')}
                    </TabsContent>

                    <TabsContent value="grade10">
                        {renderStudentTable(grade10Students, 'Grade 10')}
                    </TabsContent>

                    <TabsContent value="past">
                        <div className="space-y-4">
                            {/* Past Students Header */}
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 rounded-lg p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-purple-900 mb-1">Past Students Archive</p>
                                        <p className="text-sm text-purple-800">
                                            Students who have graduated or transferred from the school. Records are maintained for historical purposes.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Past Students Timeline */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student History by School Year</h3>
                                
                                {pastStudents.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-600">No past student records available</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Group by school year and display */}
                                        {pastStudents.map((yearGroup, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-md font-semibold text-gray-900">{yearGroup.school_year}</h4>
                                                    <span className="text-sm text-gray-600">{yearGroup.count} students</span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2 text-sm">
                                                    <div className="bg-blue-50 rounded p-2 text-center">
                                                        <p className="text-xs text-blue-600 font-medium">Grade 7</p>
                                                        <p className="text-lg font-bold text-blue-900">{yearGroup.grade7 || 0}</p>
                                                    </div>
                                                    <div className="bg-green-50 rounded p-2 text-center">
                                                        <p className="text-xs text-green-600 font-medium">Grade 8</p>
                                                        <p className="text-lg font-bold text-green-900">{yearGroup.grade8 || 0}</p>
                                                    </div>
                                                    <div className="bg-yellow-50 rounded p-2 text-center">
                                                        <p className="text-xs text-yellow-600 font-medium">Grade 9</p>
                                                        <p className="text-lg font-bold text-yellow-900">{yearGroup.grade9 || 0}</p>
                                                    </div>
                                                    <div className="bg-purple-50 rounded p-2 text-center">
                                                        <p className="text-xs text-purple-600 font-medium">Grade 10</p>
                                                        <p className="text-lg font-bold text-purple-900">{yearGroup.grade10 || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    )
}
