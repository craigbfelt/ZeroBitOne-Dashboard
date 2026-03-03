import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, status, priority, app_id, assigned_to } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("tickets")
      .update({
        title,
        description: description || null,
        status,
        priority,
        app_id: app_id || null,
        assigned_to: assigned_to || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update ticket", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ticket: data });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
