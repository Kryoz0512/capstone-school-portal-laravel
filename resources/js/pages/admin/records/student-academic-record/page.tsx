import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
    ArrowLeft, Download, ShieldCheck, ShieldAlert, Check, X,
    CheckCircle2, Clock, BookOpen, GraduationCap, User, ClipboardList, Eye, EyeOff,
} from 'lucide-react'
import React, { useState, useMemo } from 'react'

type SubjectClearance = {
    subject_id: number
    subject_code: string | null
    subject_name: string
    teacher_name: string
    status: 'cleared' | 'pending' | 'not_cleared'
}

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
    clearance_total?: number
    clearance_cleared?: number
    all_cleared?: boolean
    subject_clearances?: SubjectClearance[]
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
            className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                met ? 'border-green-200 bg-green-50/80' : 'border-gray-200 bg-white'
            }`}
        >
            <div
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    met ? 'bg-green-600 shadow-sm shadow-green-600/30' : 'bg-gray-200'
                }`}
            >
                {met ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} /> : <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </div>
            <div>
                <p className={`text-sm font-semibold ${met ? 'text-green-900' : 'text-gray-800'}`}>{label}</p>
                <p className={`text-xs mt-0.5 ${met ? 'text-green-700' : 'text-gray-500'}`}>{detail}</p>
            </div>
        </div>
    )
}

function getClearanceStatusBadge(status: SubjectClearance['status']) {
    switch (status) {
        case 'cleared':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 ring-1 ring-green-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cleared
                </span>
            )
        case 'not_cleared':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 ring-1 ring-red-200">
                    <X className="w-3.5 h-3.5" />
                    Not Cleared
                </span>
            )
        default:
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                    <Clock className="w-3.5 h-3.5" />
                    Pending
                </span>
            )
    }
}

function getGradeCell(value: number | null) {
    if (value === null) return <span className="text-gray-300">—</span>
    const passed = value >= 75
    return (
        <span className={`font-medium ${passed ? 'text-gray-900' : 'text-red-600'}`}>
            {value}
        </span>
    )
}

