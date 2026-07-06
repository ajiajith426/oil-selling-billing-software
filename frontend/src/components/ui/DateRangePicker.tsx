import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { Popover, PopoverContent, PopoverTrigger } from './Popover'
import { Calendar } from './Calendar'
import { cn } from '@/utils/cn'

interface DateRangePickerProps {
  fromDate?: string
  toDate?: string
  onChange: (range: { from: string; to: string }) => void
  className?: string
}

export function DateRangePicker({
  fromDate,
  toDate,
  onChange,
  className
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const range: DateRange | undefined = React.useMemo(() => {
    return {
      from: fromDate ? parseISO(fromDate) : undefined,
      to: toDate ? parseISO(toDate) : undefined
    }
  }, [fromDate, toDate])

  const handleSelect = (r: DateRange | undefined) => {
    if (r?.from) {
      const fromStr = formatDateString(r.from)
      const toStr = r.to ? formatDateString(r.to) : fromStr
      onChange({ from: fromStr, to: toStr })
    }
  }

  const formatDateString = (d: Date) => {
    const offset = d.getTimezoneOffset()
    const localDate = new Date(d.getTime() - (offset * 60 * 1000))
    return localDate.toISOString().split('T')[0]
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center justify-between gap-3 rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/80 dark:text-white transition-all duration-200 text-left font-normal cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 opacity-50 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {range?.from ? (
                range.to ? (
                  <>
                    {format(range.from, 'LLL dd, yyyy')} - {format(range.to, 'LLL dd, yyyy')}
                  </>
                ) : (
                  format(range.from, 'LLL dd, yyyy')
                )
              ) : (
                'Pick a date range'
              )}
            </span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={range?.from}
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
