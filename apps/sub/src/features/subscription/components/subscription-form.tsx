"use client"
import { useServices } from "@/features/service/hooks/use-services"
import { Button, Calendar, Input, Popover, Select, Textarea } from "@b4se/ui"
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
  const { data: categories } = useSubscriptionCategory()
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
        render={({ field: { value, onChange, ...field } }) => (
          <Select {...field} data={services} value={value} onChange={onChange}>
            <Popover>
              <Popover.Trigger
                render={
                  <Select.Preview
                    label="Suscripción"
                    placeholder="Seleccione su suscripción"
                    error={errors.serviceId?.message}
                  />
                }
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
          render={({ field: { value, onChange, ...field } }) => (
            <Input
              {...field}
              value={value}
              onChange={onChange}
              label="Monto"
              placeholder="0.00"
              inputMode="decimal"
              className="flex-1"
              error={errors.amount?.message}
            />
          )}
        />
        <Controller
          name="paymentMethodId"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <Select
              {...field}
              data={paymentMethods}
              error={errors.paymentMethodId?.message}
              value={value}
              onValueChange={onChange}>
              <Popover>
                <Popover.Trigger
                  render={
                    <Select.Preview
                      label="Método de Pago"
                      placeholder="Seleccione su método de pago"
                      error={errors.paymentMethodId?.message}
                    />
                  }
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
        render={({ field: { value, onChange, ...field } }) => (
          <Calendar
            {...field}
            value={value ? new Date(`${value}T00:00:00`) : undefined}
            onValueChange={(date) => {
              if (!date) return onChange("")
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, "0")
              const day = String(date.getDate()).padStart(2, "0")
              onChange(`${year}-${month}-${day}`)
            }}>
            <Popover>
              <Popover.Trigger
                render={
                  <Calendar.Preview label="Fecha" placeholder="Seleccionar fecha" error={errors.startDate?.message} />
                }
              />
              <Popover.Content>
                <Popover.Body>
                  <Calendar.Content>
                    <Calendar.Header>
                      <Calendar.Month />
                      <Calendar.Controls />
                    </Calendar.Header>
                    <Calendar.Days />
                  </Calendar.Content>
                </Popover.Body>
              </Popover.Content>
            </Popover>
          </Calendar>
        )}
      />
      <div className="flex items-start space-x-4">
        <Controller
          name="categoryId"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <Select {...field} data={categories} value={value} onValueChange={onChange}>
              <Popover>
                <Popover.Trigger
                  render={
                    <Select.Preview
                      label="Categoría"
                      placeholder="Seleccione su categoría"
                      error={errors.categoryId?.message}
                    />
                  }
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
        <Controller
          name="period"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <Select {...field} data={period} value={value} onChange={onChange}>
              <Popover>
                <Popover.Trigger
                  render={
                    <Select.Preview
                      label="Periodo"
                      placeholder="Seleccione su periodo"
                      error={errors.period?.message}
                    />
                  }
                />
                <Popover.Content className="min-w-48">
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
        name="note"
        control={control}
        render={({ field: { value, onChange, ...field } }) => (
          <Textarea {...field} value={value} onChange={onChange} label="Observación" />
        )}
      />
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
