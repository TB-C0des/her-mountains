"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { geoMercator, geoPath, geoContains } from "d3-geo";
import { states } from "../../data/states";

const GEOJSON_URL =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@ef25ebc/geojson/india.geojson";

type Feature = {
  type: string;
  properties: Record<string, string>;
  geometry: object;
};

export type TrekPinData = {
  trekId: string;
  trekName: string;
  stateId: string;
};

function getStateName(props: Record<string, string>): string {
  return props.st_nm || props.NAME_1 || props.name || props.State_Name || props.STATE || "";
}

/**
 * Greedy farthest-point placement with polygon containment check.
 * Builds a dense candidate grid up to maxRadius from centroid,
 * filters to only points inside the state polygon, then greedily
 * places each pin as far as possible from all already-placed pins.
 */
function greedyPinOffsets(
  n: number,
  isInside: (dx: number, dy: number) => boolean,
  maxRadius = 60
): Array<[number, number]> {
  if (n === 1) return [[0, 0]];

  // Fine 4px grid — more candidates means better coverage of irregular shapes
  const candidates: Array<[number, number]> = [[0, 0]];
  const step = 4;
  for (let x = -maxRadius; x <= maxRadius; x += step) {
    for (let y = -maxRadius; y <= maxRadius; y += step) {
      if (x === 0 && y === 0) continue;
      if (Math.hypot(x, y) <= maxRadius && isInside(x, y)) {
        candidates.push([x, y]);
      }
    }
  }

  // Greedy farthest-point — each new pin maximises min distance to placed pins
  const placed: Array<[number, number]> = [[0, 0]];

  for (let i = 1; i < n; i++) {
    let best: [number, number] = [0, 0];
    let bestScore = -1;

    for (const c of candidates) {
      if (placed.some((p) => Math.hypot(c[0] - p[0], c[1] - p[1]) < 4)) continue;
      const minDist = Math.min(...placed.map((p) => Math.hypot(c[0] - p[0], c[1] - p[1])));
      if (minDist > bestScore) {
        bestScore = minDist;
        best = c;
      }
    }

    placed.push(best);
  }

  return placed;
}

export default function IndiaMap({ treks }: { treks: TrekPinData[] }) {
  const router = useRouter();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setFeatures(d.features || []); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, []);

  const width = 700, height = 760;
  const projection = geoMercator().fitSize([width, height], { type: "FeatureCollection", features } as never);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathGen = geoPath(projection as any);

  const trekPins = states.flatMap((state) => {
    const feature = features.find(
      (f) => getStateName(f.properties).toUpperCase() === state.name.toUpperCase()
    );
    if (!feature) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [cx, cy] = pathGen.centroid(feature as any);
    if (isNaN(cx) || isNaN(cy)) return [];

    const stateTreks = treks.filter((t) => t.stateId === state.id);
    if (stateTreks.length === 0) return [];

    // Bounding box for radius estimation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bounds = pathGen.bounds(feature as any);
    const stateW = bounds[1][0] - bounds[0][0];
    const stateH = bounds[1][1] - bounds[0][1];
    // Search across 40% of bounding box — large enough to use the full state area
    const searchRadius = Math.max(20, Math.min(stateW, stateH) * 0.40);

    // Use geoContains for hard boundary enforcement
    // projection is a GeoProjection so .invert() is available
    const isInside = (dx: number, dy: number): boolean => {
      const lonlat = projection.invert!([cx + dx, cy + dy]);
      if (!lonlat) return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return geoContains(feature as any, lonlat);
    };

    const offsets = greedyPinOffsets(stateTreks.length, isInside, searchRadius);
    return stateTreks.map((trek, i) => ({
      ...trek,
      x: cx + offsets[i][0],
      y: cy + offsets[i][1],
    }));
  });

  const isStateHovered = (stateId: string) =>
    trekPins.some((p) => p.stateId === stateId && hovered === p.trekId);

  return (
    <div style={{
      borderRadius: "16px",
      border: "1px solid rgba(43,36,28,0.22)",
      background: "rgba(240,230,208,0.97)",
      padding: "16px 12px 20px",
      boxShadow: "0 12px 56px rgba(43,36,28,0.28), 0 2px 8px rgba(43,36,28,0.12)",
    }}>
      <p className="eyebrow text-center mb-5" style={{ color: "#6b5f4f" }}>
        tap a pin to open a trek · tap a state to see all
      </p>

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
          Couldn't load the map — use the buttons below.
        </p>
      )}

      {status === "ready" && (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ display: "block" }}>

            {/* State fills */}
            {features.map((f, i) => {
              const name = getStateName(f.properties);
              const match = states.find((s) => s.name.toUpperCase() === name.toUpperCase());
              const isActive = !!match;
              const stateHov = isActive && isStateHovered(match!.id);
              return (
                <path
                  key={i}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  d={pathGen(f as any) || ""}
                  className={`state-path ${isActive ? "active" : ""}`}
                  style={{
                    fill: isActive ? "#52705c" : "#b8a882",
                    fillOpacity: stateHov ? 1 : isActive ? 0.7 : 1,
                    stroke: "#f0e6d0",
                    strokeWidth: 0.6,
                    cursor: isActive ? "pointer" : "default",
                    filter: stateHov ? "drop-shadow(0 0 8px rgba(82,112,92,0.9))" : undefined,
                    transition: "fill-opacity 0.2s ease, filter 0.2s ease",
                  }}
                  onClick={() => match && router.push(`/states/${match.id}`)}
                  onMouseEnter={() => {
                    if (match) {
                      const first = trekPins.find((p) => p.stateId === match.id);
                      if (first) setHovered(first.trekId);
                    }
                  }}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}

            {/* One pin per trek */}
            {trekPins.map((pin) => {
              const isHov = hovered === pin.trekId;
              return (
                <g
                  key={pin.trekId}
                  onClick={() => router.push(`/treks/${pin.trekId}`)}
                  onMouseEnter={() => setHovered(pin.trekId)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  {isHov && (
                    <circle cx={pin.x} cy={pin.y} r={11}
                      style={{ fill: "none", stroke: "#c97b4b", strokeWidth: 1.2, opacity: 0.6 }}
                    />
                  )}
                  <circle
                    cx={pin.x} cy={pin.y} r={isHov ? 6.5 : 5}
                    className="stamp-pin"
                    style={{ fill: "#3e5169", stroke: "#f5eedd", strokeWidth: 1.6, transition: "r 0.15s ease" }}
                  />
                  {isHov && (
                    <text x={pin.x} y={pin.y - 14} textAnchor="middle"
                      style={{ fontFamily: "var(--font-mono)", fontSize: "7px", fill: "#2b241c", fontWeight: 700, pointerEvents: "none" }}
                    >{pin.trekName}</text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* State pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {states.map((s) => (
              <button
                key={s.id}
                onClick={() => router.push(`/states/${s.id}`)}
                onMouseEnter={() => {
                  const first = trekPins.find((p) => p.stateId === s.id);
                  if (first) setHovered(first.trekId);
                }}
                onMouseLeave={() => setHovered(null)}
                className="font-mono rounded-full border transition-all"
                style={{
                  borderColor: "#3e5169",
                  color: isStateHovered(s.id) ? "#f5eedd" : "#3e5169",
                  backgroundColor: isStateHovered(s.id) ? "#3e5169" : "transparent",
                  padding: "8px 24px",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
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
