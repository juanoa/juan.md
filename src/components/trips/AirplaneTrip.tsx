interface AirplaneTripProps {
  from: string;
  to: string;
  fromLabel?: string;
  toLabel?: string;
}

interface AirportProps {
  code: string;
  label?: string;
  side: "from" | "to";
}

function Airport({ code, label, side }: AirportProps) {
  const isDeparture = side === "from";

  return (
    <div className="border-border bg-background text-foreground grid min-w-0 border px-3.5 py-3">
      <span className="text-muted-foreground text-[0.625rem] leading-none font-semibold tracking-[0.12em] uppercase">
        {isDeparture ? "Departure" : "Arrival"}
      </span>
      <strong className="mt-[0.35rem] font-mono text-2xl leading-none font-medium tracking-[-0.04em]">
        {code}
      </strong>
      {label && (
        <span className="text-muted-foreground mt-[0.35rem] overflow-hidden text-xs leading-none text-ellipsis whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}

export function AirplaneTrip({
  from,
  to,
  fromLabel,
  toLabel,
}: AirplaneTripProps) {
  const accessibleFrom = fromLabel ? `${fromLabel} (${from})` : from;
  const accessibleTo = toLabel ? `${toLabel} (${to})` : to;

  return (
    <section
      aria-label={`Flight from ${accessibleFrom} to ${accessibleTo}`}
      className="my-10 grid grid-cols-[minmax(0,10rem)_minmax(1.5rem,1fr)_minmax(0,10rem)] items-center"
    >
      <Airport code={from} label={fromLabel} side="from" />
      <div aria-hidden="true" className="bg-border h-px" />
      <Airport code={to} label={toLabel} side="to" />
    </section>
  );
}
