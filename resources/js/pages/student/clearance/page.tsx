import { Head } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { CheckCircle2, Clock, ShieldCheck, ShieldAlert, BookOpen, User } from 'lucide-react'

type SubjectClearance = {
    subject_id: number
    subject_name: string
    subject_code: string | null
    teacher_name: string
    status: 'cleared' | 'pending' | 'not_cleared'
}

type ClearanceInfo = {
    schoolYear: string
    studentLRN: string
    studentName: string
    overallStatus: 'Cleared' | 'Pending'
    clearedSubjects: number
    totalSubjects: number
}

type Props = {
    clearanceInfo: ClearanceInfo
    subjectClearances: SubjectClearance[]
    auth?: {
        user: { id: number; name: string; email: string; role: string }
    }
}

export default function StudentClearance({ clearanceInfo, subjectClearances, auth }: Props) {
    const isFullyCleared = clearanceInfo.overallStatus === 'Cleared'
    const progressPct = clearanceInfo.totalSubjects > 0
        ? Math.round((clearanceInfo.clearedSubjects / clearanceInfo.totalSubjects) * 100)
        : 0

    const getStatusBadge = (status: SubjectClearance['status']) => {
        switch (status) {
            case 'cleared':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cleared
                    </span>
                )
            case 'not_cleared':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <Clock className="w-3.5 h-3.5" />
                        Not Cleared
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                    </span>
                )
        }
    }

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Student Clearance" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Clearance</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Check your clearance status for each subject this school year
                    </p>
                </div>

                {/* Overall Status Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">
                                School Year {clearanceInfo.schoolYear}
                            </h2>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isFullyCleared
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {isFullyCleared
                                    ? <><ShieldCheck className="w-3.5 h-3.5" /> Fully Cleared</>
                                    : <><ShieldAlert className="w-3.5 h-3.5" /> Clearance Pending</>
                                }
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Student info row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Student Name</p>
                                <p className="font-semibold text-gray-900 mt-0.5">{clearanceInfo.studentName}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">LRN</p>
                                <p className="font-semibold text-gray-900 mt-0.5">{clearanceInfo.studentLRN}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Subjects Cleared</p>
                                <p className="font-semibold text-gray-900 mt-0.5">
                                    {clearanceInfo.clearedSubjects} / {clearanceInfo.totalSubjects}
                                </p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Clearance Progress</span>
                                <span>{progressPct}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-500 ${progressPct === 100
                                        ? 'bg-green-500'
                                        : progressPct >= 50
                                            ? 'bg-orange-400'
                                            : 'bg-red-500'
                                        }`}
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>

                        {/* Status message */}
                        {isFullyCleared ? (
                            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                                You are fully cleared for this school year. Congratulations!
                            </p>
                        ) : (
                            <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                                Your clearance is still pending. Please coordinate with the teachers listed below to complete your clearance.
                            </p>
                        )}
                    </div>
                </div>

                {/* Per-subject clearance table */}
                {subjectClearances.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                            Teacher
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                            Clearance Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {subjectClearances.map((item, index) => (
                                        <tr
                                            key={item.subject_id}
                                            className={`transition-colors hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {item.subject_name}
                                                    </p>
                                                    {item.subject_code && (
                                                        <p className="text-xs text-gray-400 mt-0.5">{item.subject_code}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">{item.teacher_name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(item.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center">
                        <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-500">No subjects found</p>
                        <p className="text-xs text-gray-400 mt-1">You are not currently assigned to a section.</p>
                    </div>
                )}
            </div>
        </StudentLayout>
    )
}