import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './Popover'
import { Calendar } from './Calendar'
import { cn } from '@/utils/cn'

interface DatePickerProps {
  value?: string
  onChange: (val: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  className
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const date = value ? parseISO(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/80 dark:text-white transition-all duration-200 text-left font-normal',
            !value && 'text-gray-400 dark:text-gray-500',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <span>{date ? format(date, 'PPP') : placeholder}</span>
          <CalendarIcon className="ml-2 h-4 w-4 opacity-50 text-gray-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              const offset = d.getTimezoneOffset()
              const localDate = new Date(d.getTime() - (offset * 60 * 1000))
              const str = localDate.toISOString().split('T')[0]
              onChange(str)
              setOpen(false)
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
