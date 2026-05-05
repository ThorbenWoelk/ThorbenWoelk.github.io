// word-cloud.jsx
// Three proper word clouds (spiral packing, like d3-cloud) for slides 18a/b/c:
//   1) BEHERRSCHE  — daily-driver tech & skills (largest)
//   2) KENNE        — touched, can ramp back into quickly
//   3) NICHT-MEINS  — weaknesses / not my forte (the funny one)
//
// Each cloud is mounted into a #cloud-mount-N div (N=1,2,3). Words have
// weights; weights map to font sizes; placement uses an Archimedean spiral
// with axis-aligned bbox collision detection. Result looks like a classic
// word cloud — words tightly packed, varying sizes, mixed orientations.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scale": 1.0,
  "rotateChance": 0.18,
  "seed": 7
}/*EDITMODE-END*/;

// ── Data ─────────────────────────────────────────────────────────────────
const BEHERRSCHE = [
  { w: "Python", s: 1.00 },
  { w: "SQL", s: 0.98 },
  { w: "dbt", s: 0.92 },
  { w: "BigQuery", s: 0.92 },
  { w: "Google Cloud", s: 0.88 },
  { w: "AWS", s: 0.85 },
  { w: "Terraform", s: 0.82 },
  { w: "Kubernetes", s: 0.80 },
  { w: "Docker", s: 0.78 },
  { w: "Looker", s: 0.74 },
  { w: "Airflow", s: 0.70 },
  { w: "GitHub Actions", s: 0.72 },
  { w: "Pub/Sub", s: 0.68 },
  { w: "Streaming", s: 0.66 },
  { w: "DataOps", s: 0.78 },
  { w: "Architektur", s: 0.82 },
  { w: "Mentoring", s: 0.74 },
  { w: "Plattform-Denken", s: 0.86 },
  { w: "Agile Coaching", s: 0.66 },
  { w: "TDD", s: 0.60 },
  { w: "Pydantic", s: 0.62 },
  { w: "Streamlit", s: 0.58 },
];

const KENNE = [
  { w: "Rust", s: 0.92 },
  { w: "TypeScript", s: 0.90 },
  { w: "Databricks", s: 0.94 },
  { w: "Spark", s: 0.86 },
  { w: "PySpark", s: 0.82 },
  { w: "Kafka", s: 0.80 },
  { w: "Azure", s: 0.78 },
  { w: "Redshift", s: 0.74 },
  { w: "Postgres", s: 0.74 },
  { w: "SurrealDB", s: 0.62 },
  { w: "Neo4j", s: 0.66 },
  { w: "Vertex AI", s: 0.78 },
  { w: "Bedrock", s: 0.78 },
  { w: "Sagemaker", s: 0.74 },
  { w: "LangGraph", s: 0.72 },
  { w: "CrewAI", s: 0.66 },
  { w: "Haystack", s: 0.66 },
  { w: "PyTorch", s: 0.78 },
  { w: "sklearn", s: 0.72 },
  { w: "Svelte", s: 0.68 },
  { w: "Ansible", s: 0.66 },
  { w: "CDK", s: 0.62 },
  { w: "Grafana", s: 0.66 },
  { w: "Ollama", s: 0.62 },
];

const NICHT = [
  { w: "Frontend-CSS-Magie", s: 1.00 },
  { w: "Pixel-Pushing", s: 0.86 },
  { w: "Designsysteme", s: 0.78 },
  { w: "C++", s: 0.84 },
  { w: "Java-Enterprise", s: 0.82 },
  { w: "Excel-Makros", s: 0.78 },
  { w: "SAP", s: 0.92 },
  { w: "Powerpoint-Animationen", s: 0.70 },
  { w: "Game-Engines", s: 0.74 },
  { w: "Mobile Native", s: 0.74 },
  { w: "Embedded", s: 0.78 },
  { w: "Salesforce", s: 0.72 },
  { w: "Nein-sagen", s: 0.92 },
  { w: "kurze E-Mails", s: 0.74 },
  { w: "Meetings ohne Agenda", s: 0.66 },
  { w: "früh aufstehen", s: 0.70 },
  { w: "Smalltalk", s: 0.74 },
  { w: "Bürokratie", s: 0.82 },
  { w: "Jira-Geduld", s: 0.66 },
  { w: "wenig Kaffee", s: 0.62 },
];

