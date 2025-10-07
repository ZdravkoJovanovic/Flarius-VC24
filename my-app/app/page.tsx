"use client";

import { useState } from "react";
import Navbar from "./components/navbar";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// Intl DisplayNames für Länder (Deutsch)
const regionNames = new Intl.DisplayNames(["de"], { type: "region" });

export default function Home() {
  const [fileContent, setFileContent] = useState<string>("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setFileContent("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setFileContent(text.normalize("NFC"));
    };
    reader.readAsText(f, "utf-8");
  }

  // Parser: extrahiere FN + TEL
  function parseVCF(content: string) {
    const cards = content.split("BEGIN:VCARD").slice(1); // erster Split leer
    return cards.map((card) => {
      const nameMatch = card.match(/FN:(.+)/);
      const telMatch = card.match(/TEL[^:]*:(.+)/);

      const name = nameMatch ? nameMatch[1].trim() : "Unbekannt";
      const rawTel = telMatch ? telMatch[1].trim() : null;

      let tel = "Keine Nummer";
      let land = "Unbekannt";

      if (rawTel) {
        const phone = parsePhoneNumberFromString(rawTel, "AT"); // Default = Österreich
        if (phone) {
          tel = phone.formatInternational();
          const regionCode = phone.country;
          if (regionCode) {
            const regionName = regionNames.of(regionCode);
            // Emoji-Flag (funktioniert für fast alle Länder)
            const flag = regionCode
              .toUpperCase()
              .replace(/./g, (char) =>
                String.fromCodePoint(127397 + char.charCodeAt(0))
              );
            land = `${flag} ${regionName}`;
          }
        } else {
          tel = rawTel;
        }
      }

      return { name, tel, land };
    });
  }

  const contacts = fileContent ? parseVCF(fileContent) : [];

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <section className="mx-auto max-w-2xl px-6 py-12">
        {/* Upload Box */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
          <label className="cursor-pointer bg-black text-white px-6 py-3 rounded-2xl font-medium hover:bg-gray-800 transition">
            Datei auswählen
            <input
              type="file"
              accept=".vcf,text/vcard"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Anzeige der Kontakte */}
        {contacts.length > 0 && (
          <div className="mt-8 space-y-6">
            {contacts.map((c, idx) => (
              <div key={idx} className="pb-4 border-b border-black">
                <p className="font-bold text-lg text-black">{c.name}</p>
                <p className="text-gray-800">
                  {c.land} · {c.tel}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
