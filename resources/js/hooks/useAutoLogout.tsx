import { useState, useEffect, useCallback, useRef } from 'react'
import { router } from '@inertiajs/react'

export function useAutoLogout(idleTimeMs = 1800000, warningTimeMs = 5000) {
    const [isWarning, setIsWarning] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(warningTimeMs / 1000)
    
    const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const warningIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const clearTimers = useCallback(() => {
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
        if (warningIntervalRef.current) clearInterval(warningIntervalRef.current)
    }, [])

    const handleLogout = useCallback(() => {
        clearTimers()
        router.post('/logout')
    }, [clearTimers])

    const startWarningTimer = useCallback(() => {
        setIsWarning(true)
        setTimeRemaining(warningTimeMs / 1000)

        warningIntervalRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleLogout()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }, [warningTimeMs, handleLogout])

    const resetIdleTimer = useCallback(() => {
        clearTimers()
        setIsWarning(false)
        setTimeRemaining(warningTimeMs / 1000)

        idleTimeoutRef.current = setTimeout(() => {
            startWarningTimer()
        }, idleTimeMs)
    }, [clearTimers, idleTimeMs, warningTimeMs, startWarningTimer])

    useEffect(() => {
        // Events to monitor for activity
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']

        const handleUserActivity = () => {
            // Only reset if we are not already logging out or if we are in warning state
            resetIdleTimer()
        }

        // Start initial timer
        resetIdleTimer()

        // Attach listeners
        events.forEach((event) => {
            window.addEventListener(event, handleUserActivity, { passive: true })
        })

        return () => {
            clearTimers()
            events.forEach((event) => {
                window.removeEventListener(event, handleUserActivity)
            })
        }
    }, [resetIdleTimer, clearTimers])

    return {
        isWarning,
        timeRemaining,
        resetIdleTimer
    }
}
