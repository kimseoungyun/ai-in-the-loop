import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StockCreateFormPage } from "@/components/stock/stock-create-form-page";

export default async function NewStockPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="py-2">
      <StockCreateFormPage />
    </main>
  );
}
