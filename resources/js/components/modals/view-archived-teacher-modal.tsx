import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { User, Briefcase, BookOpen, GraduationCap, Mail, Hash } from 'lucide-react'

type Section = {
    name: string
    grade_level: string
    school_year: string
}

type ArchivedTeacher = {
    id: number
    name: string
    email: string
    employee_no: string
    position: string
    subject: string
    sections: Section[]
    subjects: string[]
    archived_by: string
    archived_at: string
    reason: string | null
}

type ViewArchivedTeacherModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    teacher: ArchivedTeacher | null
}

export default function ViewArchivedTeacherModal({ open, onOpenChange, teacher }: ViewArchivedTeacherModalProps) {
    if (!teacher) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle>Archived Teacher Details</DialogTitle>
                            <DialogDescription>
                                View information about this archived teacher
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                
                <div className="space-y-6 mt-4">
                    {/* Basic Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                        <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-blue-700 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    Full Name
                                </label>
                                <p className="text-sm font-semibold text-blue-900">{teacher.name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-blue-700 flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    Employee Number
                                </label>
                                <p className="text-sm font-semibold text-blue-900">{teacher.employee_no}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-blue-700 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    Email Address
                                </label>
                                <p className="text-sm text-blue-900">{teacher.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-blue-700 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    Position
                                </label>
                                <p className="text-sm text-blue-900">{teacher.position}</p>
                            </div>
                        </div>
                    </div>

                    {/* Primary Subject */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                        <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Primary Subject
                        </h3>
                        <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1">
                            {teacher.subject}
                        </Badge>
                    </div>

                    {/* All Subject Assignments */}
                    {teacher.subjects && teacher.subjects.length > 0 && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                            <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Subject Assignments ({teacher.subjects.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {teacher.subjects.map((subject, idx) => (
                                    <Badge 
                                        key={idx} 
                                        variant="outline" 
                                        className="bg-white border-indigo-300 text-indigo-800 text-xs"
                                    >
                                        {subject}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Advisory Sections */}
                    {teacher.sections && teacher.sections.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                            <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                Advisory Sections ({teacher.sections.length})
                            </h3>
                            <div className="space-y-2">
                                {teacher.sections.map((section, idx) => (
                                    <div 
                                        key={idx} 
                                        className="bg-white border border-green-300 rounded-lg p-3 flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-green-900">
                                                {section.grade_level} - {section.name}
                                            </p>
                                            <p className="text-xs text-green-700">
                                                School Year: {section.school_year}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="bg-green-100 border-green-300 text-green-800 text-xs">
                                            Adviser
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {teacher.sections && teacher.sections.length === 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                            <p className="text-sm text-gray-600 text-center">
                                No advisory sections assigned
                            </p>
                        </div>
                    )}

                    {/* Archive Information */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                        <h3 className="text-sm font-semibold text-amber-900 mb-3">
                            Archive Information
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-amber-700 font-medium">Archived By:</span>
                                <span className="text-amber-900">{teacher.archived_by}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-amber-700 font-medium">Archived At:</span>
                                <span className="text-amber-900">{teacher.archived_at}</span>
                            </div>
                            {teacher.reason && (
                                <div className="mt-3 pt-3 border-t border-amber-300">
                                    <span className="text-amber-700 font-medium">Reason:</span>
                                    <p className="text-amber-900 mt-1">{teacher.reason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
