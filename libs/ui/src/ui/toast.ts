import { sileo, type SileoOptions } from "sileo"

export function toast(options: SileoOptions) {
  return sileo.show({
    fill: "var(--card)",
    styles: { description: "text-muted-foreground!", ...options.styles },
    ...options
  })
}
