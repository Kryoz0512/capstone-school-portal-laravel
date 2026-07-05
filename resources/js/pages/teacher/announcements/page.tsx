import { Head, useForm, router } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Megaphone,
    Plus,
    Pencil,
    Trash2,
    Pin,
    PinOff,
    BookOpen,
    Users,
    GraduationCap,
    AlertCircle,
    CalendarClock,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

type Announcement = {
    id: number
    title: string
    content: string
    is_active: boolean
    section_name: string
    subject_name: string
    grade_level_id: number | null
    section_id: number | null
    subject_id: number | null
    created_at: string
}

type GradeLevel = {
    id: number
    name: string
}

type ClassSection = {
    id: number
    section_name: string
    grade_level_id: number
    grade_level_name: string
}

type Subject = {
    id: number
    name: string
    code: string
    grade_level_id: number
    display_name: string
}

type Props = {
    announcements: Announcement[]
    sections: ClassSection[]
    subjects: Subject[]
    gradeLevels: GradeLevel[]
    auth: {
        user: any
        teacher: any
    }
}

// A small palette the "pinned to a subject" chips cycle through, so a
// teacher scanning the board can tell subjects apart at a glance without
// needing to read every label.
const SUBJECT_TONES = [
    'bg-amber-50 text-amber-800 border-amber-200',
    'bg-sky-50 text-sky-800 border-sky-200',
    'bg-rose-50 text-rose-800 border-rose-200',
    'bg-emerald-50 text-emerald-800 border-emerald-200',
    'bg-violet-50 text-violet-800 border-violet-200',
]

function toneForSubject(name: string) {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) % SUBJECT_TONES.length
    }
    return SUBJECT_TONES[Math.abs(hash)]
}

// Shared class string for every Select trigger on this page.
//
// The dropdown-truncation bug: shadcn's generated SelectTrigger ships with
// `[&>span]:line-clamp-1` baked into its default classes. That clamps the
// selected value's <span> to a single line and ellipsis-cuts anything that
// doesn't fit — which is exactly why a longer grade level name (or any
// longer label) never showed in full, even though the trigger itself had
// room. `line-clamp-none` + letting the span wrap fixes it.
const selectTriggerClass = (extra: string, filled: boolean, hasError: boolean) =>
    cn(
        'h-auto min-h-11 py-2.5 bg-white border-2 text-left transition-colors',
        '[&>span]:line-clamp-none [&>span]:whitespace-normal [&>span]:break-words',
        'hover:border-slate-300',
        filled ? 'border-slate-300' : 'border-slate-200',
        hasError && 'border-red-400',
        extra
    )

type FormState = {
    title: string
    content: string
    grade_level_id: string
    section_id: string
    subject_id: string
}

