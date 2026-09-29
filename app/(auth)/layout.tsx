import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* Left side - Branding & Image (Hidden on mobile) */}
      <div className="relative hidden md:block">
        <Image
          src="/welcome.jpg"
          alt="Night Port"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/60" />
        
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-0 font-heading text-xl font-bold uppercase tracking-tight text-primary-foreground">
            <span>FASTWAY</span>
            <Image src="/favicon.png" alt="Logo" width={40} height={40} className="h-10 w-10 mx-2 drop-shadow-[0_2px_10px_rgba(255,94,2,0.5)]" />
            <span className="bg-gradient-to-r from-primary-foreground to-accent bg-clip-text text-transparent">SEND</span>
          </Link>
          
          <div className="space-y-6">
            <h1 className="font-heading text-4xl lg:text-5xl font-extrabold leading-tight text-primary-foreground">
              Global logistics, <br /> <span className="text-accent">delivered locally.</span>
            </h1>
            <p className="max-w-md text-primary-foreground/70">
              Manage your shipments, track cargo in real-time, and get instant quotes all in one dashboard.
            </p>
          </div>
          
          <div className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} Fastway Send Ltd. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Form Area */}
      <div className="flex items-center justify-center p-6 md:p-12">
        {children}
      </div>
    </div>
  );
}