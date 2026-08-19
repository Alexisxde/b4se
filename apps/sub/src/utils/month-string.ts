const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
]

export function monthStringLong(month: number) {
  return MONTHS[month]
}

export function monthStringShort(month: number) {
  return MONTHS[month].slice(0, 3)
}