export default function TeacherAnnouncementsPage({ announcements, sections, subjects, gradeLevels, auth }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
    const [filteredSections, setFilteredSections] = useState<ClassSection[]>(sections)
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>(subjects)

    const { data, setData, post, put, processing, errors, reset } = useForm<FormState>({
        title: '',
        content: '',
        grade_level_id: '',
        section_id: '',
        subject_id: '',
    })

    const activeCount = useMemo(() => announcements.filter((a) => a.is_active).length, [announcements])
    const reachCount = useMemo(
        () => new Set(announcements.filter((a) => a.is_active).map((a) => a.section_name)).size,
        [announcements]
    )

    const applyGradeFilter = (gradeLevelId: string) => {
        setFilteredSections(sections.filter((section) => section.grade_level_id.toString() === gradeLevelId))
        setFilteredSubjects(subjects.filter((subject) => subject.grade_level_id.toString() === gradeLevelId))
    }

    const handleGradeLevelChange = (gradeLevelId: string) => {
        setData((prev) => ({ ...prev, grade_level_id: gradeLevelId, section_id: '', subject_id: '' }))
        applyGradeFilter(gradeLevelId)
    }

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        post('/teacher/announcements', {
            onSuccess: () => {
                reset()
                setIsCreateOpen(false)
            },
        })
    }

    const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (selectedAnnouncement) {
            put(`/teacher/announcements/${selectedAnnouncement.id}`, {
                onSuccess: () => {
                    reset()
                    setIsEditOpen(false)
                    setSelectedAnnouncement(null)
                },
            })
        }
    }

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/teacher/announcements/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            })
        }
    }

    const handleToggleActive = (id: number) => {
        router.post(`/teacher/announcements/${id}/toggle`)
    }

    const openCreateDialog = () => {
        reset()
        setFilteredSections(sections)
        setFilteredSubjects(subjects)
        setIsCreateOpen(true)
    }

    const openEditDialog = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement)

        // Restore the original grade level / section / subject instead of
        // wiping them — the previous version always reset these to '',
        // which silently discarded the announcement's actual targeting.
        const gradeLevelId = announcement.grade_level_id ? announcement.grade_level_id.toString() : ''
        applyGradeFilter(gradeLevelId)

        setData({
            title: announcement.title,
            content: announcement.content,
            grade_level_id: gradeLevelId,
            section_id: announcement.section_id ? announcement.section_id.toString() : '',
            subject_id: announcement.subject_id ? announcement.subject_id.toString() : '',
        })
        setIsEditOpen(true)
    }

    return (
        <TeacherLayout user={auth.user} teacher={auth.teacher}>
            <Head title="Announcements" />

            <div className="min-h-full bg-stone-50">
                {/* Header band */}
                <div className="bg-blue-800 px-6 py-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                                Teacher Noticeboard
                            </p>
                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Announcements</h1>
                            <p className="mt-1 text-sm text-slate-300">
                                Post something once — it lands with every student in the section you pick.
                            </p>
                        </div>
                        <Button
                            onClick={openCreateDialog}
                            className="w-fit bg-slate-100 text-slate-900 hover:bg-blue-700 hover:text-white"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New announcement
                        </Button>
                    </div>

                    <div className="mt-6 flex gap-6 border-t border-white/10 pt-4">
                        <div>
                            <p className="text-2xl font-bold text-white">{announcements.length}</p>
                            <p className="text-xs text-slate-400">Total posted</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-400">{activeCount}</p>
                            <p className="text-xs text-slate-400">Pinned right now</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{reachCount}</p>
                            <p className="text-xs text-slate-400">Sections reached</p>
                        </div>
                    </div>
                </div>

                {/* Board */}
                <div className="p-6">
                    {announcements.length === 0 ? (
                        <div className="rounded-xl border-2 border-dashed border-stone-300 bg-white py-16 text-center">
                            <Megaphone className="mx-auto mb-4 h-10 w-10 text-stone-300" />
                            <p className="font-medium text-stone-600">The board is empty</p>
                            <p className="mt-1 text-sm text-stone-400">
                                Post your first announcement to reach your students.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {announcements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className={cn(
                                        'relative rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
                                        announcement.is_active ? 'border-stone-200' : 'border-stone-200 opacity-70'
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <span
                                                className={cn(
                                                    'mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full',
                                                    announcement.is_active
                                                        ? 'bg-amber-100 text-amber-600'
                                                        : 'bg-stone-100 text-stone-400'
                                                )}
                                                title={announcement.is_active ? 'Pinned — visible to students' : 'Unpinned — hidden from students'}
                                            >
                                                {announcement.is_active ? (
                                                    <Pin className="h-4 w-4" />
                                                ) : (
                                                    <PinOff className="h-4 w-4" />
                                                )}
                                            </span>
                                            <div>
                                                <h3 className="text-lg font-semibold text-stone-900">{announcement.title}</h3>
                                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-slate-200 bg-slate-50 text-slate-700"
                                                    >
                                                        <Users className="mr-1 h-3 w-3" />
                                                        {announcement.section_name}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={toneForSubject(announcement.subject_name)}
                                                    >
                                                        <BookOpen className="mr-1 h-3 w-3" />
                                                        {announcement.subject_name}
                                                    </Badge>
                                                    <span className="flex items-center gap-1 text-xs text-stone-400">
                                                        <CalendarClock className="h-3 w-3" />
                                                        {announcement.created_at}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-none gap-1.5">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEditDialog(announcement)}
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleToggleActive(announcement.id)}
                                                title={announcement.is_active ? 'Unpin' : 'Pin'}
                                            >
                                                {announcement.is_active ? (
                                                    <PinOff className="h-4 w-4" />
                                                ) : (
                                                    <Pin className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => setDeleteId(announcement.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="mt-3 whitespace-pre-wrap pl-11 text-sm leading-relaxed text-stone-700">
                                        {announcement.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-white text-stone-900">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-stone-900">
                            <Megaphone className="h-5 w-5 text-amber-500" />
                            New announcement
                        </DialogTitle>
                        <DialogDescription>
                            Pick who sees it, then write the message.
                        </DialogDescription>
                    </DialogHeader>
                    <AnnouncementForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        gradeLevels={gradeLevels}
                        filteredSections={filteredSections}
                        filteredSubjects={filteredSubjects}
                        onGradeLevelChange={handleGradeLevelChange}
                        onSectionChange={(v) => setData('section_id', v)}
                        onSubjectChange={(v) => setData('subject_id', v)}
                        onSubmit={handleCreate}
                        onCancel={() => setIsCreateOpen(false)}
                        submitLabel="Post announcement"
                        submittingLabel="Posting..."
                    />
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-white text-stone-900">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-stone-900">
                            <Pencil className="h-5 w-5 text-amber-500" />
                            Edit announcement
                        </DialogTitle>
                        <DialogDescription>Update the message or who it's targeted to.</DialogDescription>
                    </DialogHeader>
                    <AnnouncementForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        gradeLevels={gradeLevels}
                        filteredSections={filteredSections}
                        filteredSubjects={filteredSubjects}
                        onGradeLevelChange={handleGradeLevelChange}
                        onSectionChange={(v) => setData('section_id', v)}
                        onSubjectChange={(v) => setData('subject_id', v)}
                        onSubmit={handleEdit}
                        onCancel={() => setIsEditOpen(false)}
                        submitLabel="Save changes"
                        submittingLabel="Saving..."
                    />
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="bg-white text-stone-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this announcement?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Students who already saw it keep their notification, but the announcement itself
                            can't be recovered once deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TeacherLayout>
    )
}

// Shared by both the Create and Edit dialogs so they can never drift into
// two different look-and-feels again.
function AnnouncementForm({
    data,
    setData,
    errors,
    processing,
    gradeLevels,
    filteredSections,
    filteredSubjects,
    onGradeLevelChange,
    onSectionChange,
    onSubjectChange,
    onSubmit,
    onCancel,
    submitLabel,
    submittingLabel,
}: {
    data: FormState
    setData: (key: keyof FormState, value: string) => void
    errors: Partial<Record<keyof FormState, string>>
    processing: boolean
    gradeLevels: GradeLevel[]
    filteredSections: ClassSection[]
    filteredSubjects: Subject[]
    onGradeLevelChange: (value: string) => void
    onSectionChange: (value: string) => void
    onSubjectChange: (value: string) => void
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    onCancel: () => void
    submitLabel: string
    submittingLabel: string
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="e.g., Quiz moved to Friday"
                    className={cn('bg-white text-stone-900', errors.title && 'border-red-400')}
                    required
                />
                {errors.title && <FieldError message={errors.title} />}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="content">Message</Label>
                <Textarea
                    id="content"
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    placeholder="Write what your students need to know..."
                    rows={5}
                    className={cn('bg-white text-stone-900', errors.content && 'border-red-400')}
                    required
                />
                {errors.content && <FieldError message={errors.content} />}
            </div>

            <div className="space-y-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-stone-700">
                    <Users className="h-4 w-4 text-stone-500" />
                    Who sees this
                </p>

                <div className="space-y-1.5">
                    <Label htmlFor="grade_level" className="text-xs text-stone-600">
                        Grade level
                    </Label>
                    <Select value={data.grade_level_id} onValueChange={onGradeLevelChange}>
                        <SelectTrigger
                            id="grade_level"
                            className={selectTriggerClass('w-full', !!data.grade_level_id, !!errors.grade_level_id)}
                        >
                            <SelectValue placeholder="Select grade level" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[--radix-select-trigger-width]">
                            {gradeLevels.map((gradeLevel) => (
                                <SelectItem key={gradeLevel.id} value={gradeLevel.id.toString()}>
                                    <span className="flex items-center gap-2 whitespace-normal break-words">
                                        <GraduationCap className="h-4 w-4 flex-none text-amber-600" />
                                        {gradeLevel.name}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="section" className="text-xs text-stone-600">
                            Section
                        </Label>
                        <Select value={data.section_id} onValueChange={onSectionChange} disabled={!data.grade_level_id}>
                            <SelectTrigger
                                id="section"
                                className={selectTriggerClass('w-full', !!data.section_id, !!errors.section_id)}
                            >
                                <SelectValue placeholder={data.grade_level_id ? 'Choose section' : 'Grade level first'} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredSections.length === 0 ? (
                                    <div className="px-3 py-4 text-center text-xs text-stone-400">
                                        No sections for this grade level
                                    </div>
                                ) : (
                                    filteredSections.map((section) => (
                                        <SelectItem key={section.id} value={section.id.toString()}>
                                            <span className="whitespace-normal break-words">{section.section_name}</span>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.section_id && <FieldError message={errors.section_id} />}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="subject" className="text-xs text-stone-600">
                            Subject
                        </Label>
                        <Select value={data.subject_id} onValueChange={onSubjectChange} disabled={!data.grade_level_id}>
                            <SelectTrigger
                                id="subject"
                                className={selectTriggerClass('w-full', !!data.subject_id, !!errors.subject_id)}
                            >
                                <SelectValue placeholder={data.grade_level_id ? 'Choose subject' : 'Grade level first'} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredSubjects.length === 0 ? (
                                    <div className="px-3 py-4 text-center text-xs text-stone-400">
                                        No subjects for this grade level
                                    </div>
                                ) : (
                                    filteredSubjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                            <span className="whitespace-normal break-words">{subject.display_name}</span>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.subject_id && <FieldError message={errors.subject_id} />}
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing} className="bg-amber-500 text-slate-900 hover:bg-amber-400">
                    {processing ? submittingLabel : submitLabel}
                </Button>
            </DialogFooter>
        </form>
    )
}

function FieldError({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {message}
        </div>
    )
}