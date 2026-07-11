export default function ContourBackground() {
  // Hand-tuned contour lines that feel like a topo map
  const lines = [
    "M0,80  C120,50  220,110 400,70  S650,40  800,80",
    "M0,130 C100,100 240,155 400,120 S620,90  800,125",
    "M0,180 C140,155 200,200 400,170 S640,140 800,178",
    "M0,235 C110,210 250,255 400,225 S660,200 800,232",
    "M0,290 C130,265 210,305 400,278 S650,258 800,288",
    "M0,345 C100,322 240,360 400,335 S640,315 800,343",
    "M0,395 C120,372 220,412 400,385 S655,365 800,393",
  ];

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      viewBox="0 0 800 460"
      style={{ zIndex: -1 }}
    >
      {lines.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity={0.04 + i * 0.005}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}
