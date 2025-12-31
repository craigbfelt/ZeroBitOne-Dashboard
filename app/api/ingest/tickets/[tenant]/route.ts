import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    const tenantName = params.tenant;
    const body = await request.json();
    
    // Validate required fields
    const { title, description, status, priority, app_id, external_id, metadata } = body;
    
    if (!title) {
      return NextResponse.json(
        { error: "Missing required field: title is required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient();

    // Look up tenant by name
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("name", tenantName)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: `Tenant '${tenantName}' not found` },
        { status: 404 }
      );
    }

    // Insert the ticket
    const { data, error } = await supabase
      .from("tickets")
      .insert({
        tenant_id: tenant.id,
        title,
        description: description || null,
        status: status || "open",
        priority: priority || "medium",
        app_id: app_id || null,
        external_id: external_id || null,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating ticket:", error);
      return NextResponse.json(
        { error: "Failed to create ticket", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Ticket created successfully", 
        ticket: data 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to verify the webhook is working
export async function GET(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  const tenantName = params.tenant;
  
  return NextResponse.json(
    { 
      message: `Ticket ingestion endpoint active for tenant: ${tenantName}`,
      usage: "POST to this endpoint with ticket data in JSON format",
      endpoint: `/api/ingest/tickets/${tenantName}`,
      required_fields: ["title"],
      optional_fields: ["description", "status", "priority", "app_id", "external_id", "metadata"],
      example: {
        title: "Bug: Login not working",
        description: "Users cannot log in with their credentials",
        status: "open",
        priority: "high",
        external_id: "JIRA-123",
        metadata: { source: "external-system" }
      }
    },
    { status: 200 }
  );
}
