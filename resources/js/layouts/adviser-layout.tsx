import { ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import AdviserSidebar from '@/components/adviser-sidebar'
import AdviserHeader from '@/components/adviser-header'

type AdviserLayoutProps = {
    children: ReactNode
    user?: {
        name: string
        email: string
        role: string
    }
    teacher?: {
        profile_picture?: string | null
    }
}

export default function AdviserLayout({ children, user }: AdviserLayoutProps) {
    const { auth } = usePage<{ auth: { teacher?: { profile_picture?: string | null } } }>().props

    return (
        <div className="flex min-h-screen bg-white">
            <AdviserSidebar />

            <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
                <AdviserHeader user={user} teacher={auth?.teacher} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}
