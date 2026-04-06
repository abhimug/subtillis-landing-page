import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { WhatWeBuilding } from "@/components/sections/what-we-building";
import { WhoWeAre } from "@/components/sections/who-we-are";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Nav />
      <Hero />
      <WhatWeBuilding />
      <WhoWeAre />
      <Footer />
    </main>
  );
}
