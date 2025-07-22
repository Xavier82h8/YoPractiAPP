import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MailCheck } from "lucide-react";

export default function VerifyAccountPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent mb-4">
            <MailCheck className="h-10 w-10 text-accent-foreground" />
          </div>
          <CardTitle className="font-headline text-3xl">Verify Your Account</CardTitle>
          <CardDescription>
            We've sent a verification code to your email address. Please enter it below to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="flex gap-2">
              <Input maxLength={1} className="text-center text-2xl font-bold h-16" />
              <Input maxLength={1} className="text-center text-2xl font-bold h-16" />
              <Input maxLength={1} className="text-center text-2xl font-bold h-16" />
              <Input maxLength={1} className="text-center text-2xl font-bold h-16" />
              <Input maxLength={1} className="text-center text-2xl font-bold h-16" />
              <Input maxLength={1} className="text-center text-2xl font-bold h-16" />
            </div>
            <Button type="submit" className="w-full">Verify Account</Button>
          </form>
           <p className="mt-4 text-sm text-muted-foreground">
              Didn't receive the email? <Button variant="link" className="p-0 h-auto">Resend code</Button>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
