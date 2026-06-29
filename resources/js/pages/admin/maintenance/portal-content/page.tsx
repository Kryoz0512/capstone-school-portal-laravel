import { useForm, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import {
    Globe,
    Star,
    Info,
    LayoutGrid,
    Footprints,
    Save,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Eye,
} from 'lucide-react'
import { useState } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

type PortalContent = {
    id: number
    hero_badge_text: string
    hero_headline_top: string
    hero_headline_bottom: string
    hero_description: string
    hero_cta_label: string
    about_section_label: string
    about_headline: string
    about_description: string
    mission_title: string
    mission_body: string
    vision_title: string
    vision_body: string
    values_title: string
    values_body: string
    features_section_label: string
    features_headline: string
    features_subheadline: string
    footer_description: string
    footer_address_line1: string
    footer_address_line2: string
    footer_email: string
    footer_phone: string
    footer_copyright: string
    footer_powered_by: string
}

type Props = {
    content: PortalContent
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

type SectionKey = 'hero' | 'about' | 'features' | 'footer'

// ── Static config (outside component so it's never recreated) ────────────────

const SECTION_META: Record<SectionKey, {
    label: string
    subtitle: string
    border: string
    iconBg: string
    iconColor: string
    badge: string
    fieldCount: string
}> = {
    hero: {
        label: 'Hero',
        subtitle: 'Badge · Headline · Description · Call-to-action button',
        border: 'border-l-violet-500',
        iconBg: 'bg-violet-50',
        iconColor: 'text-violet-600',
        badge: 'bg-violet-100 text-violet-700',
        fieldCount: '5 fields',
    },
    about: {
        label: 'About',
        subtitle: 'Section label · Headline · Description · Mission / Vision / Values cards',
        border: 'border-l-sky-500',
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-600',
        badge: 'bg-sky-100 text-sky-700',
        fieldCount: '9 fields',
    },
    features: {
        label: 'Features',
        subtitle: 'Section label · Headline · Sub-headline (feature cards are code-defined)',
        border: 'border-l-emerald-500',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        badge: 'bg-emerald-100 text-emerald-700',
        fieldCount: '3 fields',
    },
    footer: {
        label: 'Footer',
        subtitle: 'Tagline · Address · Contact details · Copyright',
        border: 'border-l-amber-500',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700',
        fieldCount: '7 fields',
    },
}

const SECTION_ICON: Record<SectionKey, React.ReactNode> = {
    hero:     <Star       className="w-4 h-4" />,
    about:    <Info       className="w-4 h-4" />,
    features: <LayoutGrid className="w-4 h-4" />,
    footer:   <Footprints className="w-4 h-4" />,
}

// ── Sub-components (defined OUTSIDE the page component) ──────────────────────
// Defining them inside would cause React to treat them as new component types
// on every render, unmounting and remounting every input and losing focus.

type FieldProps = {
    label: string
    field: keyof PortalContent
    value: string
    error?: string
    multiline?: boolean
    rows?: number
    hint?: string
    span2?: boolean
    onChange: (field: keyof PortalContent, value: string) => void
}

function Field({ label, field, value, error, multiline = false, rows = 3, hint, span2 = false, onChange }: FieldProps) {
    const hasError = !!error
    const baseInput = [
        'w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-800 bg-white',
        'transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500',
        'placeholder:text-gray-300',
        hasError
            ? 'border-red-300 bg-red-50/40 focus:ring-red-400/20 focus:border-red-400'
            : 'border-gray-200 hover:border-gray-300',
    ].join(' ')

    return (
        <div className={`flex flex-col gap-1.5 ${span2 ? 'md:col-span-2' : ''}`}>
            <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    {label}
                </label>
                {hasError && (
                    <span className="flex items-center gap-1 text-xs text-red-500 shrink-0">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                    </span>
                )}
            </div>
            {hint && <p className="text-xs text-gray-400 leading-snug">{hint}</p>}
            {multiline ? (
                <textarea
                    rows={rows}
                    value={value}
                    onChange={(e) => onChange(field, e.target.value)}
                    className={`${baseInput} resize-none`}
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(field, e.target.value)}
                    className={baseInput}
                />
            )}
        </div>
    )
}

type SectionProps = {
    id: SectionKey
    isOpen: boolean
    errorCount: number
    onToggle: (id: SectionKey) => void
    children: React.ReactNode
}

function Section({ id, isOpen, errorCount, onToggle, children }: SectionProps) {
    const meta = SECTION_META[id]
    return (
        <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${meta.border} shadow-sm overflow-hidden`}>
            <button
                type="button"
                onClick={() => onToggle(id)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors text-left"
            >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.iconBg} ${meta.iconColor}`}>
                    {SECTION_ICON[id]}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-gray-900 text-sm">{meta.label} Section</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
                            {meta.fieldCount}
                        </span>
                        {errorCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                                <AlertCircle className="w-2.5 h-2.5" />
                                {errorCount} error{errorCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{meta.subtitle}</p>
                </div>
                <div className="text-gray-400 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>
            {isOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}

function Divider({ label }: { label: string }) {
    return (
        <div className="md:col-span-2 flex items-center gap-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
                {label}
            </span>
            <div className="flex-1 border-t border-dashed border-gray-200" />
        </div>
    )
}

// ── Page component ───────────────────────────────────────────────────────────

export default function PortalContentPage({ content, auth }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>()
    const flash = props.flash

    const { data, setData, put, processing, errors, reset, isDirty } = useForm<PortalContent>({
        ...content,
    })

    const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
        hero: true,
        about: true,
        features: true,
        footer: true,
    })

    const toggle = (s: SectionKey) =>
        setOpenSections((prev) => ({ ...prev, [s]: !prev[s] }))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put('/admin/maintenance/portal-content', { preserveScroll: true })
    }

    // Stable onChange handler
    const handleChange = (field: keyof PortalContent, value: string) => {
        setData(field, value)
    }

    // Error counts per section
    const heroFields:     (keyof PortalContent)[] = ['hero_badge_text','hero_headline_top','hero_headline_bottom','hero_description','hero_cta_label']
    const aboutFields:    (keyof PortalContent)[] = ['about_section_label','about_headline','about_description','mission_title','mission_body','vision_title','vision_body','values_title','values_body']
    const featuresFields: (keyof PortalContent)[] = ['features_section_label','features_headline','features_subheadline']
    const footerFields:   (keyof PortalContent)[] = ['footer_description','footer_address_line1','footer_address_line2','footer_email','footer_phone','footer_copyright','footer_powered_by']

    const sectionErrors: Record<SectionKey, number> = {
        hero:     heroFields.filter(f => errors[f]).length,
        about:    aboutFields.filter(f => errors[f]).length,
        features: featuresFields.filter(f => errors[f]).length,
        footer:   footerFields.filter(f => errors[f]).length,
    }
    const totalErrors = Object.values(sectionErrors).reduce((a, b) => a + b, 0)

    // Shorthand for passing field props
    const f = (field: keyof PortalContent, extra?: Partial<FieldProps>) => ({
        field,
        value: data[field] as string,
        error: errors[field],
        onChange: handleChange,
        ...extra,
    })

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Portal Content — Maintenance" />

            <div className="min-h-screen bg-gray-50/60">

                {/* ── Page header ─────────────────────────────────────────── */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-8 py-6 max-w-5xl mx-auto">
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-sm shrink-0">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 leading-tight">Portal Content</h1>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        Manage the text and copy shown on the public homepage.
                                    </p>
                                </div>
                            </div>
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shrink-0"
                            >
                                <Eye className="w-4 h-4" />
                                Preview Portal
                            </a>
                        </div>

                        {/* Status strip */}
                        <div className="flex items-center gap-6 mt-5 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-400' : 'bg-green-400'}`} />
                                <span className="text-xs text-gray-500">
                                    {isDirty ? 'Unsaved changes' : 'All changes saved'}
                                </span>
                            </div>
                            {totalErrors > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-red-500">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {totalErrors} validation error{totalErrors > 1 ? 's' : ''} — check sections below
                                </div>
                            )}
                            {flash?.success && (
                                <div className="flex items-center gap-1.5 text-xs text-green-600">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {flash.success}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Form ────────────────────────────────────────────────── */}
                <form onSubmit={handleSubmit}>
                    <div className="px-8 py-6 space-y-4 max-w-5xl mx-auto">

                        {/* HERO */}
                        <Section id="hero" isOpen={openSections.hero} errorCount={sectionErrors.hero} onToggle={toggle}>
                            <Field label="Badge Text"            {...f('hero_badge_text',      { hint: 'Small pill badge shown above the main headline.' })} />
                            <Field label="Headline — Top Line"   {...f('hero_headline_top')} />
                            <Field label="Headline — Bottom Line"{...f('hero_headline_bottom')} />
                            <Field label="Description"           {...f('hero_description',     { multiline: true, rows: 3, span2: true, hint: 'Supporting paragraph shown below the headline.' })} />
                            <Field label="CTA Button Label"      {...f('hero_cta_label')} />
                        </Section>

                        {/* ABOUT */}
                        <Section id="about" isOpen={openSections.about} errorCount={sectionErrors.about} onToggle={toggle}>
                            <Field label="Section Label" {...f('about_section_label', { hint: 'Small uppercase eyebrow label, e.g. "Who We Are".' })} />
                            <Field label="Headline"      {...f('about_headline')} />
                            <Field label="Description"   {...f('about_description',   { multiline: true, rows: 5, span2: true })} />

                            <Divider label="Mission · Vision · Values Cards" />

                            <Field label="Mission Card Title" {...f('mission_title')} />
                            <Field label="Mission Card Body"  {...f('mission_body',  { multiline: true, rows: 3 })} />
                            <Field label="Vision Card Title"  {...f('vision_title')} />
                            <Field label="Vision Card Body"   {...f('vision_body',   { multiline: true, rows: 3 })} />
                            <Field label="Values Card Title"  {...f('values_title')} />
                            <Field label="Values Card Body"   {...f('values_body',   { multiline: true, rows: 3 })} />
                        </Section>

                        {/* FEATURES */}
                        <Section id="features" isOpen={openSections.features} errorCount={sectionErrors.features} onToggle={toggle}>
                            <Field label="Section Label" {...f('features_section_label', { hint: 'Small uppercase eyebrow label, e.g. "Platform Features".' })} />
                            <Field label="Headline"      {...f('features_headline')} />
                            <Field label="Sub-Headline"  {...f('features_subheadline',   { span2: true, hint: 'Supporting sentence shown below the headline.' })} />
                        </Section>

                        {/* FOOTER */}
                        <Section id="footer" isOpen={openSections.footer} errorCount={sectionErrors.footer} onToggle={toggle}>
                            <Field label="Tagline" {...f('footer_description', { multiline: true, rows: 2, span2: true, hint: 'Short description shown next to the logo in the footer.' })} />

                            <Divider label="Address & Contact" />

                            <Field label="Address Line 1" {...f('footer_address_line1')} />
                            <Field label="Address Line 2" {...f('footer_address_line2')} />
                            <Field label="Email Address"  {...f('footer_email')} />
                            <Field label="Phone Number"   {...f('footer_phone')} />

                            <Divider label="Legal" />

                            <Field label="Copyright Notice" {...f('footer_copyright', { span2: true, hint: 'Omit the © symbol — it is added automatically.' })} />
                            <Field label="Powered-by Line"  {...f('footer_powered_by')} />
                        </Section>
                    </div>

                    {/* ── Sticky save bar ─────────────────────────────────── */}
                    <div className={`sticky bottom-0 z-30 transition-all duration-300 ${isDirty ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                        <div className="mx-8 mb-6 max-w-5xl mx-auto rounded-xl bg-gray-900/95 backdrop-blur-sm border border-white/10 shadow-2xl shadow-black/30 px-5 py-3.5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                                <span className="text-sm text-white/80">You have unsaved changes</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => reset()}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-gray-900 bg-white hover:bg-green-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}