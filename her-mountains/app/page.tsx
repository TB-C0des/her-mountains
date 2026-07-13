import IndiaMap from "./components/IndiaMap";
import UnlockState from "./components/UnlockState";
import { getAllTreks } from "../lib/all-treks";
import { getAllStates } from "../lib/all-states";

const HOME_BG = "/photos/home/bg.jpg";

export default async function Home() {
  // Build trek pin data server-side so custom treks also get pins
  const allTreks = await getAllTreks();
  const allStates = await getAllStates();
  const trekPins = allTreks
    .filter((t) => allStates.some((s) => s.name === t.state))
    .map((t) => {
      const state = allStates.find((s) => s.name === t.state)!;
      return { trekId: t.id, trekName: t.name, stateId: state.id };
    });
  const unlockedStateIds = allStates.map((s) => s.id);

  return (
    <main style={{ minHeight: "100vh", color: "#2b241c", position: "relative", overflow: "hidden" }}>

      {/* Background photo with warm light overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(245,238,221,0.55) 0%, rgba(245,238,221,0.55) 100%),
            url(${HOME_BG})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#f5eedd",
        }}
      />

      {/* Hero */}
      <section
        style={{
          maxWidth: "672px",
          margin: "0 auto",
          paddingTop: "56px",
          paddingBottom: "20px",
          paddingLeft: "24px",
          paddingRight: "24px",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#4a3f35",
          marginBottom: "14px",
          textShadow: "0 1px 8px rgba(245,238,221,0.8)",
        }}>
          a field journal, kept for you
        </p>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(3rem, 10vw, 5rem)",
          fontWeight: 600,
          fontStyle: "italic",
          lineHeight: 1.0,
          color: "#1a1208",
          letterSpacing: "-0.02em",
          marginBottom: "18px",
          textShadow: "0 2px 16px rgba(245,238,221,0.7)",
        }}>
          Her Mountains
        </h1>

        <p style={{
          fontSize: "0.95rem",
          lineHeight: 1.7,
          color: "#2b241c",
          maxWidth: "340px",
          margin: "0 auto 24px",
          textShadow: "0 1px 8px rgba(245,238,221,0.8)",
        }}>
          Every ridge you climbed, every summit you earned —
          tap a state to walk it again.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px" }}>
          <span style={{ height: "1px", width: "60px", background: "rgba(43,36,28,0.3)", display: "block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "rgba(43,36,28,0.5)", letterSpacing: "0.3em" }}>✦</span>
          <span style={{ height: "1px", width: "60px", background: "rgba(43,36,28,0.3)", display: "block" }} />
        </div>
      </section>

      {/* Map */}
      <section style={{
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        paddingBottom: "32px",
        paddingLeft: "16px",
        paddingRight: "16px",
        position: "relative",
        zIndex: 2,
      }}>
        <IndiaMap treks={trekPins} activeStates={allStates.map((s) => ({ id: s.id, name: s.name }))} />
      </section>

      {/* Unlock new state */}
      <section style={{
        maxWidth: "640px",
        margin: "0 auto",
        paddingBottom: "60px",
        paddingLeft: "24px",
        paddingRight: "24px",
        position: "relative",
        zIndex: 2,
      }}>
        <UnlockState unlockedIds={unlockedStateIds} />
      </section>

      {/* Footer */}
      <footer style={{ textAlign: "center", paddingBottom: "28px", position: "relative", zIndex: 2 }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#6b5f4f", fontWeight: 700 }}>
          made with care ✦ for the one who keeps going
        </p>
      </footer>
    </main>
  );
}
