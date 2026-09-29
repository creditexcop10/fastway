import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ContactCard } from "@/components/admin/ContactCard";

export default async function AdminContactsPage() {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: messages } = await supabaseAdmin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">Contact Messages</h1>
        <p className="text-muted-foreground">Inquiries from the public contact form.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <ContactCard key={msg.id} msg={msg} />
          ))
        ) : (
          <div className="col-span-full text-center py-16 text-muted-foreground border rounded-2xl">
            No messages yet.
          </div>
        )}
      </div>
    </div>
  );
}