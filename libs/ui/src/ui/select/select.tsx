"use client"
import { Search as SearchIcon, X } from "lucide-react"
import {
  type ComponentProps,
  type ComponentPropsWithRef,
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react"
import { cn } from "../../lib/utils"
import {
  type SelectContentContextValue,
  type SelectItem,
  type SelectQueryContextValue,
  type SelectStateContextValue,
  SelectContentContext,
  SelectQueryContext,
  SelectStateContext,
  useClearBtnAnimation,
  useErrorShake,
  useErrorSlide,
  useFilteredData,
  useHasValue,
  useListStagger,
  useLogoAnimation,
  useSelectContent,
  useSelectQuery,
  useSelectState,
  useSelectedItem
} from "./use-select"

export interface SelectProps<T extends SelectItem = SelectItem> {
  children?: ReactNode
  data?: T[]
  value?: string | number
  defaultValue?: string | number
  onChange?: (e: any) => void
  onValueChange?: (value: any) => void
  onSelect?: (item: T) => void
  onClear?: () => void
  error?: string
  disabled?: boolean
  name?: string
  id?: string
  filterFn?: (item: T, query: string) => boolean
  className?: string
}

function Select<T extends SelectItem = SelectItem>(
  {
    children,
    data = [],
    value: controlledValue,
    defaultValue,
    onChange,
    onValueChange,
    onSelect,
    onClear,
    error,
    disabled = false,
    name,
    id: propId,
    filterFn,
    className
  }: SelectProps<T>,
  ref: React.Ref<HTMLDivElement>
) {
  const generatedId = useId()
  const id = propId || generatedId
  const errorId = `${id}-error`

  /* Controlled vs Uncontrolled value */
  const isControlled = controlledValue !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState<string | number>(defaultValue ?? "")
  const value = isControlled ? controlledValue : uncontrolledValue

  /* Query state for filtering */
  const [query, setQuery] = useState("")

  /* Split hook computations (rule: rerender-split-combined-hooks) */
  const selectedItem = useSelectedItem(data, value)
  const hasValue = useHasValue(value)
  const filteredData = useFilteredData(data, query, filterFn)

  /* Selection action */
  const selectItem = useCallback(
    (item: T) => {
      if (!isControlled) {
        setUncontrolledValue(item.id)
      }
      onSelect?.(item)
      onValueChange?.(item.id)
      onChange?.({
        target: { name, value: item.id },
        currentTarget: { name, value: item.id }
      })
      setQuery("")
    },
    [isControlled, onSelect, onValueChange, onChange, name]
  )

  /* Clear action */
  const clear = useCallback(() => {
    if (!isControlled) {
      setUncontrolledValue("")
    }
    onClear?.()
    onValueChange?.("")
    onChange?.({
      target: { name, value: "" },
      currentTarget: { name, value: "" }
    })
    setQuery("")
  }, [isControlled, onClear, onValueChange, onChange, name])

  /* Logo rendering helper */
  const renderLogo = useCallback((logo: string | ReactNode): ReactNode => {
    if (!logo) return null
    if (typeof logo === "string") {
      if (logo.trim().startsWith("<")) {
        return (
          <div
            className="size-4 shrink-0 flex items-center justify-center [&_svg]:size-full"
            dangerouslySetInnerHTML={{ __html: logo }}
          />
        )
      }
      return <img src={logo} alt="" className="size-4 shrink-0 rounded object-contain" />
    }
    return <div className="size-4 shrink-0 flex items-center justify-center">{logo}</div>
  }, [])

  /* Split context values */
  const stateValue = useMemo<SelectStateContextValue<T>>(
    () => ({
      id,
      errorId,
      name,
      value,
      selectedItem,
      hasValue,
      error,
      disabled,
      selectItem,
      clear,
      renderLogo
    }),
    [id, errorId, name, value, selectedItem, hasValue, error, disabled, selectItem, clear, renderLogo]
  )

  const queryValue = useMemo<SelectQueryContextValue<T>>(
    () => ({
      query,
      setQuery,
      filteredData
    }),
    [query, filteredData]
  )

  return (
    <SelectStateContext value={stateValue}>
      <SelectQueryContext value={queryValue}>
        <div ref={ref} className={cn("flex flex-col gap-1.5 w-full", className)}>
          {children}
        </div>
      </SelectQueryContext>
    </SelectStateContext>
  )
}

/* ---------------------------------------------------------------------------
 * Compound Component: <Select.Preview>
 * Styled identically to the Input component:
 *   - Container: p-4 min-h-16 rounded-xl border border-outline bg-card
 *   - Label with optional indicator
 *   - Logo / icon + selected item name / placeholder
 *   - Clear button (X) when item is selected
 *   - GSAP shake on error
 *   - GSAP scale on clear button
 *   - GSAP pop on logo
 *   - Forwards ref to work seamlessly as Popover.Trigger render prop
 * ------------------------------------------------------------------------- */

export interface SelectPreviewProps extends ComponentPropsWithRef<"div"> {
  label?: string
  placeholder?: string
  error?: string | boolean
  icon?: ReactNode
  endIcon?: ReactNode
  optional?: boolean
  fieldClassName?: string
  labelClassName?: string
  showError?: boolean
  render?: (item: SelectItem | null) => ReactNode
}

export const SelectPreview = forwardRef<HTMLDivElement, SelectPreviewProps>(
  (
    {
      label,
      placeholder = "Seleccionar...",
      error: propError,
      icon,
      endIcon,
      optional,
      className,
      fieldClassName,
      labelClassName,
      showError = false,
      render,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const { id, errorId, error: contextError, selectedItem, hasValue, disabled, clear, renderLogo } = useSelectState()

    const fieldRef = useRef<HTMLDivElement>(null)
    const logoRef = useRef<HTMLDivElement>(null)
    const clearBtnRef = useRef<HTMLButtonElement>(null)
    const errorRef = useRef<HTMLParagraphElement>(null)

    const hasError = !!(propError || contextError)
    const displayError = typeof propError === "string" ? propError : contextError

    // Merge forwarded ref with fieldRef (essential for Popover.Trigger GSAP Flip measurements)
    const handleRef = useCallback(
      (node: HTMLDivElement | null) => {
        fieldRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
      },
      [ref]
    )

    // GSAP animations
    useErrorShake(fieldRef, hasError)
    useLogoAnimation(logoRef, selectedItem?.logo)
    useClearBtnAnimation(clearBtnRef, hasValue)

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div
          ref={handleRef}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="dialog"
          aria-invalid={hasError ? true : undefined}
          aria-describedby={hasError ? errorId : undefined}
          onKeyDown={(e) => {
            onKeyDown?.(e)
            if (e.defaultPrevented) return
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              e.currentTarget.click()
            }
          }}
          className={cn(
            "relative flex flex-col justify-center bg-card border border-outline p-4 min-h-16 rounded-xl w-full transition-all duration-200 ease-in-out cursor-pointer hover:border-outline-hover focus-within:ring-1 focus-within:ring-ring/50 outline-none",
            disabled && "opacity-50 cursor-not-allowed",
            hasError && "border-destructive focus-within:ring-destructive/50",
            className,
            fieldClassName
          )}
          {...props}>
          {(label || optional) && (
            <div className="flex items-center justify-between gap-2">
              {label && (
                <label
                  htmlFor={id}
                  className={cn(
                    "text-xs font-medium text-muted-foreground select-none cursor-pointer pointer-events-none",
                    hasError && "text-destructive",
                    labelClassName
                  )}>
                  {label}
                </label>
              )}
              {optional && <span className="text-[11px] text-muted-foreground select-none">(Opcional)</span>}
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-0.5">
            {selectedItem?.logo ? (
              <div ref={logoRef} className="text-muted-foreground shrink-0 flex items-center justify-center">
                {renderLogo(selectedItem.logo)}
              </div>
            ) : icon ? (
              <div className="text-muted-foreground shrink-0 flex items-center justify-center pointer-events-none">
                {icon}
              </div>
            ) : null}

            {render ? (
              render(selectedItem)
            ) : (
              <span
                className={cn(
                  "w-full bg-transparent p-0 text-sm truncate select-none",
                  selectedItem ? "text-foreground font-normal" : "text-muted-foreground/60"
                )}>
                {selectedItem ? selectedItem.name : placeholder}
              </span>
            )}

            {hasValue && !disabled ? (
              <button
                ref={clearBtnRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  clear()
                }}
                tabIndex={-1}
                aria-label="Limpiar selección"
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-1 transition-colors shrink-0 flex items-center justify-center cursor-pointer">
                <X className="size-3.5" />
              </button>
            ) : endIcon ? (
              <div className="text-muted-foreground shrink-0 flex items-center justify-center pointer-events-none">
                {endIcon}
              </div>
            ) : null}
          </div>
        </div>

        {showError && displayError && (
          <p
            ref={errorRef}
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-destructive text-xs font-medium pl-1">
            {displayError}
          </p>
        )}
      </div>
    )
  }
)

/* ---------------------------------------------------------------------------
 * Compound Component: <Select.Input>
 * The filter/search text input placed inside the Popover
 * ------------------------------------------------------------------------- */

export interface SelectInputProps extends Omit<ComponentPropsWithRef<"input">, "size"> {
  containerClassName?: string
  icon?: ReactNode
}

export const SelectInput = forwardRef<HTMLInputElement, SelectInputProps>(
  (
    { className, containerClassName, icon, placeholder = "Escribe para buscar...", autoFocus = true, ...props },
    ref
  ) => {
    const { query, setQuery } = useSelectQuery()
    const { disabled } = useSelectState()
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => inputRef.current!)

    // Auto-focus when popover opens and input mounts
    useEffect(() => {
      if (autoFocus) {
        const timer = setTimeout(() => {
          inputRef.current?.focus()
        }, 50)
        return () => clearTimeout(timer)
      }
    }, [autoFocus])

    return (
      <div
        className={cn(
          "relative flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-outline focus-within:ring-1 focus-within:ring-ring/50 transition-all duration-150",
          containerClassName
        )}>
        <div className="text-muted-foreground shrink-0 flex items-center justify-center pointer-events-none">
          {icon ?? <SearchIcon className="size-4" />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            "w-full bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed truncate",
            className
          )}
          {...props}
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            tabIndex={-1}
            aria-label="Limpiar texto"
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-0.5 transition-colors shrink-0 flex items-center justify-center cursor-pointer">
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    )
  }
)

