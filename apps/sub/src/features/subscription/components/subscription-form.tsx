"use client"
import { Calendar, CalendarContent, CalendarMessageError, CalendarTrigger } from "@/components/ui/calendar-input"
import Textarea from "@/components/ui/textarea"
import { useServices } from "@/features/service/hooks/use-services"
import { Button, Input, Popover, Select } from "@b4se/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { useSubscriptionCategory } from "../hooks/use-categories"
import useCreateSubscription from "../hooks/use-create-subscription"
import { useSubscriptionPaymentMethods } from "../hooks/use-payment-methods"
import { subscriptionSchema, type SubscriptionFormValues } from "../schemas/subscription"

type Props = {
  onOpenChange: (open: boolean) => void
}

const period = [
  { id: "month", name: "Mes" },
  { id: "year", name: "Año" }
]

export default function SubscriptionForm({ onOpenChange }: Props) {
  const { mutateAsync } = useCreateSubscription()
  const { data: paymentMethods } = useSubscriptionPaymentMethods()
  const { data: categories = [] } = useSubscriptionCategory()
  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
    control,
    watch
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema) as any,
    defaultValues: {
      serviceId: "",
      amount: undefined,
      categoryId: "",
      startDate: "",
      period: undefined,
      notification: false,
      paymentMethodId: "",
      note: ""
    }
  })

  const serviceValue = watch("serviceId")
  const { data: services = [] } = useServices(serviceValue)

  const onSubmit: SubmitHandler<SubscriptionFormValues> = async (data) => {
    try {
      const isValidService = services.some((s) => s.id === data.serviceId)
      if (!isValidService) return setError("serviceId", { message: "Debes seleccionar un servicio de la lista." })
      await mutateAsync(data)
      onOpenChange(false)
      reset()
    } catch (_) {}
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <Controller
        name="serviceId"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Select {...field} data={services} error={errors.serviceId?.message}>
            <Popover>
              <Popover.Trigger
                render={<Select.Preview label="Suscripción" placeholder="Seleccione su suscripción" />}
              />
              <Popover.Content>
                <Popover.Body>
                  <Select.Content>
                    <Select.Input />
                    <Select.List />
                  </Select.Content>
                </Popover.Body>
              </Popover.Content>
            </Popover>
          </Select>
        )}
      />
      <div className="flex items-start space-x-4 space-y-4 mb-0">
        <Controller
          name="amount"
          control={control}
          defaultValue={undefined}
          render={({ field }) => (
            <Input
              {...field}
              className="flex-1"
              label="Monto"
              placeholder="0.00"
              inputMode="decimal"
              error={errors.amount?.message}
            />
          )}
        />
        <Controller
          name="paymentMethodId"
          control={control}
          render={({ field }) => (
            <Select {...field} data={paymentMethods} error={errors.paymentMethodId?.message}>
              <Popover>
                <Popover.Trigger
                  render={<Select.Preview label="Método de Pago" placeholder="Seleccione su método de pago" />}
                />
                <Popover.Content>
                  <Popover.Body>
                    <Select.Content>
                      <Select.List />
                    </Select.Content>
                  </Popover.Body>
                </Popover.Content>
              </Popover>
            </Select>
          )}
        />
      </div>
      <Controller
        name="startDate"
        control={control}
        render={({ field }) => (
          <Calendar
            value={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
            onValueChange={(date) => {
              if (!date) return field.onChange("")
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, "0")
              const day = String(date.getDate()).padStart(2, "0")
              field.onChange(`${year}-${month}-${day}`)
            }}>
            <CalendarTrigger label="Fecha" error={!!errors.startDate?.message} />
            <CalendarContent />
            <CalendarMessageError message={errors.startDate?.message} />
          </Calendar>
        )}
      />
      <div className="flex items-start space-x-4">
        {/* <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-48" label="Categoría" error={!!errors.categoryId?.message} />
              <SelectMessageError message={errors.categoryId?.message} />
              <SelectContent>
                <SelectGroup>
                  {categories.map(({ id, name, logo }) => (
                    <SelectItem key={id} value={id} className="gap-1">
                      <div
                        className="[&_svg]:size-4 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: logo || "" }}
                      />
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        /> */}
        {/* <Controller
          name="period"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-44" label="Período" error={!!errors.period?.message} />
              <SelectMessageError message={errors.period?.message} />
              <SelectContent>
                <SelectGroup>
                  {period.map(({ id, name }) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        /> */}
      </div>
      <Controller name="note" control={control} render={({ field }) => <Textarea {...field} label="Observación" />} />
      <footer className="flex items-center gap-2 justify-end">
        <Button variant="secondary" disabled={isSubmitting} onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2Icon className="animate-spin size-4" /> : "Guardar"}
        </Button>
      </footer>
    </form>
  )
}
