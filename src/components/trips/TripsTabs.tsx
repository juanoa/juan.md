import type { ReactNode } from "react";

import { TripCard } from "@/components/trips/TripCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const trips = [
  {
    name: "Brazil",
    thumbnail: "/trips/brazil/brazil-thumbnail.webp",
    year: 2026,
  },
  {
    name: "Morocco",
    thumbnail: "/trips/morocco/morocco-thumbnail.webp",
    year: 2025,
  },
  {
    name: "Senegal",
    thumbnail: "/trips/senegal/senegal-thumbnail.webp",
    year: 2025,
  },
  {
    name: "Japan",
    thumbnail: "/trips/japan/japan-thumbnail.webp",
    year: 2024,
  },
  {
    name: "Dolomites",
    thumbnail: "/trips/dolomites/dolomites-thumbnail.webp",
    year: 2023,
  },
  {
    name: "Iceland",
    thumbnail: "/trips/iceland/iceland-thumbnail.webp",
    year: 2023,
  },
] as const;

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
          {trips.map((trip) => (
            <TripCard key={trip.name} {...trip} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="map" className="mt-5" keepMounted>
        {children}
      </TabsContent>
    </Tabs>
  );
}
