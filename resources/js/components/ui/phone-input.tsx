import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface PhoneInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value?: string
    onChange?: (value: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ className, value = '', onChange, ...props }, ref) => {
        const [displayValue, setDisplayValue] = React.useState('')

        // Format phone number as 0929-468-0105
        const formatPhoneNumber = (input: string): string => {
            // Remove all non-digit characters
            const digits = input.replace(/\D/g, '')
            
            // Limit to 11 digits
            const limited = digits.slice(0, 11)
            
            // Format as 0929-468-0105
            if (limited.length <= 4) {
                return limited
            } else if (limited.length <= 7) {
                return `${limited.slice(0, 4)}-${limited.slice(4)}`
            } else {
                return `${limited.slice(0, 4)}-${limited.slice(4, 7)}-${limited.slice(7)}`
            }
        }

        // Get raw digits from formatted string
        const getRawValue = (formatted: string): string => {
            return formatted.replace(/\D/g, '')
        }

        // Update display value when prop value changes
        React.useEffect(() => {
            if (value !== undefined) {
                const formatted = formatPhoneNumber(value)
                setDisplayValue(formatted)
            }
        }, [value])

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target.value
            const formatted = formatPhoneNumber(input)
            const raw = getRawValue(formatted)
            
            setDisplayValue(formatted)
            
            if (onChange) {
                onChange(raw)
            }
        }

        return (
            <Input
                type="text"
                inputMode="numeric"
                ref={ref}
                value={displayValue}
                onChange={handleChange}
                placeholder="09XX-XXX-XXXX"
                maxLength={13} // 11 digits + 2 dashes
                className={cn(className)}
                {...props}
            />
        )
    }
)

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }
