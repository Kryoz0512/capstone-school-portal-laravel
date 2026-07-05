import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/pagination'
import { useState, useEffect, useRef } from 'react'
import { Users } from 'lucide-react'

type Section = {
    id: number
    section_name: string
    gradeLevel: string
    grade_level_id: number
    adviser: string
    student_count: number
}

type GradeLevel = {
    id: number
    name: string
}

type PaginationLink = {
    url: string | null
    label: string
    active: boolean
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
    sections: {
        data: Section[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: PaginationLink[]
    }
    gradeLevels: GradeLevel[]
    filters?: {
        search?: string
        grade_level?: number
    }
}

export default function StudentSchedule({ auth, sections, gradeLevels, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '')
    const [gradeLevel, setGradeLevel] = useState(filters?.grade_level?.toString() || '')
    const [perPage, setPerPage] = useState(sections.per_page || 10)

    const isFirstRender = useRef(true)

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        const timer = setTimeout(() => {
            router.get('/admin/enrollment/student-schedule', 
                { 
                    search: searchTerm, 
                    grade_level: gradeLevel || undefined,
                    per_page: perPage 
                },
                { preserveState: true, preserveScroll: true, replace: true }
            )
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm, gradeLevel, perPage])

    const handleSectionClick = (sectionId: number) => {
        router.visit(`/admin/enrollment/student-schedule/${sectionId}`)
    }

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.visit(url, { preserveScroll: true, preserveState: true })
        }
    }

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage)
    }

    const handleClearFilters = () => {
        setSearchTerm('')
        setGradeLevel('')
    }

    const hasActiveFilters = searchTerm || gradeLevel

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Section Schedules" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Section Schedules</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View schedules by section
                    </p>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Search & Filter</h2>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Section Name or Adviser
                            </label>
                            <Input
                                type="text"
                                placeholder="Search section or adviser..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="w-full sm:w-56">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grade Level
                            </label>
                            <select
                                value={gradeLevel}
                                onChange={(e) => setGradeLevel(e.target.value)}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="">All Grade Levels</option>
                                {gradeLevels.map((level) => (
                                    <option key={level.id} value={level.id.toString()}>
                                        {level.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <div className="shrink-0">
                                <button
                                    onClick={handleClearFilters}
                                    className="h-10 px-4 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Section Name</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Adviser</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Students</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sections.data.length > 0 ? (
                                    sections.data.map((section) => (
                                        <tr 
                                            key={section.id} 
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => handleSectionClick(section.id)}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-900">{section.gradeLevel}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{section.section_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {section.adviser === 'Not Assigned' ? (
                                                    <span className="text-gray-400 italic">{section.adviser}</span>
                                                ) : (
                                                    section.adviser
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span>{section.student_count}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {searchTerm || gradeLevel
                                                ? 'No sections match your search.'
                                                : 'No sections found.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {sections.data.length > 0 && (
                        <Pagination
                            currentPage={sections.current_page}
                            lastPage={sections.last_page}
                            perPage={sections.per_page}
                            total={sections.total}
                            links={sections.links}
                            onPageChange={handlePageChange}
                            onPerPageChange={handlePerPageChange}
                        />
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
