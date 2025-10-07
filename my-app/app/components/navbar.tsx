"use client";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const tabs = ["D2D", "Lead Data", "Lead Input", "Analytics", "Recommendations"];

  return (
    <nav
      className="w-full px-12 py-4 flex items-center justify-between
      bg-white/10 backdrop-blur-xl border border-white/30 shadow-lg rounded-xl"
    >
      {/* Logo */}
      <div className="text-white font-bold tracking-widest text-lg drop-shadow-md">
        Flarius
      </div>

      {/* Tabs */}
      <div className="flex justify-between items-center w-3/4">
        {tabs.map((tab) => (
          <span
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-white font-semibold tracking-widest cursor-pointer transition
              ${activeTab === tab ? "text-[#fff]" : "hover:text-[#ccc]"}`}
          >
            {tab}
          </span>
        ))}

        {/* Right side (Button) */}
        <button
          className="bg-white/80 text-black px-12 py-2 font-medium
          hover:bg-white hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
        >
          Anmelden
        </button>
      </div>
    </nav>
  );
}
