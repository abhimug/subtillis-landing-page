"use client";

import { Button } from "@/components/ui/button";

const COPY = {
  logo: "Subtillis",
  cta: "Book a Meeting",
  ctaHref: "https://app.apollo.io/#/meet/aditya_modak_8e3/30-min",
  links: [
    { label: "What We Do", href: "#what-we-do" },
    { label: "Who We Are", href: "#who-we-are" },
  ],
};

export function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="text-lg font-semibold tracking-tight text-primary">
          {COPY.logo}
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {COPY.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Button asChild size="sm">
          <a href={COPY.ctaHref} target="_blank" rel="noopener noreferrer">{COPY.cta}</a>
        </Button>
      </div>
    </header>
  );
}
