import { TrackForm } from "@/components/public/TrackForm";

export default function TrackPage({ searchParams }: { searchParams: { tracking_number?: string } }) {
  const initialTrackingNumber = searchParams.tracking_number || "";

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden pt-32 pb-20">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center">
        <div className="text-center mb-10 max-w-2xl">
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-primary-foreground mb-4">
            Track &amp; Trace
          </h1>
          <p className="text-lg text-primary-foreground/70">
            Enter your tracking number below to get real-time updates on your shipment.
          </p>
        </div>

        <div className="w-full max-w-2xl">
          {/* Pass the initial tracking number here */}
          <TrackForm initialTrackingNumber={initialTrackingNumber} />
        </div>
      </div>
    </section>
  );
}