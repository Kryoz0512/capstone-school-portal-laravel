import { Head, router } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TableProperties, Image, ZoomIn, ZoomOut, X, Maximize2 } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'

type ScheduleRow = {
    time: string
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
}

type SchedulePicture = {
    id: number
    url: string
    label: string | null
    file_name: string
    uploaded_by: string | null
    uploaded_at: string
}

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
    schedules: ScheduleRow[]
    schoolYears: { value: string; label: string }[]
    filters: {
        school_year: string
    }
    schedulePictures: SchedulePicture[]
}

type Tab = 'digital' | 'photo'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 5
const ZOOM_STEP = 0.3

export default function TeacherSchedule({ auth, schedules = [], schoolYears = [], filters, schedulePictures = [] }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('digital')
    const [lightboxPic, setLightboxPic] = useState<SchedulePicture | null>(null)
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const canvasRef = useRef<HTMLDivElement>(null)

    const openLightbox = (pic: SchedulePicture) => {
        setLightboxPic(pic)
        setZoom(1)
        setPan({ x: 0, y: 0 })
    }

    const closeLightbox = () => {
        setLightboxPic(null)
        setZoom(1)
        setPan({ x: 0, y: 0 })
    }

    const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))

    const zoomIn  = () => setZoom(z => clampZoom(z + ZOOM_STEP))
    const zoomOut = () => setZoom(z => clampZoom(z - ZOOM_STEP))
    const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

    // Scroll-to-zoom
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault()
        setZoom(z => clampZoom(z - e.deltaY * 0.001))
    }, [])

    // Drag to pan
    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom <= 1) return
        setIsDragging(true)
        dragStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
    }

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !dragStart.current) return
        setPan({
            x: dragStart.current.px + (e.clientX - dragStart.current.mx),
            y: dragStart.current.py + (e.clientY - dragStart.current.my),
        })
    }, [isDragging])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
        dragStart.current = null
    }, [])

    // Touch pinch-to-zoom
    const lastTouchDist = useRef<number | null>(null)
    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length !== 2) return
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.hypot(dx, dy)
        if (lastTouchDist.current !== null) {
            const delta = dist - lastTouchDist.current
            setZoom(z => clampZoom(z + delta * 0.005))
        }
        lastTouchDist.current = dist
    }
    const handleTouchEnd = () => { lastTouchDist.current = null }

    useEffect(() => {
        if (!lightboxPic) return
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        const el = canvasRef.current
        el?.addEventListener('wheel', handleWheel, { passive: false })
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            el?.removeEventListener('wheel', handleWheel)
        }
    }, [lightboxPic, handleMouseMove, handleMouseUp, handleWheel])

    // Keyboard shortcuts
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!lightboxPic) return
            if (e.key === 'Escape') closeLightbox()
            if (e.key === '+' || e.key === '=') zoomIn()
            if (e.key === '-') zoomOut()
            if (e.key === '0') resetZoom()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [lightboxPic])

    const handleSchoolYearChange = (value: string) => {
        router.get('/teacher/schedule', { school_year: value }, { preserveState: true, replace: true })
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const
    const dayLabels: Record<typeof days[number], string> = {
        monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
        thursday: 'Thursday', friday: 'Friday',
    }

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="My Schedule" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
                    <p className="text-sm text-gray-500 mt-1">View your class schedule for the selected school year</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('digital')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'digital' ? 'bg-white text-blue-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <TableProperties className="w-4 h-4" />
                        Digital Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('photo')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'photo' ? 'bg-white text-blue-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Image className="w-4 h-4" />
                        Photo Schedule
                        {schedulePictures.length > 0 && (
                            <span className="ml-1 bg-blue-100 text-blue-800 text-xs rounded-full px-1.5 py-0.5">
                                {schedulePictures.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── DIGITAL TAB ── */}
                {activeTab === 'digital' && (
                    <>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">School Year</label>
                                <Select value={filters.school_year} onValueChange={handleSchoolYearChange}>
                                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {schoolYears.map(sy => (
                                            <SelectItem key={sy.value} value={sy.value}>{sy.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {schedules.length === 0 ? (
                                <div className="p-8 text-center">
                                    <TableProperties className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-lg font-medium text-gray-900 mb-1">No Schedule Found</p>
                                    <p className="text-sm text-gray-500">No class schedule has been assigned for the selected school year.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-blue-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">Time</th>
                                                {days.map(day => (
                                                    <th key={day} className="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">
                                                        {dayLabels[day]}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {schedules.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">{row.time}</td>
                                                    {days.map(day => (
                                                        <td key={day} className="px-4 py-3 text-sm text-gray-800">
                                                            {row[day] ? (
                                                                <div className="space-y-0.5">
                                                                    {row[day].split('\n').map((line, i) => (
                                                                        <p key={i} className={i === 0 ? 'font-medium' : 'text-xs text-gray-500'}>{line}</p>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-300">—</span>
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ── PHOTO TAB ── */}
                {activeTab === 'photo' && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">Photo Schedule</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Click any photo to view it fullscreen. Scroll or pinch to zoom.</p>
                        </div>

                        {schedulePictures.length === 0 ? (
                            <div className="p-8 text-center">
                                <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-lg font-medium text-gray-900 mb-1">No Photos Yet</p>
                                <p className="text-sm text-gray-500">The administrator hasn't uploaded any schedule pictures yet.</p>
                            </div>
                        ) : (
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {schedulePictures.map(pic => (
                                    <div
                                        key={pic.id}
                                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                                        onClick={() => openLightbox(pic)}
                                    >
                                        <div className="relative">
                                            <img
                                                src={pic.url}
                                                alt={pic.label ?? pic.file_name}
                                                className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                <span className="flex items-center gap-1.5 text-white text-sm font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                    <Maximize2 className="w-4 h-4" />
                                                    View Fullscreen
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-white">
                                            {pic.label && <p className="text-sm font-semibold text-gray-800 truncate">{pic.label}</p>}
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Uploaded {pic.uploaded_at}{pic.uploaded_by ? ` by ${pic.uploaded_by}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ══════════ FULLSCREEN LIGHTBOX ══════════ */}
            {lightboxPic && (
                <div className="fixed inset-0 z-[9999] bg-black flex flex-col">

                    {/* Top bar */}
                    <div className="flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur-sm shrink-0">
                        <div className="text-white">
                            {lightboxPic.label && (
                                <p className="text-sm font-semibold">{lightboxPic.label}</p>
                            )}
                            <p className="text-xs text-gray-400">
                                Uploaded {lightboxPic.uploaded_at}
                                {lightboxPic.uploaded_by ? ` by ${lightboxPic.uploaded_by}` : ''}
                            </p>
                        </div>

                        {/* Zoom controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={zoomOut}
                                disabled={zoom <= MIN_ZOOM}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
                                title="Zoom out (−)"
                            >
                                <ZoomOut className="w-5 h-5" />
                            </button>

                            <button
                                onClick={resetZoom}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-mono min-w-[4rem] text-center transition-colors"
                                title="Reset zoom (0)"
                            >
                                {Math.round(zoom * 100)}%
                            </button>

                            <button
                                onClick={zoomIn}
                                disabled={zoom >= MAX_ZOOM}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
                                title="Zoom in (+)"
                            >
                                <ZoomIn className="w-5 h-5" />
                            </button>

                            <div className="w-px h-6 bg-white/20 mx-1" />

                            <button
                                onClick={closeLightbox}
                                className="p-2 rounded-lg bg-white/10 hover:bg-red-500/70 text-white transition-colors"
                                title="Close (Esc)"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Image canvas */}
                    <div
                        ref={canvasRef}
                        className="flex-1 overflow-hidden relative select-none"
                        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                        onMouseDown={handleMouseDown}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
                        >
                            <img
                                ref={imgRef}
                                src={lightboxPic.url}
                                alt={lightboxPic.label ?? lightboxPic.file_name}
                                draggable={false}
                                style={{
                                    transform: `scale(${zoom})`,
                                    transformOrigin: 'center center',
                                    maxWidth: '100vw',
                                    maxHeight: 'calc(100vh - 96px)',
                                    width: 'auto',
                                    height: 'auto',
                                    objectFit: 'contain',
                                    transition: isDragging ? 'none' : 'transform 0.1s ease',
                                }}
                            />
                        </div>
                    </div>

                    {/* Bottom hint */}
                    <div className="shrink-0 bg-black/60 text-center py-2 text-xs text-gray-400 backdrop-blur-sm">
                        Scroll to zoom &nbsp;·&nbsp; Drag to pan when zoomed &nbsp;·&nbsp;
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">+</kbd> /
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">−</kbd> keys &nbsp;·&nbsp;
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">Esc</kbd> to close
                    </div>
                </div>
            )}
        </TeacherLayout>
    )
}