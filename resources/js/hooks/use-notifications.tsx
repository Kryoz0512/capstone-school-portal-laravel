import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react'

export type Notification = {
    id: number
    type: string
    title: string
    message: string
    announcement_id: number | null
    is_read: boolean
    created_at: string
    created_at_full: string
}

type NotificationContextValue = {
    notifications: Notification[]
    unreadCount: number
    fetchNotifications: () => Promise<void>
    refreshUnreadCount: () => Promise<void>
    markAsRead: (id: number) => Promise<boolean>
    markAllAsRead: () => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? ''
}

function requestHeaders(): HeadersInit {
    return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
    }
}

function normalizeNotification(notification: Notification): Notification {
    return {
        ...notification,
        is_read: Boolean(notification.is_read),
    }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    const refreshUnreadCount = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications/unread-count', {
                headers: { Accept: 'application/json' },
                cache: 'no-store',
            })

            if (!response.ok) {
                return
            }

            const data = await response.json()
            setUnreadCount(Number(data.count ?? 0))
        } catch {
            /* silent */
        }
    }, [])

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications', {
                headers: { Accept: 'application/json' },
                cache: 'no-store',
            })

            if (!response.ok) {
                return
            }

            const data = await response.json()
            setNotifications(Array.isArray(data) ? data.map(normalizeNotification) : [])
        } catch {
            /* silent */
        }
    }, [])

    useEffect(() => {
        refreshUnreadCount()

        const interval = window.setInterval(refreshUnreadCount, 30_000)

        return () => window.clearInterval(interval)
    }, [refreshUnreadCount])

    const markAsRead = useCallback(async (id: number): Promise<boolean> => {
        setNotifications((previous) =>
            previous.map((notification) =>
                notification.id === id ? { ...notification, is_read: true } : notification,
            ),
        )
        setUnreadCount((previous) => Math.max(0, previous - 1))

        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                headers: requestHeaders(),
            })

            if (!response.ok) {
                await fetchNotifications()
                await refreshUnreadCount()
                return false
            }

            return true
        } catch {
            await fetchNotifications()
            await refreshUnreadCount()
            return false
        }
    }, [fetchNotifications, refreshUnreadCount])

    const markAllAsRead = useCallback(async (): Promise<boolean> => {
        setNotifications((previous) => previous.map((notification) => ({ ...notification, is_read: true })))
        setUnreadCount(0)

        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: requestHeaders(),
            })

            if (!response.ok) {
                await fetchNotifications()
                await refreshUnreadCount()
                return false
            }

            return true
        } catch {
            await fetchNotifications()
            await refreshUnreadCount()
            return false
        }
    }, [fetchNotifications, refreshUnreadCount])

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                fetchNotifications,
                refreshUnreadCount,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications(): NotificationContextValue {
    const context = useContext(NotificationContext)

    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }

    return context
}
