import React, { useState } from "react";
import PizzaBI_LabelLight from "../assets/pizza_bi_label_light.png";
import PizzaBi_cover from "../assets/pizza_bi_cover.png";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "linear-gradient(90deg, #60220D 0%, #D46420 50%, #E8A658 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          borderRadius: 32,
          overflow: "hidden",
          boxShadow: "0 40px 120px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexWrap: "wrap",
          backgroundColor: "rgba(15, 23, 42, 0.96)",
        }}
      >
        <div
          style={{
            flex: "1 1 420px",
            minWidth: 360,
            padding: 40,
            backgroundColor: "rgba(15, 23, 42, 0.96)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <img
              src={PizzaBI_LabelLight}
              alt="PizzaBI Logo"
              style={{
                width: 220,
                maxWidth: "100%",
                objectFit: "contain",
                marginLeft: 24,
              }}
            />
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              letterSpacing: "0.05em",
              textTransform: "none",
              color: "#cbd5e1",
              textAlign: "center",
            }}
          >
            Turning Pizza Data into Delicious Insight
          </p>

          <form style={{ display: "grid", gap: 24, marginTop: 34 }} onSubmit={handleSubmit}>
            {error && (
              <p
                style={{
                  margin: 0,
                  padding: "14px 18px",
                  borderRadius: 24,
                  backgroundColor: "rgba(248, 113, 113, 0.16)",
                  color: "#fecaca",
                  fontSize: 14,
                }}
              >
                {error}
              </p>
            )}

            <label style={{ display: "block", color: "#e2e8f0", fontSize: 16 }}>
              <span style={{ display: "block", marginBottom: 10, fontWeight: 600 }}>
                Username
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=""
                style={{
                  width: "100%",
                  minHeight: 56,
                  borderRadius: 24,
                  border: "1px solid #334155",
                  backgroundColor: "#0f172a",
                  padding: "16px 18px",
                  color: "#f8fafc",
                  fontSize: 16,
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "block", color: "#e2e8f0", fontSize: 16 }}>
              <span style={{ display: "block", marginBottom: 10, fontWeight: 600 }}>
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                style={{
                  width: "100%",
                  minHeight: 56,
                  borderRadius: 24,
                  border: "1px solid #334155",
                  backgroundColor: "#0f172a",
                  padding: "16px 18px",
                  color: "#f8fafc",
                  fontSize: 16,
                  outline: "none",
                }}
              />
            </label>

            <button
              type="submit"
              style={{
                width: "100%",
                minHeight: 64,
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(90deg, #962D0C 0%, #D46420 50%, #E8A658 100%)",
                color: "#fff",
                fontSize: 20,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 18px 70px -20px rgba(228, 160, 89, 0.85)",
              }}
            >
              Login
            </button>
          </form>

          <div style={{ marginTop: 30, color: "#94a3b8", fontSize: 14, lineHeight: 1.7 }}>
            <p style={{ margin: 0 }}>
              A corporate admin console for smart pizza business decisions.
            </p>
          </div>
        </div>

        <div className="login-image-panel" style={{ flex: "1 1 420px", minWidth: 360, minHeight: 520, position: "relative" }}>
          <img
            src={PizzaBi_cover}
            alt="PizzaBI analytics cover"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.88))",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </section>
  );
}