/* ---------------------------------------------------------------------------
 * Compound Component: <Select.Content>
 * The container inside Popover, wraps Select.Input and Select.List
 * ------------------------------------------------------------------------- */

export interface SelectContentProps extends ComponentProps<"div"> {
  empty?: ReactNode
}

export function SelectContent({ children, empty, className, ...props }: SelectContentProps) {
  const ctxValue = useMemo<SelectContentContextValue>(() => ({ empty }), [empty])

  return (
    <SelectContentContext.Provider value={ctxValue}>
      <div className={cn("flex flex-col gap-2.5 w-full min-w-[280px]", className)} {...props}>
        {children}
      </div>
    </SelectContentContext.Provider>
  )
}

export interface SelectListProps<T extends SelectItem = SelectItem> extends Omit<ComponentProps<"div">, "children"> {
  children?: ReactNode | ((item: T, isSelected: boolean) => ReactNode)
  empty?: ReactNode
  itemClassName?: string
  onSelect?: (item: T) => void
}

export function SelectList<T extends SelectItem = SelectItem>({
  children,
  empty: propEmpty,
  className,
  itemClassName,
  onSelect,
  ...props
}: SelectListProps<T>) {
  const { filteredData, query } = useSelectQuery<T>()
  const { value, selectItem, renderLogo } = useSelectState<T>()
  const contentCtx = useSelectContent()
  const listRef = useRef<HTMLDivElement>(null)

  useListStagger(listRef, filteredData.length)

  if (filteredData.length === 0) {
    const emptyElement = propEmpty ?? contentCtx?.empty ?? (
      <div className="py-6 text-center flex flex-col items-center gap-2">
        <SearchIcon className="size-7 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">
          No se encontraron resultados
          {query ? (
            <>
              {" "}
              para <span className="font-medium text-foreground">"{query}"</span>
            </>
          ) : (
            "."
          )}
        </p>
      </div>
    )
    return <div className={cn("w-full", className)}>{emptyElement}</div>
  }

  return (
    <div
      ref={listRef}
      role="listbox"
      tabIndex={-1}
      className={cn("max-h-60 overflow-y-auto px-1 py-1 flex flex-col gap-0.5", className)}
      {...props}>
      {filteredData.map((item) => {
        const isSelected = String(item.id) === String(value)
        const handleSelect = () => {
          onSelect?.(item)
          selectItem(item)
        }

        if (typeof children === "function") {
          return (
            <button
              key={item.id}
              type="button"
              data-search-item
              role="option"
              aria-selected={isSelected}
              onClick={handleSelect}
              className="cursor-pointer w-full text-left bg-transparent border-0 p-0 outline-none">
              {children(item, isSelected)}
            </button>
          )
        }

        return (
          <button
            key={item.id}
            type="button"
            data-search-item
            role="option"
            aria-selected={isSelected}
            onClick={handleSelect}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-medium flex items-center gap-2.5 cursor-pointer outline-none",
              isSelected
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              itemClassName
            )}>
            {item.logo && (
              <div className="size-4 shrink-0 flex items-center justify-center [&_svg]:size-full">
                {renderLogo(item.logo)}
              </div>
            )}
            <span className="truncate flex-1">{item.name}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Compound Component: <Select.Error>
 * Displays validation error with GSAP slide-in effect
 * ------------------------------------------------------------------------- */

export interface SelectErrorProps extends ComponentProps<"p"> {
  message?: string
}

export function SelectError({ children, message, className, ...props }: SelectErrorProps) {
  const { error, errorId } = useSelectState()
  const displayError = children ?? message ?? error
  const errorRef = useRef<HTMLParagraphElement>(null)

  useErrorSlide(errorRef, displayError ? String(displayError) : undefined)

  if (!displayError) return null

  return (
    <p
      ref={errorRef}
      id={errorId}
      role="alert"
      aria-live="polite"
      className={cn("text-destructive text-xs font-medium pl-1", className)}
      {...props}>
      {displayError}
    </p>
  )
}

Select.Preview = SelectPreview
Select.Input = SelectInput
Select.Content = SelectContent
Select.List = SelectList
Select.Error = SelectError

export { Select }
