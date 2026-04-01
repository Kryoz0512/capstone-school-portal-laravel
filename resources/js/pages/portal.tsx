import { Head, Link } from '@inertiajs/react'
import { GraduationCap, Users, BookOpen } from 'lucide-react'
import { useState, useEffect } from 'react'

type Props = {
    slides?: string[]
}

export default function Portal({ slides = [] }: Props) {
    const [currentSlide, setCurrentSlide] = useState(0)

    // Slideshow effect
    useEffect(() => {
        if (slides.length <= 1) return

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [slides.length])

    return (
        <>
            <Head title="SNHS DigiStar - Portal" />
            
            <div className="min-h-screen relative overflow-hidden">
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

                {/* Content */}
                <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
                    {/* Header */}
                    <div className="text-center mb-12 animate-fade-in">
                        <img 
                            src="/SNHS-logo-2.png" 
                            alt="SNHS DigiStar Logo" 
                            className="w-auto h-64 md:h-80 mx-auto drop-shadow-2xl object-contain"
                        />
                    </div>

                    {/* Role Selection Cards */}
                    <div className="w-full max-w-6xl">
                        <h2 className="text-2xl md:text-3xl font-semibold text-white text-center mb-8">
                            Select Your Role to Continue
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Student Card */}
                            <Link href="/login/student" className="group">
                                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border-2 border-white/50 hover:border-blue-400 overflow-hidden">
                                    {/* Gradient Background on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/5 group-hover:to-blue-600/5 transition-all duration-500"></div>
                                    
                                    <div className="relative flex flex-col items-center text-center">
                                        {/* Icon */}
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
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
                                            <div className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold group-hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center gap-2">
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
                                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border-2 border-white/50 hover:border-green-400 overflow-hidden">
                                    {/* Gradient Background on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-600/0 group-hover:from-green-500/5 group-hover:to-green-600/5 transition-all duration-500"></div>
                                    
                                    <div className="relative flex flex-col items-center text-center">
                                        {/* Icon */}
                                        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
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
                                            <div className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold group-hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2">
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
                                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border-2 border-white/50 hover:border-purple-400 overflow-hidden">
                                    {/* Gradient Background on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/5 group-hover:to-purple-600/5 transition-all duration-500"></div>
                                    
                                    <div className="relative flex flex-col items-center text-center">
                                        {/* Icon */}
                                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
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
                                            <div className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold group-hover:bg-purple-700 transition-colors shadow-lg flex items-center justify-center gap-2">
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

                    {/* Slide Indicators */}
                    {slides.length > 1 && (
                        <div className="flex justify-center gap-2 mt-16">
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

                    {/* Footer */}
                    <div className="mt-16 text-center">
                        <p className="text-green-100/80 text-sm">
                            &copy; 2026 Santor National High School. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
