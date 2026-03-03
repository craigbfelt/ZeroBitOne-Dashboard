import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import TicketForm from "@/components/TicketForm";

export default async function NewTicketPage() {
  const supabase = createClient();

  const [{ data: apps }, { data: members }] = await Promise.all([
    supabase.from("apps").select("*").order("name"),
    supabase.from("members").select("*").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tickets" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Tickets
        </Link>
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900">New Ticket</h2>
        <p className="mt-2 text-gray-600">
          Create a new ticket and use the AI assistant for help
        </p>
      </div>
      <TicketForm apps={apps ?? []} members={members ?? []} />
    </div>
  );
}
