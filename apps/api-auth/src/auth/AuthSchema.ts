import { z } from "zod"

export const registerUserSchema = z.object({
  name: z
    .string({ error: "El nombre es obligatorio." })
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.email({ error: "El email es obligatorio." }),
  password: z
    .string({ error: "La contraseña es obligatoria." })
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
    .refine((val) => /[A-Z]/.test(val), { message: "Debe contener al menos una letra mayúscula." })
    .refine((val) => /\d/.test(val), { message: "Debe contener al menos un número." })
    .refine((val) => /^[a-zA-Z\d]+$/.test(val), { message: "Solo se permiten letras y números." })
})

export const loginUserSchema = z.object({
  email: z.email({ error: "El email es obligatorio." }),
  password: z.string({
    error: "La contraseña es obligatoria."
  })
})

export const updateUserSchema = z.object({
  name: z.string().optional(),
  file: z.any().optional()
})

export type RegisterUser = z.infer<typeof registerUserSchema>
export type LoginUser = z.infer<typeof loginUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>

export default { register: registerUserSchema, login: loginUserSchema, update: updateUserSchema }
