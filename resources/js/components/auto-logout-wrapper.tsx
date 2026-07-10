import React, { ReactNode } from 'react'
import { useAutoLogout } from '@/hooks/useAutoLogout'

type AutoLogoutWrapperProps = {
    children: ReactNode
}

export default function AutoLogoutWrapper({ children }: AutoLogoutWrapperProps) {
    // 30 seconds idle time, 5 seconds warning time
    const { isWarning, timeRemaining, resetIdleTimer } = useAutoLogout(30000, 5000)

    return (
        <>
            {children}

            {isWarning && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={resetIdleTimer}>
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform animate-in fade-in zoom-in duration-200"
                        onClick={(e) => {
                            // Clicking inside the modal also resets the timer
                            e.stopPropagation();
                            resetIdleTimer();
                        }}
                    >
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Are you still there?</h2>
                        <p className="text-sm text-gray-600 mb-6">
                            You have been inactive for a while. You will be logged out in{' '}
                            <span className="font-bold text-red-600 text-lg">{timeRemaining}</span> seconds.
                        </p>
                        <button
                            onClick={resetIdleTimer}
                            className="w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            Stay Logged In
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
