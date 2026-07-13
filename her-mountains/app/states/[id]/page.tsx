import Link from "next/link";
import { treks as baseTreks } from "../../../data/treks";
import { getAllTreks } from "../../../lib/all-treks";
import { getAllStates } from "../../../lib/all-states";
import { getStateBg, getTrekCover } from "../../../lib/photos";
import AddTrekForm from "../../components/AddTrekForm";
import DeleteTrekButton from "../../components/DeleteTrekButton";

type Props = { params: Promise<{ id: string }> };

function MountainHero({ name }: { name: string }) {
  return (
    <div style={{ position: "relative", height: "280px", background: "linear-gradient(160deg, #e8d9bc 0%, #d4c49e 55%, #c9b48a 100%)", overflow: "hidden" }}>
      <svg style={{ position: "absolute", bottom: 0, width: "100%" }} viewBox="0 0 800 160" preserveAspectRatio="none">
        <path d="M0,160 L0,100 L80,58 L180,90 L280,24 L380,72 L450,38 L540,80 L620,42 L700,78 L800,36 L800,160Z" fill="rgba(82,112,92,0.22)" />
        <path d="M0,160 L0,120 L70,88 L155,108 L240,62 L330,98 L415,68 L510,105 L590,72 L675,100 L755,65 L800,82 L800,160Z" fill="rgba(82,112,92,0.40)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(43,36,28,0.55) 0%, transparent 60%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 28px 28px" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,238,221,0.65)", marginBottom: "4px" }}>stamped in your passport</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 8vw, 3.2rem)", fontWeight: 600, fontStyle: "italic", color: "#f5eedd", lineHeight: 1.05, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>{name}</h1>
      </div>
    </div>
  );
}

export default async function StatePage({ params }: Props) {
  const { id } = await params;
  const allStates = await getAllStates();
  const state = allStates.find((s) => s.id === id);

  if (!state) {
    return (
      <main style={{ minHeight: "100vh", background: "#1a1510", color: "#e8dcc8" }}>
        <section style={{ maxWidth: "672px", margin: "0 auto", padding: "64px 24px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontStyle: "italic", marginBottom: "16px" }}>State not found</h1>
          <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#c9a96e" }}>← back to the map</Link>
        </section>
      </main>
    );
  }

  const allTreks = await getAllTreks();
  const stateTreks = allTreks.filter((t) =>
    state.trekNames.includes(t.name) || t.state === state.name
  );
  const heroPhoto = (await getStateBg(state.id)) ?? (await getTrekCover(stateTreks[0]?.id ?? ""));
  const coverMap: Record<string, string | null> = {};
  for (const t of stateTreks) coverMap[t.id] = await getTrekCover(t.id);

  return (
    <main style={{ minHeight: "100vh", background: "#ddd5c0", color: "#2b241c" }} className="page-fade-in">

      {/* Hero */}
      {heroPhoto ? (
        <div style={{ position: "relative", height: "clamp(280px, 45vw, 380px)", backgroundImage: `url(${heroPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          {/* Dark gradient only at the bottom for text legibility — no light wash */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,14,8,0.72) 0%, rgba(20,14,8,0.25) 40%, transparent 75%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 28px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,238,221,0.65)", marginBottom: "4px" }}>stamped in your passport</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 8vw, 3.2rem)", fontWeight: 600, fontStyle: "italic", color: "#f5eedd", lineHeight: 1.05, textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}>{state.name}</h1>
          </div>
        </div>
      ) : (
        <MountainHero name={state.name} />
      )}

      {/* Content */}
      <section style={{ maxWidth: "672px", margin: "0 auto", padding: "32px 24px 80px" }}>

        <p style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontStyle: "italic", color: "#4a3f35", marginBottom: "36px", lineHeight: 1.6 }}>
          {state.tagline}
        </p>

        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4f45", marginBottom: "16px" }}>
          treks · {stateTreks.length} recorded
        </p>

        {stateTreks.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {stateTreks.map((trek, idx) => (
              <Link
                key={trek.id}
                href={`/treks/${trek.id}`}
                className="trek-card"
                style={{ display: "flex", alignItems: "stretch", borderRadius: "10px", border: "1px solid rgba(43,36,28,0.18)", overflow: "hidden", background: "rgba(210,200,178,0.75)", textDecoration: "none", color: "inherit" }}
              >
                <div style={{ width: "48px", flexShrink: 0, background: idx % 2 === 0 ? "linear-gradient(180deg, #52705c, #3d5445)" : "linear-gradient(180deg, #3e5169, #2d3d52)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", padding: "12px 0" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "rgba(245,238,221,0.7)", letterSpacing: "0.1em" }}>{String(idx + 1).padStart(2, "0")}</span>
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 13L6 4L9 8L12 3L17 13H1Z" fill="rgba(245,238,221,0.35)" /></svg>
                </div>
                {coverMap[trek.id] && (
                  <div style={{ width: "90px", flexShrink: 0, backgroundImage: `url(${coverMap[trek.id]})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#c8b99a" }} />
                )}
                <div style={{ flex: 1, minWidth: 0, padding: "14px 16px" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 600, fontStyle: "italic", lineHeight: 1.2, marginBottom: "5px", color: "#1e1810" }}>{trek.name}</p>
                  <p style={{ fontSize: "0.83rem", color: "#4a3f35", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{trek.yourLines[0]}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", paddingRight: "16px", color: "#3e5169", fontFamily: "var(--font-mono)", fontSize: "1rem" }}>→</div>
                <DeleteTrekButton
                  trekId={trek.id}
                  trekName={trek.name}
                  isCustom={!baseTreks.some((b) => b.id === trek.id)}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "0.9rem", fontStyle: "italic", color: "#4a3f35" }}>No treks recorded for this state yet.</p>
        )}

        {/* Add trek form */}
        <AddTrekForm stateId={state.id} stateName={state.name} />

        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid rgba(43,36,28,0.18)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#3e5169", textDecoration: "none" }}>← back to the map</Link>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "rgba(43,36,28,0.25)", letterSpacing: "0.15em" }}>HER MOUNTAINS</span>
        </div>
      </section>
    </main>
  );
}
