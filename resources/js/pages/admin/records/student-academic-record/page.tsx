import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download } from 'lucide-react'
import { useState, useMemo } from 'react'

type SubjectGrade = {
    subject_code: string | null
    subject_name: string
    teacher_name: string
    quarter_1: number | null
    quarter_2: number | null
    quarter_3: number | null
    quarter_4: number | null
    final_grade: number | null
    remarks: string | null
}

type GradeLevelRecord = {
    grade_level: string
    grade_level_id: number
    has_data: boolean
    subjects: SubjectGrade[]
    final_average: number | null
    remarks: string | null
    is_current_level?: boolean
    is_completed?: boolean
    all_grades_complete?: boolean
    is_promotable_level?: boolean
    can_promote?: boolean
    next_grade_level?: string | null
}

type GradeLevel = {
    id: number
    name: string
}

type Props = {
    student: {
        id: number
        name: string
        lrn: string
        current_grade_level: string
        current_grade_level_id: number
        current_section: string
        ready_to_graduate: boolean
        is_grade_10: boolean
    }
    academic_record: GradeLevelRecord[]
    grade_levels: GradeLevel[]
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
}

export default function StudentAcademicRecord({ student, academic_record, grade_levels, auth }: Props) {
    const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>(
        academic_record.find(r => r.has_data)?.grade_level_id.toString() || grade_levels[0]?.id.toString() || ''
    )
    const [readyToGraduate, setReadyToGraduate] = useState(student.ready_to_graduate)

    const currentRecord = useMemo(() => {
        return academic_record.find(r => r.grade_level_id.toString() === selectedGradeLevel)
    }, [academic_record, selectedGradeLevel])

    const currentGradeRemarks = useMemo(() => {
        const record = academic_record.find(r => r.grade_level === student.current_grade_level)
        return record?.remarks ?? null
    }, [academic_record, student.current_grade_level])

    const handleGraduationToggle = (checked: boolean) => {
        setReadyToGraduate(checked)

        router.put(`/admin/students/${student.id}/graduation-readiness`, {
            ready_to_graduate: checked,
        }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handlePromote = () => {
        router.post(`/admin/records/student-academic-record/${student.id}/promote`, {}, {
            preserveScroll: true,
        })
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title={`Academic Record - ${student.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/records/final-reports"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Final Reports
                        </Link>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                    </Button>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Academic Record</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Complete academic history across all grade levels
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-green-700">
                        <h2 className="text-lg font-semibold text-white">Student Information</h2>
                    </div>
                    <div className="p-6">
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${student.is_grade_10 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Student Name</p>
                                <p className="font-semibold text-gray-900">{student.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">LRN</p>
                                <p className="font-semibold text-gray-900">{student.lrn}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Current Grade Level</p>
                                <p className="font-semibold text-gray-900">{student.current_grade_level}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Current Section</p>
                                <p className="font-semibold text-gray-900">{student.current_section || 'Not assigned'}</p>
                            </div>
                            {student.is_grade_10 && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Ready to Graduate (SHS)</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Checkbox
                                            id="ready-to-graduate"
                                            checked={readyToGraduate}
                                            onCheckedChange={(checked) => handleGraduationToggle(checked as boolean)}
                                            disabled={currentGradeRemarks !== 'Passed'}
                                            className="h-5 w-5"
                                        />
                                        <Label
                                            htmlFor="ready-to-graduate"
                                            className={`text-sm font-medium cursor-pointer ${
                                                currentGradeRemarks !== 'Passed' ? 'text-gray-400' : 'text-gray-900'
                                            }`}
                                        >
                                            {readyToGraduate ? 'Marked as ready' : 'Not ready'}
                                        </Label>
                                    </div>
                                    {currentGradeRemarks !== 'Passed' && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Student must pass Grade 10 before graduating from high school.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-base font-semibold text-gray-900">Select Grade Level</h2>
                        <p className="text-sm text-gray-500 mt-1">Choose a grade level to view enrolled subjects and grades</p>
                    </div>
                    <div className="p-6">
                        <div className="max-w-md">
                            <Select value={selectedGradeLevel} onValueChange={setSelectedGradeLevel}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select grade level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {grade_levels.map((level) => {
                                        const hasData = academic_record.find(r => r.grade_level_id === level.id)?.has_data
                                        return (
                                            <SelectItem key={level.id} value={level.id.toString()}>
                                                {level.name} {!hasData && '(No data)'}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {currentRecord ? (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-green-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">{currentRecord.grade_level}</h2>
                            {currentRecord.has_data && currentRecord.final_average && (
                                <div className="flex items-center gap-4">
                                    <span className="text-white text-sm">
                                        Final Average: <span className="font-bold text-lg">{currentRecord.final_average}</span>
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        currentRecord.remarks === 'Passed'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {currentRecord.remarks}
                                    </span>
                                </div>
                            )}
                        </div>

                        {!currentRecord.has_data ? (
                            <div className="p-12 text-center">
                                <div className="max-w-md mx-auto">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                                    <p className="text-sm text-gray-500">
                                        This student is not enrolled in {currentRecord.grade_level} yet or no subjects are listed for this level.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subject</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teacher</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Q1</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Q2</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Q3</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Q4</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Final Grade</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {currentRecord.subjects.map((subject, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-600">{subject.subject_code ?? '-'}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{subject.subject_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{subject.teacher_name}</td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-900">{subject.quarter_1 ?? '-'}</td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-900">{subject.quarter_2 ?? '-'}</td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-900">{subject.quarter_3 ?? '-'}</td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-900">{subject.quarter_4 ?? '-'}</td>
                                                <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">{subject.final_grade ?? '-'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {subject.remarks ? (
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                            subject.remarks === 'Passed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {subject.remarks}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {currentRecord.has_data && currentRecord.is_promotable_level && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                {currentRecord.is_completed ? (
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Completed — Promoted to {currentRecord.next_grade_level}
                                        </span>
                                    </div>
                                ) : currentRecord.can_promote ? (
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="promote-grade-level"
                                            checked={false}
                                            onCheckedChange={(checked) => {
                                                if (checked) handlePromote()
                                            }}
                                            className="h-5 w-5 mt-0.5"
                                        />
                                        <div>
                                            <Label
                                                htmlFor="promote-grade-level"
                                                className="text-sm font-medium text-gray-900 cursor-pointer"
                                            >
                                                Promote to {currentRecord.next_grade_level}
                                            </Label>
                                            <p className="text-xs text-gray-500 mt-1">
                                                All subjects have complete grades and the student passed. Checking this will move the student to {currentRecord.next_grade_level} and clear their section (re-assign in Enrollment).
                                            </p>
                                        </div>
                                    </div>
                                ) : currentRecord.is_current_level ? (
                                    <p className="text-sm text-gray-600">
                                        {!currentRecord.all_grades_complete
                                            ? 'Complete all quarterly and final grades for every subject to enable promotion.'
                                            : currentRecord.remarks === 'Failed'
                                                ? 'Student must pass this grade level before promotion.'
                                                : 'Promotion is not available for this grade level.'}
                                    </p>
                                ) : null}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">Please select a grade level to view grades.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
