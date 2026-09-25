export function Marquee() {
  const items = [
    "Air Freight", "Sea Freight", "Road Transport", "Fast Freight", "Global Logistics", "24/7 Tracking"
  ];

  return (
    <div className="relative z-10 -mt-12 mb-12 flex overflow-hidden border-y border-border/40 bg-background py-4">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} className="mx-8 flex items-center gap-8">
            <span className="font-heading text-lg font-bold uppercase tracking-widest text-muted-foreground">
              {item}
            </span>
            <span className="text-accent text-xl">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}