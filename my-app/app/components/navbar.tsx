// components/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="w-full bg-black px-12 py-4 flex items-center justify-between">
      {/* Logo / Brand */}
      <div className="text-white font-bold tracking-widest text-lg">
        Flarius
      </div>

      {/* Right side (Button) */}
      <button className="bg-white text-black px-4 py-2 rounded-2xl font-medium hover:bg-gray-200 transition">
        Anmelden
      </button>
    </nav>
  );
}
