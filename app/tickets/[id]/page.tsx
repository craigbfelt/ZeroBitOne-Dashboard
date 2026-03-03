import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import TicketForm from "@/components/TicketForm";

export default async function EditTicketPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: ticket }, { data: apps }, { data: members }] = await Promise.all([
    supabase.from("tickets").select("*").eq("id", params.id).single(),
    supabase.from("apps").select("*").order("name"),
    supabase.from("members").select("*").order("name"),
  ]);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tickets" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Tickets
        </Link>
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Edit Ticket</h2>
        <p className="mt-2 text-gray-600">
          Update ticket details and use the AI assistant for help
        </p>
      </div>
      <TicketForm ticket={ticket} apps={apps ?? []} members={members ?? []} />
    </div>
  );
}
