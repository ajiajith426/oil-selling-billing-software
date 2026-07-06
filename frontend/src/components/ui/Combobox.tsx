import * as React from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './Popover'
import { cn } from '@/utils/cn'

interface Option {
  value: any
  label: string
}

interface ComboboxProps {
  options: Option[]
  value?: any
  onChange: (val: any) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No option found.',
  disabled = false,
  className
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const selectedOption = options.find((o) => String(o.value) === String(value))

  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    const q = search.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, search])

  React.useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/80 dark:text-white transition-all duration-200 text-left font-normal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
            !selectedOption && 'text-gray-400 dark:text-gray-500',
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-gray-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 border border-gray-150 dark:border-gray-800 shadow-xl rounded-xl bg-white dark:bg-gray-900 overflow-hidden" align="start">
        <div className="flex items-center border-b border-gray-100 dark:border-gray-800 px-3 py-2 bg-gray-50/50 dark:bg-gray-950/20">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-gray-505" />
          <input
            className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
          {filteredOptions.map((option) => {
            const isSelected = String(option.value) === String(value)
            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'relative flex w-full cursor-pointer select-none items-center rounded-lg px-2.5 py-2 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left dark:text-gray-100',
                  isSelected && 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/20 dark:text-blue-400'
                )}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4 shrink-0',
                    isSelected ? 'opacity-100 text-blue-600 dark:text-blue-400' : 'opacity-0'
                  )}
                />
                <span className="truncate">{option.label}</span>
              </button>
            )
          })}
          {filteredOptions.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 px-2">
              {emptyMessage}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
