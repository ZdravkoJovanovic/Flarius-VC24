import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPERBASE_PROJECT_URL!,
  process.env.SUPERBASE_SERVICE_ROLE_KEY! // Service-Role (umgeht RLS)
);

// gleiche Regex wie in der DB-Constraint
const NUM_RE = /^\+?[0-9][0-9\s\-\(\)\.]*$/;

function sanitizeNumber(n: unknown): string | null {
  if (!n) return null;
  const s = String(n).trim();
  if (!s || s.toLowerCase() === "keine nummer") return null;
  return NUM_RE.test(s) ? s : null; // nur gültige Formate, sonst null
}

export async function POST(request: Request) {
  try {
    const { kontakte } = await request.json();
    if (!Array.isArray(kontakte)) {
      return NextResponse.json(
        { ok: false, error: "kontakte muss Array sein" },
        { status: 400 }
      );
    }

    const total = kontakte.length;

    const rows = kontakte.map((k: any) => ({
      from_id: Number.isFinite(k.kontakt) ? Number(k.kontakt) : null,
      name: k.name,
      land: k.land,
      nummer: sanitizeNumber(k.nummer), // << wichtig
      termin: false,
      total_recommendations: total,
    }));

    // in Batches schreiben
    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase
        .from("recommendations")
        .upsert(chunk, { onConflict: "nummer" }); // unique(nummer); NULLs sind erlaubt

      if (error) {
        console.error("Supabase upsert error:", error);
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        );
      }
    }

    console.log(`✅ Insert/Upsert fertig: ${rows.length} Kontakte`);
    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e: any) {
    console.error("POST /api error:", e);
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }
}
