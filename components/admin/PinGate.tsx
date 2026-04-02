"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flame, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SESSION_KEY = "lagablab_admin";

export function PinGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    setAuthenticated(stored === "true");
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const adminPin = process.env.NEXT_PUBLIC_ADMIN_PIN ?? "1234";
    if (pin === adminPin) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthenticated(true);
    } else {
      setAttempts((a) => a + 1);
      setError("Incorrect PIN. Try again.");
      setPin("");
    }
  }

  // Still checking sessionStorage
  if (authenticated === null) return null;
  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-3 w-fit">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Lagablab Admin</CardTitle>
          <CardDescription className="flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" /> Enter your PIN to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              inputMode="numeric"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
              maxLength={10}
              autoFocus
              className={`text-center text-xl tracking-widest ${error ? "border-destructive" : ""}`}
            />
            {error && (
              <p className="text-sm text-destructive text-center">
                {error} {attempts >= 3 && "(Hint: check your .env.local)"}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg">
              Unlock Admin Panel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
