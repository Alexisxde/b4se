"use client"
import { Button, Popover, Tooltip } from "@b4se/ui"
import { Plus } from "lucide-react"
import { useState } from "react"
import SubscriptionForm from "./subscription-form"

export function SubscriptionCreatePopover() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        render={
          <Tooltip>
            <Tooltip.Trigger
              render={
                <Button size="icon" className="rounded-full">
                  <Plus className="size-5" />
                </Button>
              }
            />
            <Tooltip.Content>Agregar suscripción</Tooltip.Content>
          </Tooltip>
        }
      />
      <Popover.Content>
        <Popover.Header>
          <Popover.Title className="flex items-center gap-2 text-xl">
            <Plus className="size-5" /> Agregar
          </Popover.Title>
        </Popover.Header>
        <Popover.Body>
          <SubscriptionForm onOpenChange={setIsOpen} />
        </Popover.Body>
      </Popover.Content>
    </Popover>
  )
}
