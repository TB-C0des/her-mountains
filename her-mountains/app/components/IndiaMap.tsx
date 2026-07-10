"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { geoMercator, geoPath } from "d3-geo";
import { states } from "../../data/states";

const GEOJSON_URL =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@ef25ebc/geojson/india.geojson";

type Feature = {
  type: string;
  properties: Record<string, string>;
  geometry: object;
};

function getStateName(props: Record<string, string>): string {
  return (
    props.st_nm ||
    props.NAME_1 ||
    props.name ||
    props.State_Name ||
    props.STATE ||
    ""
  );
}

export default function IndiaMap() {
  const router = useRouter();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch map data");
        return res.json();
      })
      .then((data) => {
        setFeatures(data.features || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const width = 700;
  const height = 760;
  const projection = geoMercator().fitSize(
    [width, height],
    { type: "FeatureCollection", features } as never
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathGen = geoPath(projection as any);

  const stamps = states
    .map((s) => {
      const feature = features.find(
        (f) =>
          getStateName(f.properties).toUpperCase() === s.name.toUpperCase()
      );
      if (!feature) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [cx, cy] = pathGen.centroid(feature as any);
      return { ...s, cx, cy };
    })
    .filter(Boolean) as Array<{
    id: string;
    name: string;
    cx: number;
    cy: number;
  }>;

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid rgba(43,36,28,0.22)",
        background: "rgba(240,230,208,0.97)",
        padding: "16px 12px 20px",
        boxShadow: "0 12px 56px rgba(43,36,28,0.28), 0 2px 8px rgba(43,36,28,0.12)",
      }}
    >
      <p className="eyebrow text-center mb-5" style={{ color: "#6b5f4f" }}>tap a state to open its stories</p>

      {status === "loading" && (
        <div className="flex flex-col items-center py-16 gap-3">
          <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" style={{ stroke: "#3e5169" }} strokeWidth="2" strokeDasharray="40 20" />
          </svg>
          <p className="font-mono text-xs" style={{ color: "#6b5f4f" }}>loading the map…</p>
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-center py-10" style={{ color: "#6b5f4f" }}>
          Couldn't load the map — use the list below.
        </p>
      )}

      {status === "ready" && (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
            style={{ display: "block" }}
          >
            <defs>
              <filter id="state-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {features.map((f, i) => {
              const name = getStateName(f.properties);
              const match = states.find(
                (s) => s.name.toUpperCase() === name.toUpperCase()
              );
              const isActive = !!match;
              const isHovered = hovered === match?.id;

              return (
                <path
                  key={i}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  d={pathGen(f as any) || ""}
                  className={`state-path ${isActive ? "active" : ""}`}
                  style={{
                    fill: isActive ? "#52705c" : "#b8a882",
                    fillOpacity: isHovered ? 1 : isActive ? 0.7 : 1,
                    stroke: "#f0e6d0",
                    strokeWidth: 0.6,
                    cursor: isActive ? "pointer" : "default",
                    filter: isHovered ? "drop-shadow(0 0 8px rgba(82,112,92,0.9))" : undefined,
                    transition: "fill-opacity 0.2s ease, filter 0.2s ease",
                  }}
                  onClick={() => match && router.push(`/states/${match.id}`)}
                  onMouseEnter={() => match && setHovered(match.id)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}

            {/* Stamp pins with pulse ring on hover */}
            {stamps.map((s) => {
              const isHov = hovered === s.id;
              return (
                <g
                  key={s.id}
                  className="state-group"
                  onClick={() => router.push(`/states/${s.id}`)}
                  onMouseEnter={() => setHovered(s.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  {isHov && (
                    <circle cx={s.cx} cy={s.cy} r={12} style={{ fill: "none", stroke: "#3e5169", strokeWidth: 1.2, opacity: 0.4 }} />
                  )}
                  <circle cx={s.cx} cy={s.cy} r={isHov ? 7 : 5.5} style={{ fill: "#3e5169", stroke: "#f5eedd", strokeWidth: 1.8, transition: "r 0.15s ease" }} className="stamp-pin" />
                  {isHov && (
                    <text x={s.cx} y={s.cy - 16} textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: "7.5px", fill: "#2b241c", fontWeight: 600, pointerEvents: "none" }}>{s.name}</text>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {states.map((s) => (
              <button
                key={s.id}
                onClick={() => router.push(`/states/${s.id}`)}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                className="font-mono text-xs px-3 py-1 rounded-full border transition-all"
                style={{
                  borderColor: "#3e5169",
                  color: hovered === s.id ? "#f5eedd" : "#3e5169",
                  backgroundColor: hovered === s.id ? "#3e5169" : "transparent",
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