export default function StudentAcademicRecord({ student, academic_record, grade_levels, auth }: Props) {
    const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>(
        academic_record.find(r => r.has_data)?.grade_level_id.toString() || grade_levels[0]?.id.toString() || ''
    )
    const [readyToGraduate, setReadyToGraduate] = useState(student.ready_to_graduate)
    const [showClearance, setShowClearance] = useState(false)

    const currentRecord = useMemo(() => {
        return academic_record.find(r => r.grade_level_id.toString() === selectedGradeLevel)
    }, [academic_record, selectedGradeLevel])

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
                s.quarter_1 !== null &&
                s.quarter_2 !== null &&
                s.quarter_3 !== null &&
                s.quarter_4 !== null &&
                s.final_grade !== null
        ).length
        return { completed, total }
    }, [currentGradeRecord])

    const requirementsMetCount = [areAllGradesComplete, hasPassed, isClearanceComplete].filter(Boolean).length

    const clearanceProgress = useMemo(() => {
        const cleared = currentRecord?.clearance_cleared ?? 0
        const total = currentRecord?.clearance_total ?? 0
        return { cleared, total, pct: total > 0 ? Math.round((cleared / total) * 100) : 0 }
    }, [currentRecord])

    const hasClearanceData = (currentRecord?.subject_clearances?.length ?? 0) > 0

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

    const getBlockReason = (record: GradeLevelRecord): string => {
        if (!record.all_grades_complete) {
            return 'Complete all quarterly and final grades for every subject to enable promotion.'
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

    const initials = student.name
        .split(' ')
        .slice(0, 2)
        .map(n => n.charAt(0).toUpperCase())
        .join('')

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title={`Academic Record - ${student.name}`} />

            <div className="space-y-6">
                {/* Top bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Link
                        href="/admin/records/final-reports"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Final Reports
                    </Link>
                    <Button className="bg-green-600 hover:bg-green-700 shadow-sm w-fit">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                    </Button>
                </div>

                {/* Student Profile Hero */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-green-600 via-green-700 to-green-800" />
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-green-600/25 shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold text-gray-900 truncate">{student.name}</h1>
                                <p className="text-sm text-gray-500 mt-0.5">Student Academic Record</p>
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                        <User className="w-3 h-3" />
                                        LRN {student.lrn}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        <GraduationCap className="w-3 h-3" />
                                        {student.current_grade_level}
                                    </span>
                                    {student.current_section && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            {student.current_section}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick stats row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/60 border border-blue-100 p-4">
                                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Final Average</p>
                                {currentRecord?.has_data && currentRecord.final_average != null ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold text-blue-900">{currentRecord.final_average}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            currentRecord.remarks === 'Passed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {currentRecord.remarks}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold text-blue-300 mt-1">—</p>
                                )}
                                <p className="text-xs text-blue-600/70 mt-1">{currentRecord?.grade_level ?? 'Select grade level'}</p>
                            </div>

                            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/60 border border-purple-100 p-4">
                                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Subject Clearance</p>
                                <p className="text-2xl font-bold text-purple-900 mt-1">
                                    {clearanceProgress.cleared}<span className="text-lg text-purple-400 font-normal">/{clearanceProgress.total}</span>
                                </p>
                                <div className="mt-2 h-1.5 bg-purple-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                        style={{ width: `${clearanceProgress.pct}%` }}
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-100 p-4">
                                <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Subjects Enrolled</p>
                                <p className="text-2xl font-bold text-amber-900 mt-1">
                                    {currentRecord?.subjects.length ?? 0}
                                </p>
                                <p className="text-xs text-amber-600/70 mt-1">
                                    {currentRecord?.all_grades_complete ? 'All grades complete' : 'Grades in progress'}
                                </p>
                            </div>
                        </div>

                        {/* Graduation requirements */}
                        {student.is_grade_10 && !canMarkGraduate && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <ClipboardList className="w-4 h-4 text-green-600" />
                                        Graduation Requirements
                                    </h3>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                                        {requirementsMetCount} / 3 met
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

                        {student.is_grade_10 && (
                            <div className="mt-4 flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                                <Checkbox
                                    id="ready-to-graduate"
                                    checked={readyToGraduate}
                                    onCheckedChange={(checked) => handleGraduationToggle(checked as boolean)}
                                    disabled={!canMarkGraduate}
                                    className="h-5 w-5"
                                />
                                <Label
                                    htmlFor="ready-to-graduate"
                                    className={`text-sm font-medium cursor-pointer ${!canMarkGraduate ? 'text-gray-400' : 'text-gray-900'}`}
                                >
                                    Mark as Ready to Graduate (SHS)
                                    <span className="block text-xs font-normal text-gray-500 mt-0.5">
                                        {readyToGraduate ? 'Student is marked ready for graduation' : 'Requires complete grades, passing average, and full clearance'}
                                    </span>
                                </Label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grade Level Selector */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-900 mb-1">Grade Level</label>
                            <p className="text-xs text-gray-500 mb-3">Select a grade level to view grades and clearances</p>
                            <Select value={selectedGradeLevel} onValueChange={setSelectedGradeLevel}>
                                <SelectTrigger className="w-full sm:max-w-xs h-11">
                                    <SelectValue placeholder="Select grade level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {grade_levels.map((level) => {
                                        const record = academic_record.find(r => r.grade_level_id === level.id)
                                        return (
                                            <SelectItem key={level.id} value={level.id.toString()}>
                                                {level.name}
                                                {!record?.has_data && ' (No data)'}
                                                {record?.is_completed && ' ✓'}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        {currentRecord?.has_data && (
                            <div className="flex flex-wrap gap-2">
                                {currentRecord.is_current_level && (
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                                        Current Level
                                    </span>
                                )}
                                {currentRecord.is_completed && (
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                                        Completed
                                    </span>
                                )}
                                {currentRecord.all_cleared ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Fully Cleared
                                    </span>
                                ) : currentRecord.has_data && (currentRecord.clearance_total ?? 0) > 0 && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700">
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        Clearance Pending
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {currentRecord ? (
                    <>
                        {/* Academic Grades Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-green-700 to-green-800">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-green-200" />
                                    <div>
                                        <h2 className="text-base font-semibold text-white">{currentRecord.grade_level} — Academic Grades</h2>
                                        <p className="text-xs text-green-200/80 mt-0.5">Quarterly and final grades per subject</p>
                                    </div>
                                </div>
                                {currentRecord.has_data && hasClearanceData && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowClearance(prev => !prev)}
                                        className="h-9 gap-1.5 bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white w-fit"
                                    >
                                        {showClearance ? (
                                            <>
                                                <EyeOff className="w-3.5 h-3.5" />
                                                Hide Clearance
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-3.5 h-3.5" />
                                                View Clearance
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {!currentRecord.has_data ? (
                                <div className="p-14 text-center">
                                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <BookOpen className="w-7 h-7 text-gray-400" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-1">No Data Available</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                        This student is not enrolled in {currentRecord.grade_level} yet or no subjects are listed.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
                                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Q1</th>
                                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Q2</th>
                                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Q3</th>
                                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Q4</th>
                                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Final</th>
                                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {currentRecord.subjects.map((subject, index) => {
                                                const clearance = currentRecord.subject_clearances?.find(
                                                    c => c.subject_code === subject.subject_code && c.subject_name === subject.subject_name
                                                )
                                                return (
                                                    <React.Fragment key={index}>
                                                        <tr
                                                            className={`transition-colors hover:bg-green-50/30 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}
                                                        >
                                                            <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{subject.subject_code ?? '—'}</td>
                                                            <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{subject.subject_name}</td>
                                                            <td className="px-5 py-3.5 text-sm text-gray-600">{subject.teacher_name}</td>
                                                            <td className="px-5 py-3.5 text-sm text-center">{getGradeCell(subject.quarter_1)}</td>
                                                            <td className="px-5 py-3.5 text-sm text-center">{getGradeCell(subject.quarter_2)}</td>
                                                            <td className="px-5 py-3.5 text-sm text-center">{getGradeCell(subject.quarter_3)}</td>
                                                            <td className="px-5 py-3.5 text-sm text-center">{getGradeCell(subject.quarter_4)}</td>
                                                            <td className="px-5 py-3.5 text-sm text-center font-bold">{getGradeCell(subject.final_grade)}</td>
                                                            <td className="px-5 py-3.5 text-center">
                                                                {subject.remarks ? (
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                                        subject.remarks === 'Passed'
                                                                            ? 'bg-green-100 text-green-700'
                                                                            : 'bg-red-100 text-red-700'
                                                                    }`}>
                                                                        {subject.remarks}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-300">—</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        {showClearance && clearance && (
                                                            <tr className="bg-purple-50/50 border-b border-purple-100">
                                                                <td colSpan={9} className="px-5 py-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
                                                                        <span className="text-xs font-medium text-purple-700">
                                                                            Clearance — {clearance.teacher_name}
                                                                        </span>
                                                                        {getClearanceStatusBadge(clearance.status)}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Promotion footer */}
                        {currentRecord.has_data && currentRecord.is_promotable_level && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 space-y-4">
                                    {currentRecord.is_completed ? (
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-green-900">Grade Level Completed</p>
                                                <p className="text-xs text-green-700 mt-0.5">
                                                    Student has been promoted to {currentRecord.next_grade_level}.
                                                </p>
                                            </div>
                                        </div>
                                    ) : currentRecord.can_promote ? (
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50 border border-green-200">
                                            <Checkbox
                                                id="promote-grade-level"
                                                checked={false}
                                                onCheckedChange={(checked) => {
                                                    if (checked) handlePromote()
                                                }}
                                                className="h-5 w-5 mt-0.5 cursor-pointer"
                                            />
                                            <div>
                                                <Label htmlFor="promote-grade-level" className="text-sm font-semibold text-green-900 cursor-pointer">
                                                    Promote to {currentRecord.next_grade_level}
                                                </Label>
                                                <p className="text-xs text-green-700 mt-1 leading-relaxed">
                                                    All grades are complete, the student passed, and all teacher clearances are confirmed.
                                                    Checking this will advance the student to {currentRecord.next_grade_level} and clear their section assignment.
                                                </p>
                                            </div>
                                        </div>
                                    ) : currentRecord.is_current_level ? (
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                                            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-amber-900">Promotion Not Available</p>
                                                <p className="text-xs text-amber-700 mt-0.5">{getBlockReason(currentRecord)}</p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                        <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Please select a grade level to view the academic record.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}