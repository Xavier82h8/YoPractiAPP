import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { User, Mail, Briefcase, Code, Shield } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="flex flex-col items-center text-center space-y-4 p-6 bg-secondary/30">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="profile picture" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-3xl">John Doe</CardTitle>
            <CardDescription className="text-lg">Frontend Developer Intern</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2"><User className="w-4 h-4"/>Full Name</Label>
                <Input id="fullName" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4"/>Email Address</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="flex items-center gap-2"><Code className="w-4 h-4"/>Skills</Label>
              <Textarea
                id="skills"
                placeholder="e.g., React, TypeScript, Figma"
                defaultValue="React, Next.js, TypeScript, Tailwind CSS, Node.js"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience" className="flex items-center gap-2"><Briefcase className="w-4 h-4"/>Experience</Label>
              <Textarea
                id="experience"
                placeholder="Describe your past roles and projects..."
                className="min-h-[150px]"
                defaultValue="Developed and maintained web applications using React and Next.js. Collaborated with designers to implement responsive and user-friendly interfaces."
              />
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-3">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>

          <Separator className="my-8" />
          
          <div>
            <h3 className="text-lg font-semibold mb-4 font-headline flex items-center gap-2"><Shield className="w-5 h-5"/>Account Security</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">For your security, we recommend changing your password periodically.</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/profile/change-password">Change Password</Link>
              </Button>
            </div>
             <div className="flex items-center justify-between p-4 border rounded-lg mt-4 bg-destructive/10 border-destructive/20">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-destructive/80">Permanently delete your account and all associated data. This action cannot be undone.</p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
