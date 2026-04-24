import { Head, Link } from '@inertiajs/react'
import { GraduationCap, Users, BookOpen, Award, Target, Eye, Heart, Sparkles, Trophy, ChevronDown, ArrowRight, Shield, BarChart3, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

type Props = {
    slides?: string[]
}

export default function Portal({ slides = [] }: Props) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [scrolled, setScrolled] = useState(false)
    const [activeSection, setActiveSection] = useState('home')

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
            const sections = ['home', 'about', 'features', 'portal']
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

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    const navLinks = [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'About' },
        { id: 'features', label: 'Features' },
        { id: 'portal', label: 'Portal' },
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
            title: 'Performance Analytics',
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
        {
            icon: <Trophy className="w-6 h-6" />,
            title: 'Accreditation Support',
            desc: 'Built-in tools and compliance features designed to support school accreditation requirements seamlessly.',
            color: 'from-teal-500 to-teal-600',
            bg: 'bg-teal-50',
            border: 'border-teal-100',
        },
    ]

    const roles = [
        {
            href: '/login/student',
            icon: <GraduationCap className="w-10 h-10 text-white" />,
            title: 'Student',
            desc: 'View your grades, class schedules, enrollment status, and personal academic records.',
            gradient: 'from-violet-600 to-violet-700',
            ring: 'ring-violet-200',
            hover: 'hover:shadow-violet-100',
            badge: 'bg-violet-50 text-violet-700',
            btnBg: 'bg-violet-600 hover:bg-violet-700',
        },
        {
            href: '/login/teacher',
            icon: <BookOpen className="w-10 h-10 text-white" />,
            title: 'Teacher',
            desc: 'Manage classes, input and review grades, view schedules, and access student information.',
            gradient: 'from-sky-600 to-sky-700',
            ring: 'ring-sky-200',
            hover: 'hover:shadow-sky-100',
            badge: 'bg-sky-50 text-sky-700',
            btnBg: 'bg-sky-600 hover:bg-sky-700',
            featured: true,
        },
        {
            href: '/login/staff',
            icon: <Users className="w-10 h-10 text-white" />,
            title: 'Staff',
            desc: 'Administrative access for system management, enrollment processing, and school operations.',
            gradient: 'from-emerald-600 to-emerald-700',
            ring: 'ring-emerald-200',
            hover: 'hover:shadow-emerald-100',
            badge: 'bg-emerald-50 text-emerald-700',
            btnBg: 'bg-emerald-600 hover:bg-emerald-700',
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

                .animate-fade-up { animation: fadeUp 0.7s ease forwards; }
                .animate-fade-up-delay-1 { animation: fadeUp 0.7s 0.15s ease forwards; opacity: 0; }
                .animate-fade-up-delay-2 { animation: fadeUp 0.7s 0.3s ease forwards; opacity: 0; }
                .animate-fade-in { animation: fadeIn 1s ease forwards; }
                .animate-float { animation: floatBubble 6s ease-in-out infinite; }

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
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
                scrolled
                    ? 'bg-green-900/98 backdrop-blur-xl shadow-lg shadow-green-950/20'
                    : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <img src="/SNHS-logo-2.png" alt="SNHS DigiStar" className="h-20 w-auto" />
                        </div>

                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => scrollToSection(id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        activeSection === id
                                            ? 'text-white bg-white/10'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => scrollToSection('portal')}
                            className="hidden md:flex items-center gap-2 bg-white text-green-800 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-50 transition-all shadow-sm hover:shadow-md"
                        >
                            Access Portal
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
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
                    <div className="animate-float absolute top-1/4 right-1/5 w-64 h-64 rounded-full opacity-20 blur-2xl"
                         style={{ background: 'radial-gradient(circle, #34d399, transparent)', animationDelay: '0s' }} />
                    <div className="animate-float absolute bottom-1/3 left-1/6 w-48 h-48 rounded-full opacity-15 blur-2xl"
                         style={{ background: 'radial-gradient(circle, #6ee7b7, transparent)', animationDelay: '2s' }} />

                    {/* Hero Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-32 text-center">
                        {/* Pill badge */}
                        <div className="animate-fade-up mb-8">
                            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-green-200 text-xs font-medium px-4 py-2 rounded-full">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Santor National High School — Digital Platform
                            </span>
                        </div>

                        {/* Logo + headline */}
                        <div className="animate-fade-up-delay-1">
                            <img
                                src="/SNHS-logo-2.png"
                                alt="SNHS DigiStar"
                                className="w-auto h-32 md:h-44 mx-auto object-contain mb-8 drop-shadow-2xl"
                            />
                            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-6">
                                <span className="gradient-text">Empowering</span>
                                <br />
                                <span className="text-white">Education</span>
                            </h1>
                            <p className="text-green-100/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
                                A comprehensive digital platform built to streamline school operations,
                                elevate student outcomes, and connect every part of your school community.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="animate-fade-up-delay-2 flex flex-col sm:flex-row items-center gap-4">
                            <button
                                onClick={() => scrollToSection('portal')}
                                className="flex items-center gap-2 bg-white text-green-800 px-8 py-4 rounded-2xl font-semibold text-base hover:bg-green-50 transition-all shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-[1.02]"
                            >
                                Access Your Portal
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scrollToSection('about')}
                                className="flex items-center gap-2 text-white/80 hover:text-white text-base font-medium px-6 py-4 transition-colors"
                            >
                                Learn More
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Slide dots */}
                    {slides.length > 1 && (
                        <div className="relative z-10 flex justify-center gap-2 pb-8">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i)}
                                    className={`transition-all duration-300 rounded-full ${
                                        i === currentSlide ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Bottom wave */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                            <path d="M0 80L60 69.3C120 58.7 240 37.3 360 32C480 26.7 600 37.3 720 42.7C840 48 960 48 1080 42.7C1200 37.3 1320 26.7 1380 21.3L1440 16V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#fafaf9"/>
                        </svg>
                    </div>
                </section>

                {/* ── ABOUT ── */}
                <section id="about" className="bg-white py-24 lg:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="max-w-2xl mb-16">
                            <p className="section-label mb-4">Who We Are</p>
                            <h2 className="font-display text-4xl md:text-5xl text-gray-900 leading-tight mb-6">
                                Built for schools that believe in better
                            </h2>
                            <p className="text-gray-500 text-lg leading-relaxed">
                                SNHS DigiStar is the all-in-one school management system designed to eliminate paperwork,
                                connect educators with students, and give administrators complete visibility over school operations.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                    className={`card-hover bg-white border border-stone-200 rounded-2xl p-8 hover:border-stone-300 hover:shadow-lg`}
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
                <section id="features" className="bg-stone-50 py-24 lg:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <p className="section-label mb-4">Platform Features</p>
                            <h2 className="font-display text-4xl md:text-5xl text-gray-900 leading-tight mb-4">
                                Everything your school needs
                            </h2>
                            <p className="text-gray-500 text-lg">
                                Powerful tools that make administration effortless and learning meaningful.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {features.map((f) => (
                                <div
                                    key={f.title}
                                    className="card-hover bg-white rounded-2xl p-7 border border-stone-200 hover:shadow-lg hover:border-stone-300 group"
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

                {/* ── PORTAL ACCESS ── */}
                <section id="portal" className="relative py-24 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-green-900 to-emerald-800" />
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }} />

                    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-4">Choose Your Role</p>
                            <h2 className="font-display text-4xl md:text-5xl text-white mb-4 leading-tight">
                                Access the DigiStar Portal
                            </h2>
                            <p className="text-green-100/70 text-lg max-w-xl mx-auto">
                                Select how you're connected to Santor National High School to get started.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {roles.map((role) => (
                                <Link key={role.title} href={role.href} className="group block">
                                    <div className={`role-card bg-white rounded-3xl p-8 shadow-lg ${role.hover} hover:shadow-2xl h-full flex flex-col ${role.featured ? 'ring-2 ring-white/30' : ''}`}>
                                        {role.featured && (
                                            <div className="text-center mb-4">
                                                <span className="bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1 rounded-full">Most Used</span>
                                            </div>
                                        )}

                                        <div className={`bg-gradient-to-br ${role.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 group-hover:rotate-1 transition-all duration-300`}>
                                            {role.icon}
                                        </div>

                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{role.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed flex-grow mb-6">{role.desc}</p>

                                        <div className={`${role.btnBg} text-white flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold transition-colors`}>
                                            Login as {role.title}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Trust note */}
                        <div className="text-center mt-10">
                            <p className="text-green-200/50 text-sm flex items-center justify-center gap-2">
                                <Shield className="w-4 h-4" />
                                Secured with end-to-end encryption. Your data stays private.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="bg-gray-950 text-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                            {/* Brand */}
                            <div className="md:col-span-2">
                                <img src="/SNHS-logo-2.png" alt="SNHS DigiStar" className="h-16 w-auto mb-4 opacity-90" />
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
                                        <a href="mailto:info@snhs.edu.ph" className="hover:text-white transition-colors">
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

                        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-xs">
                            <p>&copy; 2026 Santor National High School. All rights reserved.</p>
                            <p>Powered by SNHS DigiStar</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}