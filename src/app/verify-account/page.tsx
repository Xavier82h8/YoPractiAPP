'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyAccountPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    const user = auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
        toast({ title: "Success", description: "Verification email sent again." });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      } finally {
        setIsResending(false);
      }
    } else {
       toast({ variant: "destructive", title: "Error", description: "No user is signed in to resend verification for." });
       setIsResending(false);
       router.push("/login");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent mb-4">
            <MailCheck className="h-10 w-10 text-accent-foreground" />
          </div>
          <CardTitle className="font-headline text-3xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address. Please click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Once verified, you can log in.
          </p>
           <Button asChild className="w-full mt-4">
            <Link href="/login">
              Go to Login
            </Link>
           </Button>
           <p className="mt-4 text-sm text-muted-foreground">
              Didn't receive the email?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={handleResend} disabled={isResending}>
                {isResending ? 'Sending...' : 'Resend link'}
              </Button>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
