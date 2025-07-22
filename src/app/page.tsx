'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Building, Code, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const internships = [
  {
    title: "Frontend Developer Intern",
    company: "Innovate Inc.",
    location: "Remote",
    icon: <Code className="h-10 w-10 text-primary" />,
    image: "https://placehold.co/600x400.png",
    hint: "technology code"
  },
  {
    title: "Marketing Intern",
    company: "Growth Gurus",
    location: "New York, NY",
    icon: <Briefcase className="h-10 w-10 text-primary" />,
    image: "https://placehold.co/600x400.png",
    hint: "office meeting"
  },
  {
    title: "Software Engineer Intern",
    company: "DataDriven Co.",
    location: "San Francisco, CA",
    icon: <Code className="h-10 w-10 text-primary" />,
    image: "https://placehold.co/600x400.png",
    hint: "startup collaboration"
  },
  {
    title: "Human Resources Intern",
    company: "PeopleFirst",
    location: "Chicago, IL",
    icon: <Building className="h-10 w-10 text-primary" />,
    image: "https://placehold.co/600x400.png",
    hint: "corporate building"
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="py-20 md:py-32 bg-secondary/30">
        <div className="container mx-auto text-center">
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-4">
            Find Your Next Internship
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            YoPracticando connects talented students with innovative companies for valuable internship experiences.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#featured-internships">Browse Internships</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="featured-internships" className="py-20 md:py-24">
        <div className="container mx-auto">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Internships
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {internships.map((internship, index) => (
              <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row">
                <div className="md:w-1/3 relative">
                   <Image
                      src={internship.image}
                      alt={internship.title}
                      width={600}
                      height={400}
                      data-ai-hint={internship.hint}
                      className="object-cover h-full w-full"
                    />
                </div>
                <div className="md:w-2/3 flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="font-headline text-2xl">{internship.title}</CardTitle>
                            <CardDescription className="text-lg">{internship.company}</CardDescription>
                        </div>
                        {internship.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{internship.location}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">View Details</Button>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
