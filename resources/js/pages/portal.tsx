import { Head, Link } from '@inertiajs/react'
import { GraduationCap, BookOpen, Target, Eye, Heart, ChevronDown, ArrowRight, Shield, BarChart3, Calendar, ShieldCheck, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

type Props = {
    slides?: string[]
}

export default function Portal({ slides = [] }: Props) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [scrolled, setScrolled] = useState(false)
    const [activeSection, setActiveSection] = useState('home')
    const [showPortalDropdown, setShowPortalDropdown] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Prevent back button to this page after login
    useEffect(() => {
        // Replace current history entry to prevent back navigation after login
        window.history.pushState(null, '', window.location.href)
        
        const handlePopState = () => {
            // Push state again to keep user from going back
            window.history.pushState(null, '', window.location.href)
        }

        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [])

    useEffect(() => {
        if (slides.length <= 1) return
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [slides.length])

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 80)
            const sections = ['home', 'about', 'features']
            for (const id of sections.reverse()) {
                const el = document.getElementById(id)
                if (el && window.scrollY >= el.offsetTop - 100) {
                    setActiveSection(id)
                    break
                }
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Lock body scroll while the mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [mobileMenuOpen])

    const scrollToSection = (id: string) => {
        setMobileMenuOpen(false)
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    const navLinks = [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'About' },
        { id: 'features', label: 'Features' },
    ]

    const portalLinks = [
        {
            href: '/login/student',
            label: 'Student Portal',
            desc: 'View grades & schedules',
            icon: <GraduationCap className="w-5 h-5" />,
            color: 'from-violet-500 to-violet-600',
            hoverBg: 'hover:bg-violet-50',
            hoverText: 'group-hover:text-violet-600',
        },
        // {
        //     href: '/login/adviser',
        //     label: 'Adviser Portal',
        //     desc: 'Manage your advisory class',
        //     icon: <ShieldCheck className="w-5 h-5" />,
        //     color: 'from-emerald-500 to-emerald-600',
        //     hoverBg: 'hover:bg-emerald-50',
        //     hoverText: 'group-hover:text-emerald-600',
        // },
        {
            href: '/login/teacher',
            label: 'Teacher Portal',
            desc: 'Manage classes & grades',
            icon: <BookOpen className="w-5 h-5" />,
            color: 'from-sky-500 to-sky-600',
            hoverBg: 'hover:bg-sky-50',
            hoverText: 'group-hover:text-sky-600',
        },
    ]

    const features = [
        {
            icon: <GraduationCap className="w-6 h-6" />,
            title: 'Student Management',
            desc: 'Comprehensive student records, enrollment tracking, and academic progress monitoring in one unified platform.',
            color: 'from-violet-500 to-violet-600',
            bg: 'bg-violet-50',
            border: 'border-violet-100',
        },
        {
            icon: <BookOpen className="w-6 h-6" />,
            title: 'Grade Management',
            desc: 'Streamlined grade input, automatic calculation, and instant report generation with real-time updates.',
            color: 'from-sky-500 to-sky-600',
            bg: 'bg-sky-50',
            border: 'border-sky-100',
        },
        {
            icon: <Calendar className="w-6 h-6" />,
            title: 'Class Scheduling',
            desc: 'Intelligent scheduling for classes, room assignments, and teacher-subject allocations with conflict detection.',
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: 'Enhance Performance',
            desc: 'Rich dashboards and reports on student performance, attendance trends, and academic achievements.',
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Secure Digital Records',
            desc: 'Cloud-based, encrypted storage for all academic records, documents, and sensitive student information.',
            color: 'from-rose-500 to-rose-600',
            bg: 'bg-rose-50',
            border: 'border-rose-100',
        },
    ]

    return (
        <>
            <Head title="SNHS DigiStar — Portal" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

                * { box-sizing: border-box; }

                body {
                    font-family: 'DM Sans', sans-serif;
                    background: #f8f7f4;
                    margin: 0;
                }

                .font-display { font-family: 'DM Serif Display', serif; }

                .nav-link-active::after {
                    content: '';
                    display: block;
                    height: 2px;
                    background: #fff;
                    border-radius: 2px;
                    margin-top: 2px;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes floatBubble {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-12px) scale(1.02); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-up { animation: fadeUp 0.7s ease forwards; }
                .animate-fade-up-delay-1 { animation: fadeUp 0.7s 0.15s ease forwards; opacity: 0; }
                .animate-fade-up-delay-2 { animation: fadeUp 0.7s 0.3s ease forwards; opacity: 0; }
                .animate-fade-in { animation: fadeIn 1s ease forwards; }
                .animate-float { animation: floatBubble 6s ease-in-out infinite; }
                .animate-slide-down { animation: slideDown 0.25s ease forwards; }

                .card-hover {
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .card-hover:hover {
                    transform: translateY(-4px);
                }

                .role-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    cursor: pointer;
                }
                .role-card:hover {
                    transform: translateY(-6px);
                }

                .pill-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    padding: 5px 14px;
                    border-radius: 99px;
                    letter-spacing: 0.03em;
                }

                .section-label {
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #16a34a;
                }

                .divider-dot {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: #d1d5db;
                    display: inline-block;
                    margin: 0 10px;
                    vertical-align: middle;
                }

                /* Smooth slide transition */
                .slide-img {
                    transition: opacity 1.2s ease;
                }

                .gradient-text {
                    background: linear-gradient(135deg, #ffffff 0%, #bbf7d0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>

            {/* ── NAVBAR ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${scrolled || mobileMenuOpen
                    ? 'bg-green-800/90 backdrop-blur-xl shadow-lg shadow-green-950/20'
                    : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        <div className="flex items-center gap-3">
                            <img src="/SNHS-logo-2.png" alt="SNHS DigiStar" className="h-12 md:h-20 w-auto" />
                        </div>

                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => scrollToSection(id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === id
                                            ? 'text-white bg-white/10'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Desktop portal dropdown */}
                            <div className="relative hidden md:block">
                                <button
                                    onClick={() => setShowPortalDropdown(!showPortalDropdown)}
                                    onBlur={() => setTimeout(() => setShowPortalDropdown(false), 200)}
                                    className="flex items-center gap-2 bg-white text-green-800 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-50 transition-all shadow-sm hover:shadow-md"
                                >
                                    Access Portal
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showPortalDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showPortalDropdown && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                                        <div className="p-2">
                                            {portalLinks.map((p) => (
                                                <Link
                                                    key={p.href}
                                                    href={p.href}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${p.hoverBg} transition-colors group`}
                                                >
                                                    <div className={`w-10 h-10 bg-gradient-to-br ${p.color} rounded-lg flex items-center justify-center text-white shrink-0`}>
                                                        {p.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900 text-sm">{p.label}</div>
                                                        <div className="text-xs text-gray-500">{p.desc}</div>
                                                    </div>
                                                    <ArrowRight className={`w-4 h-4 text-gray-400 ${p.hoverText} group-hover:translate-x-1 transition-all shrink-0`} />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile hamburger toggle */}
                            <button
                                onClick={() => setMobileMenuOpen((v) => !v)}
                                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={mobileMenuOpen}
                                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu panel */}
                {mobileMenuOpen && (
                    <div className="md:hidden animate-slide-down border-t border-white/10 bg-green-800/95 backdrop-blur-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => scrollToSection(id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === id
                                            ? 'text-white bg-white/10'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="px-4 pb-5 pt-2 border-t border-white/10">
                            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3 px-1">
                                Access Portal
                            </p>
                            <div className="space-y-2">
                                {portalLinks.map((p) => (
                                    <Link
                                        key={p.href}
                                        href={p.href}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-green-50 transition-colors group"
                                    >
                                        <div className={`w-10 h-10 bg-gradient-to-br ${p.color} rounded-lg flex items-center justify-center text-white shrink-0`}>
                                            {p.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900 text-sm">{p.label}</div>
                                            <div className="text-xs text-gray-500">{p.desc}</div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-all shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            <div className="min-h-screen overflow-x-hidden">

                {/* ── HERO ── */}
                <section id="home" className="relative min-h-screen flex flex-col overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-green-900 to-emerald-800">
                        {slides.length > 0 && slides.map((slide, i) => (
                            <img
                                key={i}
                                src={slide}
                                alt=""
                                className={`slide-img absolute inset-0 w-full h-full object-cover ${i === currentSlide ? 'opacity-20' : 'opacity-0'}`}
                            />
                        ))}
                    </div>

                    {/* Texture overlay */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(74,222,128,0.08) 0%, transparent 50%),
                                          radial-gradient(circle at 80% 20%, rgba(16,185,129,0.06) 0%, transparent 40%),
                                          radial-gradient(circle at 60% 80%, rgba(5,150,105,0.05) 0%, transparent 40%)`
                    }} />

                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                        backgroundSize: '48px 48px'
                    }} />

                    {/* Floating orbs */}
                    <div className="animate-float absolute top-1/4 right-1/5 w-40 h-40 md:w-64 md:h-64 rounded-full opacity-20 blur-2xl"
                        style={{ background: 'radial-gradient(circle, #34d399, transparent)', animationDelay: '0s' }} />
                    <div className="animate-float absolute bottom-1/3 left-1/6 w-32 h-32 md:w-48 md:h-48 rounded-full opacity-15 blur-2xl"
                        style={{ background: 'radial-gradient(circle, #6ee7b7, transparent)', animationDelay: '2s' }} />

                    {/* Hero Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 sm:px-6 pt-28 pb-20 md:py-32 text-center">
                        {/* Pill badge */}
                        <div className="animate-fade-up mb-6 md:mb-8">
                            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-green-200 text-xs font-medium px-4 py-2 rounded-full text-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
                                Santor National High School — Digital Platform
                            </span>
                        </div>

                        {/* Logo + headline */}
                        <div className="animate-fade-up-delay-1 w-full">
                            <img
                                src="/SNHS-logo-2.png"
                                alt="SNHS DigiStar"
                                className="w-auto h-20 sm:h-28 md:h-44 mx-auto object-contain mb-6 md:mb-8 drop-shadow-2xl"
                            />
                            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-4 md:mb-6">
                                <span className="gradient-text">Empowering</span>
                                <br />
                                <span className="text-white">Education</span>
                            </h1>
                            <p className="text-green-100/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 px-2">
                                A comprehensive digital platform built to streamline school operations,
                                elevate student outcomes, and connect every part of your school community.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="animate-fade-up-delay-2 w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                            <button
                                onClick={() => scrollToSection('about')}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-green-800 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base hover:bg-green-50 transition-all shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-[1.02]"
                            >
                                Learn More
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="md:hidden w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base hover:bg-white/20 transition-all"
                            >
                                Access Portal
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Slide dots */}
                    {slides.length > 1 && (
                        <div className="relative z-10 flex justify-center gap-2 pb-6 md:pb-8">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i)}
                                    className={`transition-all duration-300 rounded-full ${i === currentSlide ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Bottom wave */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                            <path d="M0 80L60 69.3C120 58.7 240 37.3 360 32C480 26.7 600 37.3 720 42.7C840 48 960 48 1080 42.7C1200 37.3 1320 26.7 1380 21.3L1440 16V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#fafaf9" />
                        </svg>
                    </div>
                </section>

                {/* ── ABOUT ── */}
                <section id="about" className="bg-white py-16 sm:py-24 lg:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-2xl mb-12 md:mb-16">
                            <p className="section-label mb-4">Who We Are</p>
                            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-gray-900 leading-tight mb-6">
                                Built for schools that believe in better
                            </h2>
                            <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
                                DIGISTAR is an integrated digital platform developed
                                specifically for the purpose of upgrading and modernizing
                                the educational and administrative experience at Santor National High School (SNHS)
                                to an efficient and reliable digital format. As the official student portal, 
                                DIGISTAR provides a replacement for traditional paper processes utilizing a secure 
                                centralized environment that supports a more efficient, reliable and sustainable campus.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
                            {[
                                {
                                    icon: <Target className="w-6 h-6 text-violet-600" />,
                                    iconBg: 'bg-violet-50',
                                    title: 'Our Mission',
                                    body: 'To provide quality education through innovative digital solutions, fostering academic excellence and holistic development for every student in our care.',
                                    accent: 'border-violet-200',
                                },
                                {
                                    icon: <Eye className="w-6 h-6 text-sky-600" />,
                                    iconBg: 'bg-sky-50',
                                    title: 'Our Vision',
                                    body: 'To become the leading institution in digital education, equipping every student with knowledge and 21st-century skills for a successful future.',
                                    accent: 'border-sky-200',
                                },
                                {
                                    icon: <Heart className="w-6 h-6 text-emerald-600" />,
                                    iconBg: 'bg-emerald-50',
                                    title: 'Our Values',
                                    body: 'Excellence, Integrity, Innovation, Collaboration, and Compassion. These principles guide every decision we make in shaping future leaders.',
                                    accent: 'border-emerald-200',
                                },
                            ].map((card) => (
                                <div
                                    key={card.title}
                                    className={`card-hover bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 hover:border-stone-300 hover:shadow-lg`}
                                >
                                    <div className={`${card.iconBg} w-12 h-12 rounded-xl flex items-center justify-center mb-5`}>
                                        {card.icon}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-lg mb-3">{card.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{card.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ── */}
                <section id="features" className="bg-stone-50 py-16 sm:py-24 lg:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
                            <p className="section-label mb-4">Platform Features</p>
                            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-gray-900 leading-tight mb-4">
                                Everything your school needs
                            </h2>
                            <p className="text-gray-500 text-base sm:text-lg">
                                Powerful tools that make administration effortless and learning meaningful.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {features.map((f) => (
                                <div
                                    key={f.title}
                                    className="card-hover bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 hover:shadow-lg hover:border-stone-300 group"
                                >
                                    <div className={`${f.bg} ${f.border} border w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                        <div className={`bg-gradient-to-br ${f.color} rounded-lg w-full h-full flex items-center justify-center text-white`}>
                                            {f.icon}
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="bg-gray-950 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
                            {/* Brand */}
                            <div className="sm:col-span-2 md:col-span-2">
                                <img src="/SNHS-logo-2.png" alt="SNHS DigiStar" className="h-14 sm:h-16 w-auto mb-4 opacity-90" />
                                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                                    Empowering the Santor National High School community through thoughtful digital innovation and academic excellence.
                                </p>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">Navigation</h4>
                                <ul className="space-y-3">
                                    {navLinks.map(({ id, label }) => (
                                        <li key={id}>
                                            <button
                                                onClick={() => scrollToSection(id)}
                                                className="text-gray-400 hover:text-white text-sm transition-colors"
                                            >
                                                {label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">Contact</h4>
                                <ul className="space-y-3 text-sm text-gray-400">
                                    <li>Bongabon, Nueva Ecija</li>
                                    <li>Philippines 3128</li>
                                    <li>
                                        <a href="mailto:info@snhs.edu.ph" className="hover:text-white transition-colors break-all">
                                            info@snhs.edu.ph
                                        </a>
                                    </li>
                                    <li>
                                        <a href="tel:+631234567890" className="hover:text-white transition-colors">
                                            (123) 456-7890
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-xs text-center">
                            <p>&copy; 2026 Santor National High School. All rights reserved.</p>
                            <p>Powered by SNHS DigiStar</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}