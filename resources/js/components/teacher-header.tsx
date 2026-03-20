type HeaderProps = {
    user?: {
        name: string
        email: string
        role: string
    }
}

export default function TeacherHeader({ user }: HeaderProps) {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    })

    return (
        <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">{currentDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                                {user?.name || 'Prof. Ramon Garcia'}
                            </p>
                            <p className="text-xs text-gray-500">Teacher</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
