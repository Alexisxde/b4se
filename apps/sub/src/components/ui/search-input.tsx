"use client"
import useClickOutside from "@/hooks/use-click-outside"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useId, useRef, useState, type ComponentPropsWithoutRef } from "react"

// type DataItem = {
// 	id: string
// 	name: string
// 	logo?: string
// }

type SearchInputProps = {
  label?: string
  error?: string
  onClear?: () => void
  data?: any[]
  onSelect?: (item: any) => void
} & ComponentPropsWithoutRef<"input">

export function SearchInput({
  label = "Buscar",
  className,
  error,
  value,
  onChange,
  onClear,
  data = [],
  onSelect,
  placeholder = "Escribe para buscar...",
  ...props
}: SearchInputProps) {
  const id = useId()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null!)

  useClickOutside(containerRef, () => {
    setIsOpen(false)
  })

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else if (onChange) {
      onChange({
        target: { name: props.name, value: "" },
        currentTarget: { name: props.name, value: "" }
      } as any)
    }
    setIsOpen(false)
  }

  const hasValue = value && String(value).length > 0
  const selectedItem = data.find((item) => item.id === value)
  const displayValue = selectedItem ? selectedItem.name : value || ""

  const filteredData = data.filter((item) => item.name.toLowerCase().includes(String(displayValue).toLowerCase()))

  const handleSelect = (item: any) => {
    if (onSelect) {
      onSelect(item)
    } else if (onChange) {
      onChange({
        target: { name: props.name, value: item.id },
        currentTarget: { name: props.name, value: item.id }
      } as any)
    }
    setIsOpen(false)
  }

  return (
    <div className="w-full max-w-sm relative" ref={containerRef}>
      <motion.label
        animate={error ? { x: [0, -24, 24, -24, 24, 0] } : { x: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        htmlFor={id}
        className={cn(
          "relative flex flex-col gap-1 bg-card shadow-[0_0_0_.5px_#0000000d,0_.5px_2.5px_#00000029] dark:shadow-[0_0_0_.5px_#2d372d,0_.5px_2.5px_#00000029] p-4 h-18 rounded-xl w-full focus-within:ring-2 focus-within:ring-input transition-all duration-200 ease-in-out cursor-text",
          { "ring-2 ring-destructive focus-within:ring-destructive": error }
        )}>
        <span className={cn("text-xs font-medium text-label")}>{label}</span>
        <div className="relative flex items-center w-full mt-0.5">
          <AnimatePresence mode="wait">
            {selectedItem?.logo && (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="mr-2 size-3 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: selectedItem.logo }}
              />
            )}
          </AnimatePresence>
          <input
            id={id}
            {...props}
            value={displayValue}
            autoComplete="off"
            readOnly={!!selectedItem}
            onChange={(e) => {
              if (!selectedItem) {
                onChange?.(e)
                setIsOpen(true)
              }
            }}
            onFocus={() => {
              if (!selectedItem) setIsOpen(true)
            }}
            placeholder={placeholder}
            className={cn(
              "w-full bg-transparent focus:outline-none text-foreground text-sm pt-0 pb-0 pr-8",
              !!selectedItem && "cursor-default",
              className
            )}
          />
          {hasValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              type="button"
              className="absolute right-0 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground">
              <X className="size-3" />
            </motion.button>
          )}
        </div>
      </motion.label>
      <AnimatePresence>
        {isOpen && !selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            className={cn(
              "absolute top-[calc(100%+8px)] left-0 w-full bg-card border border-border shadow-xl rounded-2xl z-20 overflow-hidden py-2",
              {
                "top-[calc(100%-24px)]": error
              }
            )}>
            <div className="max-h-60 overflow-y-auto px-2">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-muted text-muted-foreground font-medium flex items-center gap-2">
                    {item.logo && (
                      <div
                        className="[&_svg]:size-4 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: item.logo }}
                      />
                    )}
                    <span>{item.name}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-8 text-center flex flex-col items-center gap-2">
                  <Search className="size-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">
                    No se encontraron resultados para <br />
                    <span className="text-primary font-medium">"{displayValue}"</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-destructive text-xs my-3">
          {error}
        </motion.p>
      )}
    </div>
  )
}

export default SearchInput
