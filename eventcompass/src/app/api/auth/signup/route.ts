// src/app/api/signup.ts
import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const supabase = createServer();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: data.user });
}
