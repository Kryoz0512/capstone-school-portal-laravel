import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { Search, Download, CheckCircle2, XCircle, Clock, Users } from 'lucide-react'

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

type DocumentFilter = 'all' | 'psa' | 'sf9' | 'report_card' | 'good_moral'
type SortOrder = 'asc' | 'desc'

export default function StudentChecklist({
    auth,
    allStudents = [],
}: Props) {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
    const [gradeLevelFilter, setGradeLevelFilter] = useState('all')
    const [sectionFilter, setSectionFilter] = useState('all')
    const [documentFilter, setDocumentFilter] = useState<DocumentFilter>('all')
    const itemsPerPage = 10

    const getDocumentStatus = (student: Student) => {
        const documents = [
            student.has_psa_birth_certificate,
            student.has_sf9,
            student.has_report_card,
            student.has_good_moral,
        ]
        const submitted = documents.filter(Boolean).length
        const total = documents.length

        return {
            completed: submitted,
            total,
            percentage: (submitted / total) * 100,
        }
    }

    const matchesDocumentFilter = (student: Student, filter: DocumentFilter) => {
        switch (filter) {
            case 'psa': return student.has_psa_birth_certificate
            case 'sf9': return student.has_sf9
            case 'report_card': return student.has_report_card
            case 'good_moral': return student.has_good_moral
            default: return true
        }
    }

    const uniqueGradeLevels = Array.from(
        new Set(allStudents.map(s => s.grade_level).filter(Boolean))
    ).sort()

    const uniqueSections = Array.from(
        new Set(allStudents.map(s => s.section).filter(Boolean))
    ).sort()

    const filterStudents = (students: Student[]) => {
        let filtered = students

        if (searchQuery) {
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.lrn.includes(searchQuery)
            )
        }

        if (gradeLevelFilter !== 'all') {
            filtered = filtered.filter(student => student.grade_level === gradeLevelFilter)
        }

        if (sectionFilter !== 'all') {
            filtered = filtered.filter(student => student.section === sectionFilter)
        }

        filtered = filtered.filter(student => matchesDocumentFilter(student, documentFilter))

        filtered = [...filtered].sort((a, b) => {
            const comparison = a.name.localeCompare(b.name)
            return sortOrder === 'asc' ? comparison : -comparison
        })

        return filtered
    }

    const filteredStudents = filterStudents(allStudents)
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage)

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Students</p>
                                <p className="text-2xl font-bold text-blue-900">{allStudents.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Complete Docs</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {allStudents.filter(s => getDocumentStatus(s).percentage === 100).length}
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
                                    {allStudents.filter(s => getDocumentStatus(s).percentage < 100).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search by name or LRN..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 h-11"
                            />
                        </div>

                        <Select value={gradeLevelFilter} onValueChange={(v) => { setGradeLevelFilter(v); setCurrentPage(1) }}>
                            <SelectTrigger className="h-11 w-full md:w-44">
                                <SelectValue placeholder="All Grades" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Grades</SelectItem>
                                {uniqueGradeLevels.map(grade => (
                                    <SelectItem key={grade} value={grade as string}>{grade}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v as SortOrder); setCurrentPage(1) }}>
                            <SelectTrigger className="h-11 w-full md:w-44">
                                <SelectValue placeholder="Sort by name" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Name (A → Z)</SelectItem>
                                <SelectItem value="desc">Name (Z → A)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sectionFilter} onValueChange={(v) => { setSectionFilter(v); setCurrentPage(1) }}>
                            <SelectTrigger className="h-11 w-full md:w-44">
                                <SelectValue placeholder="All Sections" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sections</SelectItem>
                                {uniqueSections.map(section => (
                                    <SelectItem key={section} value={section}>{section}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={documentFilter} onValueChange={(v) => { setDocumentFilter(v as DocumentFilter); setCurrentPage(1) }}>
                            <SelectTrigger className="h-11 w-full md:w-56">
                                <SelectValue placeholder="All Documents" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Documents</SelectItem>
                                <SelectItem value="psa">PSA Birth Certificate</SelectItem>
                                <SelectItem value="sf9">Form 137 (SF9)</SelectItem>
                                <SelectItem value="report_card">Form 138 (Report Card)</SelectItem>
                                <SelectItem value="good_moral">Good Moral Certificate</SelectItem>
                            </SelectContent>
                        </Select>
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Grade Level
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Section
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        PSA Birth Cert
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Form 137 (SF9)
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Form 138 (Report Card)
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Good Moral
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {paginatedStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <p className="text-sm text-gray-600">No students found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                                    <p className="text-xs text-gray-500">LRN: {student.lrn}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">{student.grade_level || 'N/A'}</span>
                                            </td>
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
                                                {student.has_sf9 ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {student.has_report_card ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {student.has_good_moral ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of{' '}
                                    <span className="font-medium">{filteredStudents.length}</span> results
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
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                return page === 1 ||
                                                       page === totalPages ||
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
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
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
        </AdminLayout>
    )
}