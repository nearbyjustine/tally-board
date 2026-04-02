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

  // Still checking sessionStorage
  if (authenticated === null) return null;
  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal px-4">
      <Card className="w-full max-w-sm bg-ash border-2 border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 bg-flame rounded-xl p-3.5 w-fit">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">
            Lagablab Admin
          </CardTitle>
          <CardDescription className="flex items-center justify-center gap-1.5 text-white/40 font-bold text-xs uppercase tracking-wide">
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
              className={`text-center text-xl tracking-widest font-bold bg-charcoal border-white/20 text-white placeholder:text-white/30 ${error ? "border-destructive" : ""}`}
            />
            {error && (
              <p className="text-sm font-bold text-destructive text-center">
                {error} {attempts >= 3 && "(Hint: check your .env.local)"}
              </p>
            )}
            <Button type="submit" className="w-full font-black uppercase tracking-wide bg-flame hover:bg-ember text-white" size="lg">
              Unlock Admin Panel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
