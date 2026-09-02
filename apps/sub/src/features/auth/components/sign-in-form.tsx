"use client"
import { signIn } from "@b4se/auth"
import { Button, Input, Popover, toast } from "@b4se/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import type z from "zod"
import { userLoginSchema } from "../schemas/login"

type FormData = z.infer<typeof userLoginSchema>

export function SignInForm() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
    setError
  } = useForm<FormData>({ resolver: zodResolver(userLoginSchema) })

  const onSubmit: SubmitHandler<FormData> = async ({ email, password }) => {
    try {
      const res = await signIn("credentials", { email, password, redirect: false })
      if (res?.error) {
        setError("root", { message: "Correo o contraseña incorrectos." })
        return
      }
      toast({ title: "¡Bienvenido de nuevo!", description: "Has iniciado sesión correctamente.", type: "success" })
      router.push("/app")
    } catch (_) {
      setError("root", { message: "Ocurrió un error inesperado. Inténtalo de nuevo." })
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger render={<Button>Comenzar</Button>}></Popover.Trigger>
      <Popover.Content className="w-125 h-64">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" autoComplete="off" noValidate>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                placeholder="alex@example.com"
                label="Correo electrónico"
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Input
                {...field}
                type="password"
                placeholder="********"
                label="Contraseña"
                error={errors.password?.message}
              />
            )}
          />
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? <Loader2Icon className="animate-spin size-4" /> : "Iniciar sesión"}
          </Button>
        </form>
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
      </Popover.Content>
    </Popover>
  )
}
