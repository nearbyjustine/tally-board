"use client";

import { useState, useEffect } from "react";
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

  if (authenticated === null) return null;
  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal px-4">
      <Card className="w-full max-w-sm bg-ash border border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 bg-flame rounded-xl p-3.5 w-fit">
            <Flame className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="font-heading text-xl font-bold text-white">
            Lagablab Admin
          </CardTitle>
          <CardDescription className="flex items-center justify-center gap-1.5 text-white/40 text-xs font-medium">
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
              className={`text-center text-xl tracking-widest font-medium bg-charcoal border-white/20 text-white placeholder:text-white/30 ${error ? "border-destructive" : ""}`}
            />
            {error && (
              <p className="text-sm font-medium text-destructive text-center">
                {error} {attempts >= 3 && "(Hint: check your .env.local)"}
              </p>
            )}
            <Button type="submit" className="w-full font-heading font-semibold bg-flame hover:bg-ember text-white" size="lg">
              Unlock Admin Panel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
