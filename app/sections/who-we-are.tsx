import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import abhinavPhoto from "@/app/assets/Bob_Mugunda.jpeg";
import adityaPhoto from "@/app/assets/Aditya_Modak.jpeg";

const COPY = {
  intro: "Commercial contractors keep the built world running, but they're always last to get new technology. We're bringing frontier AI expertise to an industry that deserves it.",
};

const FOUNDERS = [
  {
    name: "Abhinav Mugunda",
    role: "Co-Founder",
    background: "Former AI Engineer, Tesla",
    bio: "Introduced AI to Tesla's global supply chain systems.",
    photo: abhinavPhoto,
  },
  {
    name: "Aditya Modak",
    role: "Co-Founder",
    background: "Former Investor, Bain Capital Ventures",
    bio: "Invested in 7 companies, 3 of which are now worth over +$1B.",
    photo: adityaPhoto,
  },
];

export function WhoWeAre() {
  return (
    <section id="who-we-are" className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Who we are
        </h2>
        <p className="max-w-4xl text-lg leading-relaxed text-muted-foreground">
          {COPY.intro}
        </p>

        <div className="mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
          {FOUNDERS.map((founder) => (
            <Card key={founder.name}>
              <CardHeader className="pb-0">
                <div className="mb-4 h-16 w-16 overflow-hidden rounded-full">
                  <Image
                    src={founder.photo}
                    alt={founder.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-base font-semibold text-foreground">{founder.name}</p>
                <p className="text-xs font-medium text-accent-foreground">{founder.role}</p>
                <p className="text-sm text-muted-foreground">{founder.background}</p>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <p className="text-sm text-foreground">{founder.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
