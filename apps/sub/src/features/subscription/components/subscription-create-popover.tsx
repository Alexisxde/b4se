"use client"
import { Popover, PopoverContent, PopoverHeader, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@b4se/ui"
import { Plus } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import SubscriptionForm from "./subscription-form"

export default function SubscriptionCreatePopover() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button ripple size="sm">
          <motion.span layout="position" layoutId="form-suscription" className="flex items-center gap-1.5">
            <Plus />
            <span className="sr-only">Agregar Subcripción</span>
          </motion.span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-md h-fit top-6 right-1/2 translate-x-1/2 rounded-4xl bg-card z-10 md:right-8 md:translate-x-0">
        <PopoverHeader closeButton={true}>
          <motion.h2
            layout="position"
            layoutId="form-suscription"
            className="flex items-center gap-1.5 text-2xl font-semibold">
            Agregar suscripción
          </motion.h2>
        </PopoverHeader>
        <SubscriptionForm onOpenChange={setIsOpen} />
      </PopoverContent>
    </Popover>
  )
}
