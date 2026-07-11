import { getAllTreks } from "../../../lib/all-treks";
import { states } from "../../../data/states";
import Link from "next/link";
import TrekGallery from "../../components/TrekGallery";
import TrekGalleryUploader from "../../components/PhotoUploader";
import { getTrekPhotos, getTrekCover } from "../../../lib/photos";

type Props = { params: Promise<{ id: string }> };

export default async function TrekPage({ params }: Props) {
  const { id } = await params;
  const allTreks = getAllTreks();
  const trek = allTreks.find((t) => t.id === id);

  if (!trek) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5eedd", color: "#2b241c" }}>
        <section style={{ maxWidth: "672px", margin: "0 auto", padding: "64px 24px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontStyle: "italic", marginBottom: "16px" }}>
            Trek not found
          </h1>
          <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#3e5169" }}>
            ← back to the map
          </Link>
        </section>
      </main>
    );
  }

  const parentState = states.find((s) => s.trekNames.includes(trek.name));

  // Dynamically read photos from disk — no code change needed to add more
  const coverPhoto = await getTrekCover(trek.id);
  const galleryPhotos = await getTrekPhotos(trek.id);

  return (
    <main
      className="page-fade-in"
      style={{ minHeight: "100vh", background: "#ede4d0", color: "#2b241c" }}
    >
      {/* ── Full-bleed hero cover photo ── */}
      <div
        style={{
          position: "relative",
          height: "clamp(320px, 52vw, 500px)",
          overflow: "hidden",
          backgroundColor: "#ddd2b8",
        }}
      >
        {/* The photo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${coverPhoto})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Only a thin fade at the very bottom — no white wash */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, transparent 35%, rgba(237,228,208,0.55) 88%, #ede4d0 100%)" }} />
      </div>

      {/* ── Content ── */}
      <section
        style={{
          maxWidth: "800px",
          margin: "-24px auto 0",
          padding: "0 32px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Breadcrumb */}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b5f4f", marginBottom: "10px" }}>
          {trek.state}
          {parentState && (
            <Link href={`/states/${parentState.id}`} style={{ color: "#3e5169", marginLeft: "6px", textDecoration: "none" }}>↗</Link>
          )}
        </p>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 7vw, 3.2rem)", fontWeight: 600, fontStyle: "italic", lineHeight: 1.05, marginBottom: "32px", letterSpacing: "-0.02em", color: "#2b241c" }}>
          {trek.name}
        </h1>

        {/* Personal note card */}
        <div style={{ borderRadius: "12px", padding: "24px 28px", marginBottom: "20px", background: "rgba(210,196,168,0.7)", borderLeft: "4px solid #d97a46" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#d97a46", marginBottom: "12px" }}>a note for you</p>
          {trek.yourLines.map((line) => (
            <p key={line} style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontStyle: "italic", color: "#2b241c", lineHeight: 1.65 }}>"{line}"</p>
          ))}
        </div>

        {/* Memory corner */}
        <div style={{ borderRadius: "12px", padding: "24px 28px", marginBottom: "40px", background: "rgba(180,196,210,0.14)", border: "1px solid rgba(62,81,105,0.2)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5b7089", marginBottom: "18px" }}>memory corner</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "16px", listStyle: "none", padding: 0, margin: 0 }}>
            {trek.prompts.map((prompt, i) => (
              <li key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#3e5169", flexShrink: 0, paddingTop: "2px" }}>{String(i + 1).padStart(2, "0")}</span>
                <p style={{ fontSize: "1rem", color: "#6b5f4f", lineHeight: 1.65, margin: 0 }}>{prompt}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Gallery divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
          <span style={{ flex: 1, height: "1px", background: "rgba(43,36,28,0.12)", display: "block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b5f4f" }}>photos you carried back</span>
          <span style={{ flex: 1, height: "1px", background: "rgba(43,36,28,0.12)", display: "block" }} />
        </div>

        {/* Gallery */}
        <TrekGallery photos={galleryPhotos} trekName={trek.name} />

        {/* Upload new photos */}
        <TrekGalleryUploader trekId={trek.id} />

        {/* Nav */}
        <div style={{ marginTop: "56px", paddingTop: "22px", borderTop: "1px solid rgba(43,36,28,0.1)", display: "flex", gap: "28px", alignItems: "center" }}>
          {parentState && (
            <Link href={`/states/${parentState.id}`} style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#3e5169", textDecoration: "none" }}>← {parentState.name}</Link>
          )}
          <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#6b5f4f", textDecoration: "none" }}>← the map</Link>
        </div>
      </section>
    </main>
  );
}
