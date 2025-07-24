'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginBanner } from "@/components/login-banner";
import { Briefcase, Building, Code, MapPin, Rocket, Users, Target } from "lucide-react";
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
    <div className="flex flex-col bg-background text-foreground">
       <LoginBanner />
      <section className="py-20 md:py-32">
        <div className="container mx-auto text-center">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            El Futuro del Talento Comienza Aquí
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10">
            Conectamos a estudiantes excepcionales con empresas visionarias. Descubre oportunidades, impulsa tu carrera y encuentra a los líderes del mañana.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Comenzar Ahora</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#featured-internships">Ver Pasantías</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="featured-internships" className="py-20 md:py-24">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-20">
                <div className="flex flex-col items-center">
                    <Rocket className="h-12 w-12 mb-4 text-primary"/>
                    <h3 className="font-headline text-2xl font-semibold">Para Estudiantes</h3>
                    <p className="text-muted-foreground mt-2">Lanza tu carrera con pasantías que realmente importan. Gana experiencia, desarrolla tus habilidades y construye tu futuro profesional.</p>
                </div>
                <div className="flex flex-col items-center">
                    <Target className="h-12 w-12 mb-4 text-primary"/>
                    <h3 className="font-headline text-2xl font-semibold">Para Empresas</h3>
                    <p className="text-muted-foreground mt-2">Descubre y recluta al talento joven más prometedor. Encuentra a los innovadores que llevarán a tu equipo al siguiente nivel.</p>
                </div>
                <div className="flex flex-col items-center">
                    <Users className="h-12 w-12 mb-4 text-primary"/>
                    <h3 className="font-headline text-2xl font-semibold">Nuestra Misión</h3>
                    <p className="text-muted-foreground mt-2">Crear el puente perfecto entre la educación y la industria, fomentando el crecimiento y la innovación para una nueva generación de profesionales.</p>
                </div>
            </div>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            Pasantías Destacadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {internships.map((internship, index) => (
              <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row group bg-card">
                 <div className="md:w-2/5 relative overflow-hidden">
                   <Image
                      src={internship.image}
                      alt={internship.title}
                      width={600}
                      height={400}
                      data-ai-hint={internship.hint}
                      className="object-cover h-full w-full transform transition-transform duration-500 group-hover:scale-110"
                    />
                </div>
                <div className="md:w-3/5 flex flex-col p-6">
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors duration-300">{internship.title}</CardTitle>
                            <CardDescription className="text-lg text-muted-foreground">{internship.company}</CardDescription>
                        </div>
                        {internship.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-0">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{internship.location}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-0 mt-4">
                    <Button className="w-full">Ver Detalles</Button>
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
