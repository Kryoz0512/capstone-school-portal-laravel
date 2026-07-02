import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { Search, Download, CheckCircle2, XCircle, Clock, Users } from 'lucide-react'

type Student = {
    id: number
    lrn: string
    name: string
    gender: string
    grade_level?: string
    section: string | null
    school_year: string
    has_psa_birth_certificate: boolean
    has_sf9: boolean
    has_report_card: boolean
    has_good_moral: boolean
}

type PaginationLink = {
    url: string | null
    label: string
    active: boolean
}

type PaginatedStudents = {
    data: Student[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
    links: PaginationLink[]
}

type Stats = {
    total: number
    complete: number
    incomplete: number
}

type DocumentFilter = 'all' | 'psa' | 'sf9' | 'report_card' | 'good_moral'
type SortOrder = 'asc' | 'desc'

type Filters = {
    search: string
    grade_level: string
    section: string
    document: DocumentFilter
    sort: SortOrder
    per_page: number
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
    allStudents: PaginatedStudents
    stats: Stats
    gradeLevelOptions: string[]
    sectionOptions: string[]
    pastStudents: any[]
    filters: Filters
}

export default function StudentChecklist({
    auth,
    allStudents,
    stats,
    gradeLevelOptions = [],
    sectionOptions = [],
    filters,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '')

    // Push a filter change to the backend, always resetting to page 1
    const updateFilters = (next: Partial<Filters>) => {
        router.get(
            window.location.pathname,
            {
                search: next.search ?? filters.search,
                grade_level: next.grade_level ?? filters.grade_level,
                section: next.section ?? filters.section,
                document: next.document ?? filters.document,
                sort: next.sort ?? filters.sort,
                per_page: next.per_page ?? filters.per_page,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        )
    }

    // Debounce the search box so we're not firing a request on every keystroke
    useEffect(() => {
        if (searchQuery === filters.search) return

        const timeout = setTimeout(() => {
            updateFilters({ search: searchQuery })
        }, 400)

        return () => clearTimeout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery])

    const goToPage = (url: string | null) => {
        if (!url) return
        router.get(url, {}, { preserveState: true, preserveScroll: true, replace: true })
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
                                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
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
                                <p className="text-2xl font-bold text-green-900">{stats.complete}</p>
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
                                <p className="text-2xl font-bold text-yellow-900">{stats.incomplete}</p>
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
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11"
                            />
                        </div>

                        <Select value={filters.grade_level} onValueChange={(v) => updateFilters({ grade_level: v })}>
                            <SelectTrigger className="h-11 w-full md:w-44">
                                <SelectValue placeholder="All Grades" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Grades</SelectItem>
                                {gradeLevelOptions.map(grade => (
                                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.sort} onValueChange={(v) => updateFilters({ sort: v as SortOrder })}>
                            <SelectTrigger className="h-11 w-full md:w-44">
                                <SelectValue placeholder="Sort by name" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Name (A → Z)</SelectItem>
                                <SelectItem value="desc">Name (Z → A)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.section} onValueChange={(v) => updateFilters({ section: v })}>
                            <SelectTrigger className="h-11 w-full md:w-44">
                                <SelectValue placeholder="All Sections" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sections</SelectItem>
                                {sectionOptions.map(section => (
                                    <SelectItem key={section} value={section}>{section}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.document} onValueChange={(v) => updateFilters({ document: v as DocumentFilter })}>
                            <SelectTrigger className="h-11 w-full md:w-56">
                                <SelectValue placeholder="All Documents" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Documents</SelectItem>
                                <SelectItem value="psa">PSA Birth Certificate</SelectItem>
                                <SelectItem value="sf9">Form 137 (SF10)</SelectItem>
                                <SelectItem value="report_card">Form 138 (SF9)</SelectItem>
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
                                        Form 137 (SF10)
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Form 138 (SF9)
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Good Moral
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {allStudents.data.length === 0 ? (
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
                                    allStudents.data.map((student) => (
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
                    {allStudents.total > 0 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700 whitespace-nowrap">Entries:</span>
                                        <Select
                                            value={String(filters.per_page)}
                                            onValueChange={(v) => updateFilters({ per_page: Number(v) })}
                                        >
                                            <SelectTrigger className="h-8 w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="25">25</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {/* <span className="text-sm text-gray-700 whitespace-nowrap">entries</span> */}
                                    </div>

                                    {/* <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{allStudents.from ?? 0}</span> to{' '}
                                        <span className="font-medium">{allStudents.to ?? 0}</span> of{' '}
                                        <span className="font-medium">{allStudents.total}</span> results
                                    </div> */}
                                </div>

                                {allStudents.last_page > 1 && (
                                    <div className="flex items-center gap-2">
                                        {allStudents.links.map((link, index) => {
                                            const isPrev = link.label.includes('Previous')
                                            const isNext = link.label.includes('Next')
                                            const label = link.label.replace('&laquo;', '«').replace('&raquo;', '»')

                                            if (isPrev || isNext) {
                                                return (
                                                    <Button
                                                        key={index}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => goToPage(link.url)}
                                                        disabled={!link.url}
                                                        className="h-8"
                                                    >
                                                        {isPrev ? 'Previous' : 'Next'}
                                                    </Button>
                                                )
                                            }

                                            if (label === '...') {
                                                return (
                                                    <span key={index} className="px-2 text-gray-400">...</span>
                                                )
                                            }

                                            return (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => goToPage(link.url)}
                                                    disabled={!link.url}
                                                    className={`h-8 w-8 p-0 ${link.active ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                >
                                                    {label}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}