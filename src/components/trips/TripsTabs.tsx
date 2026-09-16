import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TripsTabsProps {
  children: ReactNode;
}

export function TripsTabs({ children }: TripsTabsProps) {
  return (
    <Tabs defaultValue="gallery" className="gap-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl">Trips</h1>
        <TabsList>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="gallery" className="mt-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="relative aspect-square rounded-sm bg-neutral-800 bg-[url(/trips/brazil/brazil-thumbnail.webp)] bg-cover bg-center">
            <div className="absolute bottom-2 left-2 flex flex-col gap-1 rounded-lg p-2 text-neutral-50">
              <h2 className="text-lg leading-none font-medium">Brazil</h2>
              <span className="text-sm leading-none">2026</span>
            </div>
          </div>
          <div className="relative aspect-square rounded-sm bg-neutral-800 bg-[url(/trips/agadir/agadir-thumbnail.webp)] bg-cover bg-center">
            <div className="absolute bottom-2 left-2 flex flex-col gap-1 rounded-lg p-2 text-neutral-50">
              <h2 className="text-lg leading-none font-medium">Agadir</h2>
              <span className="text-sm leading-none">2025</span>
            </div>
          </div>
          <div className="relative aspect-square rounded-sm bg-neutral-800 bg-[url(/trips/senegal/senegal-thumbnail.webp)] bg-cover bg-center">
            <div className="absolute bottom-2 left-2 flex flex-col gap-1 rounded-lg p-2 text-neutral-50">
              <h2 className="text-lg leading-none font-medium">Senegal</h2>
              <span className="text-sm leading-none">2025</span>
            </div>
          </div>
          <div className="relative aspect-square rounded-sm bg-neutral-800 bg-[url(/trips/japan/japan-thumbnail.webp)] bg-cover bg-center">
            <div className="dark absolute bottom-2 left-2 flex flex-col gap-1 rounded-lg p-2 text-neutral-50">
              <h2 className="text-lg leading-none font-medium">Japan</h2>
              <span className="text-sm leading-none">2024</span>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="map" className="mt-5" keepMounted>
        {children}
      </TabsContent>
    </Tabs>
  );
}
