import { Head, Link } from '@inertiajs/react'
import { GraduationCap, Users, BookOpen, Award, Target, Eye, Heart, Sparkles, BookMarked, Trophy, Users2 } from 'lucide-react'
import { useState, useEffect } from 'react'

type Props = {
    slides?: string[]
}

export default function Portal({ slides = [] }: Props) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [scrolled, setScrolled] = useState(false)

    // Slideshow effect
    useEffect(() => {
        if (slides.length <= 1) return

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [slides.length])

    // Scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <>
            <Head title="SNHS DigiStar - Portal" />
            
            {/* Navigation Bar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-green-800/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-6 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <img src="/SNHS-logo-2.png" alt="SNHS DigiStar" className="h-28 w-auto" />
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <button 
                                onClick={() => scrollToSection('home')}
                                className="font-medium text-white hover:text-green-200 transition-colors"
                            >
                                Home
                            </button>
                            <button 
                                onClick={() => scrollToSection('about')}
                                className="font-medium text-white hover:text-green-200 transition-colors"
                            >
                                About
                            </button>
                            <button 
                                onClick={() => scrollToSection('features')}
                                className="font-medium text-white hover:text-green-200 transition-colors"
                            >
                                Features
                            </button>
                            <button 
                                onClick={() => scrollToSection('portal')}
                                className="font-medium text-white hover:text-green-200 transition-colors"
                            >
                                Portal
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="min-h-screen relative overflow-x-hidden">
                {/* Slideshow Background */}
                {slides.length > 0 ? (
                    <div className="absolute inset-0">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ${
                                    index === currentSlide ? 'opacity-40' : 'opacity-0'
                                }`}
                            >
                                <img
                                    src={slide}
                                    alt={`Slide ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-green-800"></div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-green-800/90 to-green-700/90"></div>

                {/* Decorative Elements */}
                <div className="absolute top-20 right-20 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-600/10 rounded-full blur-3xl"></div>

                {/* Hero Section */}
                <div id="home" className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
                    {/* Header */}
                    <div className="text-center mb-8 animate-fade-in">
                        <img 
                            src="/SNHS-logo-2.png" 
                            alt="SNHS DigiStar" 
                            className="w-auto h-48 md:h-64 mx-auto drop-shadow-2xl object-contain mb-6"
                        />
                        <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
                            Empowering Education Through Digital Innovation
                        </p>
                        <button 
                            onClick={() => scrollToSection('portal')}
                            className="bg-white text-green-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                        >
                            Access Portal
                        </button>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>

                    {/* Slide Indicators */}
                    {slides.length > 1 && (
                        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex justify-center gap-2">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`transition-all duration-300 ${
                                        index === currentSlide
                                            ? 'w-8 h-2 bg-white rounded-full'
                                            : 'w-2 h-2 bg-white/50 hover:bg-white/75 rounded-full'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* About Section */}
                <div id="about" className="relative z-10 bg-white py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                About SNHS DigiStar
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                A comprehensive digital platform designed to streamline school operations and enhance the educational experience
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                            {/* Mission */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                                    <Target className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    To provide quality education through innovative digital solutions, fostering academic excellence and holistic development for every student.
                                </p>
                            </div>

                            {/* Vision */}
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                                    <Eye className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    To be a leading institution in digital education, empowering students with knowledge and skills for a successful future in the modern world.
                                </p>
                            </div>

                            {/* Values */}
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Excellence, Integrity, Innovation, Collaboration, and Compassion guide everything we do in nurturing future leaders.
                                </p>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="relative z-10 bg-gradient-to-br from-gray-50 to-gray-100 py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Platform Features
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Discover the powerful tools and features that make SNHS DigiStar the perfect solution for modern education
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                                    <GraduationCap className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Student Management</h3>
                                <p className="text-gray-600">
                                    Comprehensive student records, enrollment tracking, and academic progress monitoring in one place.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                                    <BookOpen className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Grade Management</h3>
                                <p className="text-gray-600">
                                    Easy grade input, calculation, and report generation for teachers with real-time updates.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Class Scheduling</h3>
                                <p className="text-gray-600">
                                    Manage class schedules, room assignments, and teacher-subject allocations efficiently.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                                    <Award className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Performance Tracking</h3>
                                <p className="text-gray-600">
                                    Detailed analytics and reports on student performance, attendance, and academic achievements.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                                    <Sparkles className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Digital Records</h3>
                                <p className="text-gray-600">
                                    Secure cloud-based storage for all academic records, documents, and student information.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                                    <Trophy className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Accreditation Support</h3>
                                <p className="text-gray-600">
                                    Tools and features designed to support school accreditation requirements and compliance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Portal Section */}
                <div id="portal" className="relative z-10 bg-gradient-to-br from-green-900/95 via-green-800/95 to-green-700/95 py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Access Portal
                            </h2>
                            <p className="text-xl text-green-100 max-w-3xl mx-auto">
                                Select your role to continue to the SNHS DigiStar platform
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Student Card */}
                            <Link href="/login/student" className="group">
                                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border-2 border-white/50 hover:border-purple-400 overflow-hidden">
                                    {/* Gradient Background on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/5 group-hover:to-purple-600/5 transition-all duration-500"></div>
                                    
                                    <div className="relative flex flex-col items-center text-center">
                                        {/* Icon */}
                                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
                                            <GraduationCap className="w-12 h-12 text-white" />
                                        </div>
                                        
                                        {/* Title */}
                                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                            Student
                                        </h3>
                                        
                                        {/* Description */}
                                        <p className="text-gray-600 leading-relaxed mb-8 min-h-[60px]">
                                            Access your grades, class schedules, enrollment status, and student records
                                        </p>
                                        
                                        {/* Button */}
                                        <div className="w-full">
                                            <div className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold group-hover:bg-purple-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                                                Login as Student
                                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* Teacher Card */}
                            <Link href="/login/teacher" className="group">
                                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border-2 border-white/50 hover:border-blue-400 overflow-hidden">
                                    {/* Gradient Background on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/5 group-hover:to-blue-600/5 transition-all duration-500"></div>
                                    
                                    <div className="relative flex flex-col items-center text-center">
                                        {/* Icon */}
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
                                            <BookOpen className="w-12 h-12 text-white" />
                                        </div>
                                        
                                        {/* Title */}
                                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                            Teacher
                                        </h3>
                                        
                                        {/* Description */}
                                        <p className="text-gray-600 leading-relaxed mb-8 min-h-[60px]">
                                            Manage classes, input grades, view schedules, and access student information
                                        </p>
                                        
                                        {/* Button */}
                                        <div className="w-full">
                                            <div className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold group-hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                                                Login as Teacher
                                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* Staff Card */}
                            <Link href="/login/staff" className="group">
                                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border-2 border-white/50 hover:border-green-400 overflow-hidden">
                                    {/* Gradient Background on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-600/0 group-hover:from-green-500/5 group-hover:to-green-600/5 transition-all duration-500"></div>
                                    
                                    <div className="relative flex flex-col items-center text-center">
                                        {/* Icon */}
                                        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
                                            <Users className="w-12 h-12 text-white" />
                                        </div>
                                        
                                        {/* Title */}
                                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                            Staff
                                        </h3>
                                        
                                        {/* Description */}
                                        <p className="text-gray-600 leading-relaxed mb-8 min-h-[60px]">
                                            Administrative access, system management, and school operations control
                                        </p>
                                        
                                        {/* Button */}
                                        <div className="w-full">
                                            <div className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold group-hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                                                Login as Staff
                                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="relative z-10 bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <div>
                                <img src="/SNHS-logo-2.png" alt="SNHS DigiStar" className="h-20 w-auto mb-4" />
                                <p className="text-gray-400 text-sm">
                                    Empowering education through digital innovation and excellence.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Quick Links</h4>
                                <ul className="space-y-2 text-gray-400 text-sm">
                                    <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Home</button></li>
                                    <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">About Us</button></li>
                                    <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                                    <li><button onClick={() => scrollToSection('portal')} className="hover:text-white transition-colors">Portal</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Contact Information</h4>
                                <ul className="space-y-2 text-gray-400 text-sm">
                                    <li>Bongabon, Nueva Ecija</li>
                                    <li>Philippines 3128</li>
                                    <li>Email: info@snhs.edu.ph</li>
                                    <li>Phone: (123) 456-7890</li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                            <p>&copy; 2026 Santor National High School. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}