const PLATTFORM_TECH = [
  { w: "dbt Platform", s: 1.00, highlight: true },
  { w: "BigQuery (GCP)", s: 0.98, highlight: true },
  { w: "Snowplow", s: 0.96, highlight: true },
  { w: "Looker", s: 0.94 },
  { w: "Cloud Run (GCP)", s: 0.92 },
  { w: "Pub/Sub (GCP)", s: 0.90 },
  { w: "Workflows (GCP)", s: 0.89 },
  { w: "Kubernetes", s: 0.88, highlight: true },
  { w: "Terraform", s: 0.87 },
  { w: "GitHub Actions", s: 0.86 },
  { w: "Cloud Functions (GCP)", s: 0.72 },
  { w: "Dataproc (GCP)", s: 0.70 },
  { w: "Secret Manager (GCP)", s: 0.68 },
  { w: "IAM (GCP)", s: 0.66 },
  { w: "GCP Monitoring & Logging", s: 0.64 },
  { w: "dbt Expectations", s: 0.62 },
  { w: "SQLFluff", s: 0.60 },
  { w: "elementary", s: 0.58 },
  { w: "Grafana", s: 0.56 },
  { w: "Prometheus", s: 0.54 },
  { w: "DataHub", s: 0.52 },
];

// ── Spiral packing ───────────────────────────────────────────────────────
function seededRand(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Estimate bbox for a word — generous so collisions never get close.
// Cormorant glyph widths are uneven; we err on the side of "too big".
function estimateBox(word, fontSize, rotated) {
  // Wider per-char estimate (0.52 ≈ avg width incl. caps & wide chars)
  // plus a generous padding margin so adjacent words breathe.
  const w = word.length * fontSize * 0.52 + fontSize * 0.4;
  const h = fontSize * 1.15 + fontSize * 0.2;
  return rotated ? { w: h, h: w } : { w, h };
}

function intersects(a, b) {
  return !(a.x + a.w < b.x || b.x + b.w < a.x ||
           a.y + a.h < b.y || b.y + b.h < a.y);
}

function layoutCloud(words, opts) {
  const { width, height, scale, rotateChance, seed, minSize, maxSize, palette, maxSteps = 6000 } = opts;
  const rand = seededRand(seed);

  // Sort by weight desc — biggest words go to center first
  const sorted = [...words].sort((a, b) => b.s - a.s);

  const placed = [];
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < sorted.length; i++) {
    const word = sorted[i];
    const fontSize = Math.round((minSize + word.s * (maxSize - minSize)) * scale);
    const rotated = rand() < rotateChance;
    const box = estimateBox(word.w, fontSize, rotated);

    // Spiral search
    let placedBox = null;
    const stepBase = 4 + fontSize * 0.06;
    for (let step = 0; step < maxSteps; step++) {
      const t = step * 0.15;
      const r = stepBase * Math.sqrt(step) * 0.5;
      const ang = t;
      const x = cx + r * Math.cos(ang) - box.w / 2;
      const y = cy + r * Math.sin(ang) * 0.62 - box.h / 2; // ellipse
      const candidate = { x, y, w: box.w, h: box.h };

      // Reject if outside container
      if (x < 4 || y < 4 || x + box.w > width - 4 || y + box.h > height - 4) {
        continue;
      }

      let collides = false;
      for (let j = 0; j < placed.length; j++) {
        if (intersects(candidate, placed[j].box)) { collides = true; break; }
      }
      if (!collides) { placedBox = candidate; break; }
    }

    if (!placedBox) continue; // give up on this word; very rare

    // Color: pick from palette; highlighted terms get the gold emphasis.
    let color;
    if (word.highlight) color = palette.gold;
    else if (word.s >= 0.85) color = palette.bright;
    else if (word.s >= 0.7)  color = palette.mid;
    else                     color = palette.dim;

    // Center text on its box
    const left = placedBox.x + placedBox.w / 2;
    const top  = placedBox.y + placedBox.h / 2;

    placed.push({
      word: word.w,
      highlight: Boolean(word.highlight),
      fontSize,
      rotated,
      color,
      left, top,
      box: placedBox,
    });
  }
  return placed;
}

