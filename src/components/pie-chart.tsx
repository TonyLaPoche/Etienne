import { CHART_COLORS } from "@/lib/brand";
import { formatScore, type Slice } from "@/lib/stats";

function slicePath(cx: number, cy: number, radius: number, start: number, end: number) {
  const x1 = cx + radius * Math.cos(start);
  const y1 = cy + radius * Math.sin(start);
  const x2 = cx + radius * Math.cos(end);
  const y2 = cy + radius * Math.sin(end);
  const large = end - start > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

export function PieChart({ title, slices }: { title: string; slices: Slice[] }) {
  const usable = slices.filter((slice) => slice.value > 0);
  if (usable.length === 0) {
    return (
      <section className="rounded-2xl border border-line bg-white p-4">
        <h2 className="font-display text-xl text-burgundy">{title}</h2>
        <p className="mt-2 text-sm text-muted">Pas encore de notes à répartir.</p>
      </section>
    );
  }
  const total = usable.reduce((sum, slice) => sum + slice.value, 0);
  let angle = -Math.PI / 2;

  return (
    <figure className="rounded-2xl border border-line bg-white p-4">
      <figcaption className="font-display text-xl text-burgundy">{title}</figcaption>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <svg viewBox="0 0 120 120" className="h-40 w-40 shrink-0" aria-hidden="true">
          {usable.length === 1 ? (
            <circle cx="60" cy="60" r="52" fill={CHART_COLORS[0]} />
          ) : (
            usable.map((slice, index) => {
              const sweep = (slice.value / total) * Math.PI * 2;
              const path = slicePath(60, 60, 52, angle, angle + sweep - 0.0001);
              angle += sweep;
              return <path key={slice.label} d={path} fill={CHART_COLORS[index % CHART_COLORS.length]} />;
            })
          )}
        </svg>
        <ul className="w-full min-w-0 space-y-2">
          {usable.map((slice, index) => {
            const percent = Math.round((slice.value / total) * 100);
            return (
              <li key={slice.label} className="flex items-start gap-2 text-sm">
                <span
                  className="mt-1 size-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="min-w-0 break-words">
                  {slice.label}
                  <span className="text-muted">
                    {" "}
                    · {formatScore(slice.value)} · {percent} %
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </figure>
  );
}
