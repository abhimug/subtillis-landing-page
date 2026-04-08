import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";

const COPY = {
  logo: "Subtillis",
  legalName: "Subtillis Corp",
  tagline: "AI agents for field service operations. Built for contractors who run lean and move fast.",
  cta: "Book a Meeting",
  ctaHref: "https://app.apollo.io/#/meet/aditya_modak_8e3/30-min",
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold tracking-tight">{COPY.logo}</p>
            <p className="mt-2 max-w-xs text-sm opacity-60">{COPY.tagline}</p>
          </div>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground"
          >
            <a href={COPY.ctaHref} target="_blank" rel="noopener noreferrer">{COPY.cta}</a>
          </Button>
        </div>

        <Separator className="my-8 opacity-20" />

        <p className="text-xs opacity-40">
          © {new Date().getFullYear()} {COPY.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
