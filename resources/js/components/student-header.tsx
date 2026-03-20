import { Calendar } from 'lucide-react'

type StudentHeaderProps = {
    user?: {
        name: string
        email: string
        role: string
    }
}

export default function StudentHeader({ user }: StudentHeaderProps) {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-8 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{currentDate}</span>
                    </div>
                    
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'Student'}</p>
                        <p className="text-xs text-gray-500">Student</p>
                    </div>
                </div>
            </div>
        </header>
    )
}
