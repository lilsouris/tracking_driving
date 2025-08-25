"use client";

import { useState } from "react";
import Spline from "@splinetool/react-spline";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSignUp() {
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Check your inbox to confirm your account.");
  }

  async function handleSignIn() {
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Signed in successfully.");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 p-6">
      <div className="w-full max-w-3xl aspect-video">
        <Spline scene="https://prod.spline.design/z73xPHGLkj0AfTpL/scene.splinecode" />
      </div>

      <div className="w-full max-w-md bg-white/60 dark:bg-black/40 backdrop-blur rounded-xl border border-black/10 dark:border-white/10 p-6 flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Sign in or create an account</h1>
        <input
          type="email"
          className="w-full rounded-md border px-3 py-2 bg-transparent"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full rounded-md border px-3 py-2 bg-transparent"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <button onClick={handleSignUp} className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black">
            Sign up
          </button>
          <button onClick={handleSignIn} className="px-4 py-2 rounded-md border">
            Sign in
          </button>
        </div>
        {message && <p className="text-sm text-red-600 dark:text-red-400">{message}</p>}
      </div>
    </div>
  );
}
