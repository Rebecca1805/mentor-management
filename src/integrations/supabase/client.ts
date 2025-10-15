// ✅ src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// 🧩 Carrega as variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://tstdcrryxpdpeishuoxg.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdGRjcnJ5eHBkcGVpc2h1b3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDMwMjMsImV4cCI6MjA3NjAxOTAyM30.cu9P9yZEitOAqc94zN1BT_wHTl7t4IOj67rFkmkAdN4";

// ⚙️ Cria o client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
  },
});

// 🚨 Diagnóstico (mostra no console se algo estiver errado)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Variáveis do Supabase não configuradas corretamente!");
} else {
  console.log("✅ Supabase client inicializado com sucesso:", SUPABASE_URL);
}
