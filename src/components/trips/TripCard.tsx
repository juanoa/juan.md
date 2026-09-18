interface TripCardProps {
  name: string;
  thumbnail: string;
  year: number;
}

export function TripCard({ name, thumbnail, year }: TripCardProps) {
  return (
    <div
      className="relative aspect-square rounded-sm bg-neutral-800 bg-cover bg-center"
      style={{ backgroundImage: `url(${thumbnail})` }}
    >
      <div className="absolute bottom-2 left-2 flex flex-col gap-1 rounded-lg p-2 text-neutral-50">
        <h2 className="text-lg leading-none font-medium">{name}</h2>
        <span className="text-sm leading-none">{year}</span>
      </div>
    </div>
  );
}
