import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { kontakte } = await request.json();

    console.log("\x1b[36m%s\x1b[0m", "===== 📘 Eingehende Kontakte =====");
    kontakte.forEach((k: any) => {
      console.log(
        `\x1b[33mKontakt ${k.kontakt}:\x1b[0m`,
        `\x1b[32m${k.name}\x1b[0m · \x1b[35m${k.land}\x1b[0m · \x1b[37m${k.nummer}\x1b[0m`
      );
    });
    console.log("\x1b[36m%s\x1b[0m", "==================================");

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("\x1b[31mFehler beim POST /api:\x1b[0m", e);
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
}
