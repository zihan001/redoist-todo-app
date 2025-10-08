// client/src/pages/Signup.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: () => signup(email, password),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      nav("/app", { replace: true });
    },
  });

  const onSubmit = (e: FormEvent) => { e.preventDefault(); m.mutate(); };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">Create account</h1>
        <input className="w-full border rounded px-3 py-2" placeholder="Email"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password"
               value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={m.isPending}
          className="w-full rounded-xl py-2 bg-black text-white disabled:opacity-60">
          {m.isPending ? "Creating…" : "Sign up"}
        </button>
        {m.isError ? <p className="text-red-600 text-sm">{(m.error as Error).message}</p> : null}
        <p className="text-sm text-gray-600">Have an account? <Link className="underline" to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
