
import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { Select, SelectContent, SelectTrigger, SelectValue } from "./select"

type Option = {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className={className}>
      <Select open={open} onOpenChange={setOpen}>
        <SelectTrigger
          aria-expanded={open}
          className="w-full h-auto flex flex-wrap min-h-10"
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 && (
              <SelectValue placeholder={placeholder} />
            )}
            {selected.map((value) => {
              const option = options.find((option) => option.value === value)
              return (
                <Badge
                  key={value}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {option?.label || value}
                  <button
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={() => handleUnselect(value)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              )
            })}
          </div>
        </SelectTrigger>
        <SelectContent>
          <Command loop>
            <CommandPrimitive.Input
              value={inputValue}
              onValueChange={setInputValue}
              className="h-9 px-3 py-2 text-sm w-full border-0 bg-transparent focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
              placeholder="Search options..."
            />
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      className={`h-4 w-4 rounded-sm border flex items-center justify-center ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-input"
                      }`}
                    >
                      {isSelected && (
                        <X className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </Command>
        </SelectContent>
      </Select>
    </div>
  )
}
