import { Head, Link } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'

type Props = {
    auth?: {
        user: { id: number; name: string; email: string; role: string }
        admin?: { role: string; position: string }
    }
}

export default function RegistrationSelect({ auth }: Props) {
    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Student Registration" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Registration</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Select the program level to begin registration
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                    {/* JHS Card */}
                    <Link
                        href="/admin/admission/registration/jhs"
                        className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-green-500 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 px-6 pt-8 pb-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-green-500 group-hover:bg-green-600 flex items-center justify-center mb-4 transition-colors shadow-md">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Junior High School</h2>
                            <p className="text-sm text-gray-600">Grades 7 – 10</p>
                        </div>
                        <div className="px-6 py-4 space-y-2">
                            {['Grade 7 (New Students)', 'Grade 8 – 10 (Returning / Transferee)'].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {item}
                                </div>
                            ))}
                        </div>
                        <div className="px-6 pb-5">
                            <div className="w-full text-center bg-green-500 group-hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                                Register JHS Student →
                            </div>
                        </div>
                    </Link>

                    {/* SHS Card */}
                    <Link
                        href="/admin/admission/registration/shs"
                        className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 px-6 pt-8 pb-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500 group-hover:bg-blue-600 flex items-center justify-center mb-4 transition-colors shadow-md">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Senior High School</h2>
                            <p className="text-sm text-gray-600">Grades 11 – 12</p>
                        </div>
                        <div className="px-6 py-4 space-y-2">
                            {[
                                'Academic Track (STEM, ABM, HUMSS, GAS)',
                                'TVL Track (HE, ICT, IA, Agri-Fishery)',
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {item}
                                </div>
                            ))}
                        </div>
                        <div className="px-6 pb-5">
                            <div className="w-full text-center bg-blue-500 group-hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                                Register SHS Student →
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </AdminLayout>
    )
}