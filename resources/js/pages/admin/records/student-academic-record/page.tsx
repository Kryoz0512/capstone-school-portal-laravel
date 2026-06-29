import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download, ShieldCheck, ShieldAlert, Check, X } from 'lucide-react'
import { useState, useMemo } from 'react'

type SubjectGrade = {
    subject_code: string | null
    subject_name: string
    teacher_name: string
    term_1: number | null
    term_2: number | null
    term_3: number | null
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
    clearance_total?: number
    clearance_cleared?: number
    all_cleared?: boolean
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

function RequirementCard({ met, label, detail }: { met: boolean; label: string; detail: string }) {
    return (
        <div
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
                met ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}
        >
            <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    met ? 'bg-green-600' : 'bg-gray-300'
                }`}
            >
                {met ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : <X className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <div>
                <p className={`text-sm font-medium ${met ? 'text-green-900' : 'text-gray-700'}`}>{label}</p>
                <p className={`text-xs mt-0.5 ${met ? 'text-green-700' : 'text-gray-500'}`}>{detail}</p>
            </div>
        </div>
    )
}

export default function StudentAcademicRecord({ student, academic_record, grade_levels, auth }: Props) {
    const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>(
        academic_record.find(r => r.has_data)?.grade_level_id.toString() || grade_levels[0]?.id.toString() || ''
    )
    const [readyToGraduate, setReadyToGraduate] = useState(student.ready_to_graduate)

    const currentRecord = useMemo(() => {
        return academic_record.find(r => r.grade_level_id.toString() === selectedGradeLevel)
    }, [academic_record, selectedGradeLevel])

    // Full record for the student's current grade level (used for the graduation gate)
    const currentGradeRecord = useMemo(() => {
        return academic_record.find(r => r.grade_level === student.current_grade_level)
    }, [academic_record, student.current_grade_level])

    const currentGradeRemarks = currentGradeRecord?.remarks ?? null
    const isClearanceComplete = currentGradeRecord?.all_cleared ?? false
    const areAllGradesComplete = currentGradeRecord?.all_grades_complete ?? false
    const hasPassed = currentGradeRemarks === 'Passed'
    const canMarkGraduate = areAllGradesComplete && hasPassed && isClearanceComplete

    const gradesCompletionStats = useMemo(() => {
        const subjects = currentGradeRecord?.subjects ?? []
        const total = subjects.length
        const completed = subjects.filter(
            s =>
                s.term_1 !== null &&
                s.term_2 !== null &&
                s.term_3 !== null &&
                s.final_grade !== null
        ).length
        return { completed, total }
    }, [currentGradeRecord])

    const requirementsMetCount = [areAllGradesComplete, hasPassed, isClearanceComplete].filter(Boolean).length

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

    // Derive a human-readable reason why promotion is blocked
    const getBlockReason = (record: GradeLevelRecord): string => {
        if (!record.all_grades_complete) {
            return 'Complete all term and final grades for every subject to enable promotion.'
        }
        if (record.remarks === 'Failed') {
            return 'Student must pass this grade level before promotion.'
        }
        if (!record.all_cleared) {
            const cleared = record.clearance_cleared ?? 0
            const total = record.clearance_total ?? 0
            return `Student clearance is incomplete — ${cleared} of ${total} subject${total !== 1 ? 's' : ''} cleared by teachers. All subjects must be cleared before promotion.`
        }
        return 'Promotion is not available for this grade level.'
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title={`Academic Record - ${student.name}`} />

            <div className="space-y-6">
                {/* Back + Download */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/records/final-reports"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Final Reports
                    </Link>
                    <Button className="bg-green-600 hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                    </Button>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Academic Record</h1>
                    <p className="text-sm text-gray-500 mt-1">Complete academic history across all grade levels</p>
                </div>

                {/* Student Info */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-green-700">
                        <h2 className="text-lg font-semibold text-white">Student Information</h2>
                    </div>
                    <div className="p-6">
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${student.is_grade_10 ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
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
                            {/* Final Average — derived from the currently selected grade level record */}
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Final Average</p>
                                {currentRecord?.has_data && currentRecord?.final_average ? (
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-900">{currentRecord.final_average}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            currentRecord.remarks === 'Passed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {currentRecord.remarks}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="font-semibold text-gray-400">—</p>
                                )}
                            </div>
                            {student.is_grade_10 && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Ready to Graduate (SHS)</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Checkbox
                                            id="ready-to-graduate"
                                            checked={readyToGraduate}
                                            onCheckedChange={(checked) => handleGraduationToggle(checked as boolean)}
                                            disabled={!canMarkGraduate}
                                            className="h-5 w-5"
                                        />
                                        <Label
                                            htmlFor="ready-to-graduate"
                                            className={`text-sm font-medium cursor-pointer ${
                                                !canMarkGraduate ? 'text-gray-400' : 'text-gray-900'
                                            }`}
                                        >
                                            {readyToGraduate ? 'Completed' : 'Not ready to graduate'}
                                        </Label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Graduation requirements — full width so cards have room to breathe */}
                        {student.is_grade_10 && !canMarkGraduate && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900">Graduation Requirements</h3>
                                    <span className="text-xs font-medium text-gray-400">
                                        {requirementsMetCount} of 3 requirements met
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <RequirementCard
                                        met={areAllGradesComplete}
                                        label="Grades Recorded"
                                        detail={`${gradesCompletionStats.completed} of ${gradesCompletionStats.total} subjects complete`}
                                    />
                                    <RequirementCard
                                        met={hasPassed}
                                        label="Passing Average"
                                        detail={
                                            currentGradeRecord?.final_average != null
                                                ? `Final average: ${currentGradeRecord.final_average}`
                                                : 'No final average yet'
                                        }
                                    />
                                    <RequirementCard
                                        met={isClearanceComplete}
                                        label="Subject Clearance"
                                        detail={`${currentGradeRecord?.clearance_cleared ?? 0} of ${currentGradeRecord?.clearance_total ?? 0} subjects cleared`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grade Level Selector */}
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

                {/* Grade Record */}
                {currentRecord ? (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        {/* Record Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-green-700">
                            <h2 className="text-lg font-semibold text-white">{currentRecord.grade_level}</h2>
                        </div>

                        {/* No data state */}
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
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">T1</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">T2</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">T3</th>
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
                                                <td className="px-6 py-4 text-sm text-center text-gray-900">{subject.term_1 ?? '-'}</td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-900">{subject.term_2 ?? '-'}</td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-900">{subject.term_3 ?? '-'}</td>
                                                <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">{subject.final_grade ?? '-'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {subject.remarks ? (
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${subject.remarks === 'Passed'
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

                        {/* Promotion footer — only for promotable levels with data */}
                        {currentRecord.has_data && currentRecord.is_promotable_level && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-3">

                                {/* Clearance status pill — always visible for current level */}
                                {currentRecord.is_current_level && (
                                    <div className="flex items-center gap-2">
                                        {currentRecord.all_cleared ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                All subjects cleared by teachers ({currentRecord.clearance_cleared}/{currentRecord.clearance_total})
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                Clearance pending — {currentRecord.clearance_cleared ?? 0} of {currentRecord.clearance_total ?? 0} subjects cleared
                                            </span>
                                        )}
                                    </div>
                                )}

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
                                            className="h-5 w-5 mt-0.5 cursor-pointer"
                                        />
                                        <div>
                                            <Label
                                                htmlFor="promote-grade-level"
                                                className="text-sm font-medium text-gray-900 cursor-pointer"
                                            >
                                                Promote to {currentRecord.next_grade_level}
                                            </Label>
                                            <p className="text-xs text-gray-500 mt-1">
                                                All subjects have complete grades, the student passed, and all teacher clearances are confirmed. Checking this will move the student to {currentRecord.next_grade_level} and clear their section (re-assign in Enrollment).
                                            </p>
                                        </div>
                                    </div>
                                ) : currentRecord.is_current_level ? (
                                    <p className="text-sm text-gray-600">
                                        {getBlockReason(currentRecord)}
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