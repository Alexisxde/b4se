"use client"
import { Empty } from "@b4se/ui/empty"
import { Folder } from "lucide-react"

export function Dashboard() {
  return (
    <section className="flex flex-col h-dvh p-4 pb-8 md:p-6">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-muted-foreground text-2xl font-medium tracking-tight">Inicio</h2>
      </header>
      <section className="flex-1 grid grid-cols-3 grid-rows-4 gap-3">
        <Empty className="row-span-2">
          <Empty.Icon>
            <Folder className="size-7" />
          </Empty.Icon>
          <Empty.Title>No day datos</Empty.Title>
          <Empty.Description>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio explicabo error dicta ipsa tempore, deserunt
            consequuntur. Numquam vero totam vel?
          </Empty.Description>
        </Empty>
        <Empty className="row-span-2 col-start-2 row-start-1">
          <Empty.Icon>
            <Folder className="size-7" />
          </Empty.Icon>
          <Empty.Title>No day datos</Empty.Title>
          <Empty.Description>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio explicabo error dicta ipsa tempore, deserunt
            consequuntur. Numquam vero totam vel?
          </Empty.Description>
        </Empty>
        <Empty className="row-span-2 col-start-3 row-start-1">
          <Empty.Icon>
            <Folder className="size-7" />
          </Empty.Icon>
          <Empty.Title>No day datos</Empty.Title>
          <Empty.Description>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio explicabo error dicta ipsa tempore, deserunt
            consequuntur. Numquam vero totam vel?
          </Empty.Description>
        </Empty>
        <Empty className="col-span-2 row-span-2 col-start-1 row-start-3">
          <Empty.Icon>
            <Folder className="size-7" />
          </Empty.Icon>
          <Empty.Title>No day datos</Empty.Title>
          <Empty.Description>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio explicabo error dicta ipsa tempore, deserunt
            consequuntur. Numquam vero totam vel?
          </Empty.Description>
        </Empty>
        <Empty className="row-span-2 col-start-3 row-start-3">
          <Empty.Icon>
            <Folder className="size-7" />
          </Empty.Icon>
          <Empty.Title>No day datos</Empty.Title>
          <Empty.Description>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio explicabo error dicta ipsa tempore, deserunt
            consequuntur. Numquam vero totam vel?
          </Empty.Description>
        </Empty>
      </section>
    </section>
  )
}