// ── Cloud component ──────────────────────────────────────────────────────
function Cloud({ words, paletteName, minSize = 24, maxSize = 96, rotateChance, maxSteps }) {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const [t] = (typeof useTweaks === "function") ? useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS];

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      // offsetWidth/Height work even when slide is visibility:hidden
      // (deck-stage hides inactive slides but layout is still computed).
      const w = el.offsetWidth || el.getBoundingClientRect().width;
      const h = el.offsetHeight || el.getBoundingClientRect().height;
      if (w > 0 && h > 0) setSize({ w, h });
    };
    measure();
    // Re-measure a few times in case deck-stage scales after mount
    const timers = [50, 200, 600, 1500].map(ms => setTimeout(measure, ms));
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => { ro.disconnect(); timers.forEach(clearTimeout); };
  }, []);

  // Fallback to known stage size (slide is 1920×1080; cloud area ≈ 1720×620)
  const effW = size.w > 0 ? size.w : 1720;
  const effH = size.h > 0 ? size.h : 620;

  const palette = paletteName === "muted"
    ? { gold: "#c9b07a", bright: "#a8a39a", mid: "#7a7670", dim: "#555049" }
    : { gold: "#c9b07a", bright: "#d8d4cc", mid: "#a8a39a", dim: "#7a7670" };

  const effectiveRotateChance = rotateChance ?? t.rotateChance;

  const placed = React.useMemo(() => {
    return layoutCloud(words, {
      width: effW,
      height: effH,
      scale: t.scale,
      rotateChance: effectiveRotateChance,
      seed: t.seed,
      minSize,
      maxSize,
      maxSteps,
      palette,
    });
  }, [effW, effH, words, t.scale, effectiveRotateChance, t.seed, minSize, maxSize, maxSteps, paletteName]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      {placed.map((p, i) => (
        <span
          key={p.word + i}
          style={{
            position: "absolute",
            left: `${p.left}px`,
            top: `${p.top}px`,
            transform: `translate(-50%, -50%) rotate(${p.rotated ? -90 : 0}deg)`,
            fontFamily: "'Cormorant Garamond','Times New Roman',Georgia,serif",
            fontSize: `${p.fontSize}px`,
            fontWeight: p.fontSize > 70 ? 500 : 400,
            fontStyle: "normal",
            color: p.color,
            whiteSpace: "nowrap",
            lineHeight: 1,
            letterSpacing: "-0.01em",
          }}
        >
          {p.word}
        </span>
      ))}
    </div>
  );
}

// ── Mounting ─────────────────────────────────────────────────────────────
function mountAll() {
  const targets = [
    { id: "cloud-mount-1",         words: BEHERRSCHE,     palette: "bright" },
    { id: "cloud-mount-2",         words: KENNE,          palette: "bright" },
    { id: "cloud-mount-3",         words: NICHT,          palette: "muted"  },
    { id: "cloud-mount-plattform", words: PLATTFORM_TECH, palette: "bright", minSize: 12, maxSize: 60, rotateChance: 0, maxSteps: 30000 },
  ];
  let mountedAny = false;
  for (const t of targets) {
    const el = document.getElementById(t.id);
    if (!el) continue;
    if (el.dataset.mounted === "1") { mountedAny = true; continue; }
    el.dataset.mounted = "1";
    const root = ReactDOM.createRoot(el);
    root.render(
      <Cloud
        words={t.words}
        paletteName={t.palette}
        minSize={t.minSize}
        maxSize={t.maxSize}
        rotateChance={t.rotateChance}
        maxSteps={t.maxSteps}
      />
    );
    mountedAny = true;
  }
  return mountedAny;
}

(function tryMount() {
  if (mountAll()) {/* re-attempt to catch slides not yet in DOM */}
  let tries = 0;
  const iv = setInterval(() => {
    mountAll();
    if (++tries > 40) clearInterval(iv);
  }, 100);
})();
