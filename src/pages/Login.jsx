import React, { useState, useLayoutEffect, useRef, useCallback } from "react";
import PizzaBI_LabelLight from "../assets/pizza_bi_label_light.png";
import PizzaBi_cover from "../assets/pizza_bi_cover.png";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    // Skalierungsfaktor kurz zurücksetzen, um echte Naturgröße zu messen
    containerRef.current.style.transform = "scale(1)";
    const naturalWidth = containerRef.current.scrollWidth;
    const naturalHeight = containerRef.current.scrollHeight;

    const availableWidth = window.innerWidth * 0.96;
    const availableHeight = window.innerHeight * 0.96;

    const widthScale = availableWidth / naturalWidth;
    const heightScale = availableHeight / naturalHeight;

    setScale(Math.min(1, widthScale, heightScale));
  }, []);

  useLayoutEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      setError("");
      onLogin();
    } else {
      setError("Invalid administrative credentials. Please try again.");
    }
  };

  return (
    <section className="min-h-screen w-full flex items-center justify-center overflow-hidden font-mono bg-gradient-to-r from-[#60220D] via-[#D46420] to-[#E8A658]">
      <div
        ref={containerRef}
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
        className="flex shadow-2xl transition-transform duration-150 ease-out"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-center text-center p-20 gap-8 bg-[#1E293B] rounded-2xl xl:rounded-tr-none xl:rounded-br-none w-fit"
        >
          <div className="flex flex-col items-center mb-8">
            <img
              src={PizzaBI_LabelLight}
              alt="PizzaBI Logo"
              className="w-70 object-contain mb-3"
            />
            <p className="text-slate-400 text-base text-center whitespace-nowrap">
              Turning Pizza Data into Delicious Insight
            </p>
          </div>

          {error && <p className="text-red-300 text-sm">{error}</p>}

          <div className="flex flex-col text-2xl text-left gap-1 w-full">
            <span className="text-white">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-md p-1 border-2 border-black bg-white outline-none focus:border-[#E8A658] focus:bg-slate-50 focus:ring-0"
            />
          </div>

          <div className="flex flex-col text-2xl text-left gap-1 w-full">
            <span className="text-white">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md p-1 border-2 border-black bg-white outline-none focus:border-[#E8A658] focus:bg-slate-50 focus:ring-0"
            />
          </div>

          <button
            type="submit"
            className="px-10 py-2 text-2xl rounded-md bg-gradient-to-r from-[#962D0C] via-[#D46420] to-[#E8A658]
            hover:from-[#60220D] hover:via-[#A7561D] hover:to-[#E8A658] text-white whitespace-nowrap"
          >
            Login
          </button>

          <span className="text-slate-400 whitespace-nowrap">
            Internal Corporate Administration Console Only
          </span>
        </form>

        <img
          src={PizzaBi_cover}
          alt="login"
          className="w-300 object-cover xl:rounded-tr-2xl xl:rounded-br-2xl xl:block hidden"
        />
      </div>
    </section>
  );
}