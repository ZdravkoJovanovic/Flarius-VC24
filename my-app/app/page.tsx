"use client";

import { useState } from "react";
import Navbar from "./components/navbar";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const regionNames = new Intl.DisplayNames(["de"], { type: "region" });

export default function Home() {
  const [fileContent, setFileContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setFileContent("");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setFileContent(text.normalize("NFC"));

      const parsed = parseVCF(text);
      const orderedContacts = parsed.map((c, i) => ({
        kontakt: i + 1,
        name: c.name,
        land: c.land,
        nummer: c.tel,
      }));

      // 🔹 an /api senden
      await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kontakte: orderedContacts }),
      });
    };
    reader.readAsText(f, "utf-8");
  }

  function parseVCF(content: string) {
    const cards = content.split("BEGIN:VCARD").slice(1);
    return cards.map((card) => {
      const nameMatch = card.match(/FN:(.+)/);
      const telMatch = card.match(/TEL[^:]*:(.+)/);

      const name = nameMatch ? nameMatch[1].trim() : "Unbekannt";
      const rawTel = telMatch ? telMatch[1].trim() : null;

      let tel = "Keine Nummer";
      let land = "Unbekannt";

      if (rawTel) {
        const phone = parsePhoneNumberFromString(rawTel, "AT");
        if (phone) {
          tel = phone.formatInternational();
          const regionCode = phone.country;
          if (regionCode) {
            const regionName = regionNames.of(regionCode);
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

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <section className="mx-auto max-w-2xl px-6 py-12">
        {activeTab === "Recommendations" && (
          <div>
            <div className="bg-white/10 border border-white/30 rounded-2xl shadow-md p-6">
              <label className="cursor-pointer bg-white/20 text-white px-6 py-3 rounded-2xl font-medium hover:bg-white/30 transition">
                Datei auswählen
                <input
                  type="file"
                  accept=".vcf,text/vcard"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
