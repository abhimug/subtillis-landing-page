import { Nav } from "@/app/sections/nav";
import { Hero } from "@/app/sections/hero";
import { WhatWeBuilding } from "@/app/sections/what-we-building";
import { Demo } from "@/app/sections/demo-loader";
import { WhoWeAre } from "@/app/sections/who-we-are";
import { Footer } from "@/app/sections/footer";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Nav />
      <Hero />
      <WhatWeBuilding />
      <Demo />
      <WhoWeAre />
      <Footer />
    </main>
  );
}
