import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image 
                src="/favicon.png" 
                alt="Fastway Send Logo" 
                width={36} 
                height={36} 
                className="h-9 w-9"
              />
              <span className="font-heading text-xl font-bold tracking-tight text-primary-foreground">
                FASTWAY SEND
              </span>
            </Link>
            <p className="text-primary-foreground/70 max-w-md">
              Global supplier of transport and logistics solutions. We deliver on time, every time.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link href="/about" className="hover:text-accent">About Us</Link></li>
              <li><Link href="/services" className="hover:text-accent">Services</Link></li>
              <li><Link href="/track" className="hover:text-accent">Track & Trace</Link></li>
              <li><Link href="/contact" className="hover:text-accent">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>12 East 63rd St, Manhattan, NY</li>
              <li>+1 (917) 410-5271</li>
              <li>support@fastwaysend.com</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Fastway Send Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}