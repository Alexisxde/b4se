import { z } from "zod"

export const loginUserSchema = z.object({
  email: z.email({ message: "El correo electrónico no es válido" }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
})

export const registerUserSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.email({ message: "El email es obligatorio." }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
    .refine((val) => /[A-Z]/.test(val), { message: "Debe contener al menos una letra mayúscula." })
    .refine((val) => /\d/.test(val), { message: "Debe contener al menos un número." })
    .refine((val) => /^[a-zA-Z\d]+$/.test(val), { message: "Solo se permiten letras y números." })
})

export const updateUserSchema = z.object({
  name: z.string().optional(),
  file: z.any().optional()
})

export type LoginCredentials = z.infer<typeof loginUserSchema>
export type RegisterCredentials = z.infer<typeof registerUserSchema>
export type UpdateCredentials = z.infer<typeof updateUserSchema>
