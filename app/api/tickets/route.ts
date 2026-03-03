import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_id, title, description, status, priority, app_id, assigned_to } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!tenant_id) {
      return NextResponse.json({ error: "tenant_id is required" }, { status: 400 });
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("tickets")
      .insert({
        tenant_id,
        title,
        description: description || null,
        status: status || "open",
        priority: priority || "medium",
        app_id: app_id || null,
        assigned_to: assigned_to || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create ticket", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ticket: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
