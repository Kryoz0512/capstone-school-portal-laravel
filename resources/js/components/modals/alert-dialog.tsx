import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AlertDialogProps {
    open: boolean
    onClose: () => void
    title: string
    message: string | string[]
    type?: AlertType
}

export function AlertDialog({ open, onClose, title, message, type = 'info' }: AlertDialogProps) {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-12 h-12 text-green-500" />
            case 'error':
                return <XCircle className="w-12 h-12 text-red-500" />
            case 'warning':
                return <AlertCircle className="w-12 h-12 text-yellow-500" />
            default:
                return <AlertCircle className="w-12 h-12 text-blue-500" />
        }
    }

    const getColorClasses = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200'
            case 'error':
                return 'bg-red-50 border-red-200'
            case 'warning':
                return 'bg-yellow-50 border-yellow-200'
            default:
                return 'bg-blue-50 border-blue-200'
        }
    }

    const getTitleColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-900'
            case 'error':
                return 'text-red-900'
            case 'warning':
                return 'text-yellow-900'
            default:
                return 'text-blue-900'
        }
    }

    const getMessageColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-800'
            case 'error':
                return 'text-red-800'
            case 'warning':
                return 'text-yellow-800'
            default:
                return 'text-blue-800'
        }
    }

    const messages = Array.isArray(message) ? message : [message]

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <div className={`${getColorClasses()} border rounded-lg p-6`}>
                    <div className="flex flex-col items-center text-center space-y-4">
                        {getIcon()}
                        
                        <DialogHeader className="space-y-2">
                            <DialogTitle className={`text-xl font-bold ${getTitleColor()}`}>
                                {title}
                            </DialogTitle>
                        </DialogHeader>

                        <DialogDescription className="space-y-2">
                            {messages.map((msg, index) => (
                                <p key={index} className={`text-sm ${getMessageColor()}`}>
                                    {msg}
                                </p>
                            ))}
                        </DialogDescription>

                        <Button
                            onClick={onClose}
                            className="w-full mt-4"
                            variant={type === 'error' ? 'destructive' : 'default'}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
