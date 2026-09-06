"use client"
import { Button, Popover } from "@b4se/ui"
import { Plus } from "lucide-react"
import { useState } from "react"
import SubscriptionForm from "./subscription-form"

export function SubscriptionCreatePopover() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        render={
          <Button size="icon" className="rounded-full">
            <Plus />
          </Button>
        }
      />
      <Popover.Content>
        <Popover.Header>
          <Popover.Title className="flex items-center gap-2 text-xl">
            <Plus className="size-5" /> Agregar
          </Popover.Title>
        </Popover.Header>
        <SubscriptionForm onOpenChange={setIsOpen} />
      </Popover.Content>
    </Popover>
  )
}
