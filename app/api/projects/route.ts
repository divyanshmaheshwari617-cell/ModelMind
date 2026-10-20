import { NextResponse, type NextRequest } from "next/server";

import { authRequestIsSameOrigin, getAuthenticatedUser } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/payment";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to view your projects." }, { status: 401 });
  }

  try {
    if (!(await hasPaidAccess(user.id))) {
      return NextResponse.json(
        { error: "Purchase ModelMind access to use projects." },
        { status: 402 },
      );
    }
    const { data, error } = await getSupabaseAdminClient()
      .from("projects")
      .select("id, name, updated_at")
      .eq("user_id", user.supabaseUserId)
      .order("updated_at", { ascending: false });
    if (error) {
      console.error("Could not load projects for the authenticated owner.", error);
      return NextResponse.json(
        { error: "Could not load your projects. Check the Supabase server configuration." },
        { status: 503 },
      );
    }
    return NextResponse.json({ projects: data });
  } catch (error) {
    console.error("Could not connect to the projects database.", error);
    return NextResponse.json(
      { error: "Project storage is not configured or is unavailable." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!authRequestIsSameOrigin(request)) {
    return NextResponse.json(
      { error: "This request could not be verified." },
      { status: 403 },
    );
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to create a project." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a project name." }, { status: 400 });
  }
  const name =
    typeof payload === "object" &&
    payload !== null &&
    "name" in payload &&
    typeof payload.name === "string"
      ? payload.name.trim()
      : "";
  if (!name || name.length > 120) {
    return NextResponse.json(
      { error: "Project names must contain between 1 and 120 characters." },
      { status: 400 },
    );
  }

  try {
    if (!(await hasPaidAccess(user.id))) {
      return NextResponse.json(
        { error: "Purchase ModelMind access to use projects." },
        { status: 402 },
      );
    }
    const { error } = await getSupabaseAdminClient().from("projects").insert({
      name,
      project_data: {},
      user_id: user.supabaseUserId,
    });
    if (error) {
      console.error("Could not insert a project for the authenticated owner.", error);
      return NextResponse.json(
        { error: "Could not save the project to Supabase." },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Could not connect to the projects database.", error);
    return NextResponse.json(
      { error: "Project storage is not configured or is unavailable." },
      { status: 503 },
    );
  }
}
