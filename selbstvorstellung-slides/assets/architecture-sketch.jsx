// ── Architektur-Skizze (Slide 05) ───────────────────────────────────────
// Hand-drawn, monochrome, schematic. Builds the architecture step by step.
// Drives an SVG #arch-svg with viewBox 0 0 1720 800.
//
// Steps (timing in seconds):
//   I.   brown state          0.0 – 14.0  (full size)
//   I.b  brown shrinks         14.0 – 18.0  (migrates upper-left, fades)
//   II.  ingest                 18.0
//   III. transform              22.0
//   IV.  lift & shift           26.0  (arrows from shrunk brown into ingest and transform)
//   IV.b lift&shift fades       32.0  (transition viz disappears)
//   V.   consume                33.0
//   VI.  orchestrate            37.0
//   VII. observe                40.5
//   VIII. IaC & CI/CD           44.0
//   IX.  replicate (env)        47.5
//   X.   multi-tenancy          51.0
//   XI.  refactor transform     55.0
//   XII. refactor ingest        58.5
//   XIII. productize            62.0
//   ---  end                    70.0
//
(function() {
  const { useState, useEffect, useRef } = React;

  const STEPS = [
    { t: 0.0,  label: "Brownfield: verstreute Jobs" },
    { t: 14.0, label: "— Brownfield rückt zurück" },
    { t: 18.0, label: "Ingest" },
    { t: 22.0, label: "Transform" },
    { t: 26.0, label: "Lift & shift" },
    { t: 33.0, label: "Consume" },
    { t: 37.0, label: "Orchestrate" },
    { t: 40.5, label: "Observe · monitor · alert" },
    { t: 44.0, label: "IaC · CI/CD" },
    { t: 47.5, label: "Replicate — Environment" },
    { t: 51.0, label: "Multi-Tenancy" },
    { t: 55.0, label: "Refactor — Transform" },
    { t: 58.5, label: "Refactor — Ingest" },
    { t: 62.0, label: "Productize — A & B" },
    { t: 70.0, label: "—" },
  ];
  const DURATION = 70.0;

  const T = {
    brown:        0.0,
    brownShrink: 14.0,
    ingest:      18.0,
    transform:   22.0,
    liftShift:   26.0,
    liftFade:    32.0,
    consume:     33.0,
    orchestrate: 37.0,
    observe:     40.5,
    iac:         44.0,
    replicate:   47.5,
    multitenancy: 51.0,
    refactorT:   55.0,
    refactorI:   58.5,
    productize:  62.0,
  };

  const easeInOut = (t) => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const fadeIn  = (t, start, dur = 0.9) => easeInOut(clamp01((t - start) / dur));
  const fadeOut = (t, start, dur = 0.9) => 1 - easeInOut(clamp01((t - start) / dur));

  // ── Hand-drawn primitives ──────────────────────────────────────────────
  function HandBox({ x, y, w, h, label, sub, sub2, opacity = 1, draw = 1, color, dashed = false, fill, labelColor, subColor }) {
    const j = 1.2;
    const r = (s) => Math.abs((Math.sin(s * 12.9898 + (x+y+w+h)) * 43758.5453) % 1);
    const o1 = r(1)*j, o2 = r(2)*j, o3 = r(3)*j, o4 = r(4)*j, o5 = r(5)*j, o6 = r(6)*j, o7 = r(7)*j, o8 = r(8)*j;
    const d = `M ${x+o1} ${y+o2} L ${x+w-o3} ${y+o4} L ${x+w-o5} ${y+h-o6} L ${x+o7} ${y+h-o8} Z`;
    const len = 2*w + 2*h + 8;
    const dashOff = len * (1 - clamp01(draw));
    const stroke = color || "var(--ink)";
    return (
      <g style={{opacity}}>
        {fill && (
          <path d={d} fill={fill} stroke="none" opacity={clamp01(draw)} />
        )}
        <path d={d} fill="none"
          stroke={stroke} strokeWidth={1.8}
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={dashed ? "6 6" : len}
          strokeDashoffset={dashed ? 0 : dashOff} />
        {label && (
          <text x={x + w/2} y={y + h/2 + (sub || sub2 ? (sub2 ? -14 : -2) : 8)} textAnchor="middle"
                fontFamily="'Cormorant Garamond', serif" fontSize="28"
                fontStyle="italic" fontWeight="400"
                fill={labelColor || "var(--ink)"}
                opacity={Math.max(0, draw - 0.4) * 1.7}>
            {label}
          </text>
        )}
        {sub && (
          <text x={x + w/2} y={y + h/2 + (sub2 ? 6 : 22)} textAnchor="middle"
                fontFamily="'Inter', sans-serif" fontSize="10" letterSpacing="0.22em"
                fill={subColor || "var(--ink-faint)"}
                opacity={Math.max(0, draw - 0.5) * 2}>
            {sub.toUpperCase()}
          </text>
        )}
        {sub2 && (
          <text x={x + w/2} y={y + h/2 + 22} textAnchor="middle"
                fontFamily="'Inter', sans-serif" fontSize="10" letterSpacing="0.22em"
                fill={subColor || "var(--ink-faint)"}
                opacity={Math.max(0, draw - 0.5) * 2}>
            {sub2.toUpperCase()}
          </text>
        )}
      </g>
    );
  }

  function HandLine({ x1, y1, x2, y2, opacity = 1, draw = 1, arrow = true, dashed = false, color, curvy = 0, marker, markerAt = 0.52 }) {
    const dx = x2 - x1, dy = y2 - y1;
    const mx = (x1+x2)/2 + curvy * (-dy * 0.15);
    const my = (y1+y2)/2 + curvy * (dx * 0.15);
    const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
    const len = Math.sqrt(dx*dx + dy*dy) * (1 + Math.abs(curvy)*0.2) + 4;
    const dashOff = len * (1 - clamp01(draw));
    const stroke = color || "var(--ink)";
    const ang = Math.atan2(y2 - my, x2 - mx);
    const ah = 7;
    const a1x = x2 - ah * Math.cos(ang - 0.4);
    const a1y = y2 - ah * Math.sin(ang - 0.4);
    const a2x = x2 - ah * Math.cos(ang + 0.4);
    const a2y = y2 - ah * Math.sin(ang + 0.4);
    const mt = clamp01(markerAt);
    const markerX = (1-mt)*(1-mt)*x1 + 2*(1-mt)*mt*mx + mt*mt*x2;
    const markerY = (1-mt)*(1-mt)*y1 + 2*(1-mt)*mt*my + mt*mt*y2;
    return (
      <g style={{opacity}}>
        <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"
              strokeDasharray={dashed ? "5 5" : len}
              strokeDashoffset={dashed ? 0 : dashOff} />
        {marker && draw > 0.72 && (
          <FlowMarker kind={marker} x={markerX} y={markerY} color={stroke} opacity={(draw - 0.72) / 0.28} />
        )}
        {arrow && draw > 0.85 && (
          <g opacity={(draw - 0.85) / 0.15}>
            <line x1={x2} y1={y2} x2={a1x} y2={a1y} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={x2} y1={y2} x2={a2x} y2={a2y} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  }

  function FlowMarker({ kind, x, y, color, opacity = 1 }) {
    const stroke = color || "var(--ink-faint)";
    if (kind === "cron") {
      return (
        <g transform={`translate(${x} ${y})`} opacity={opacity}>
          <circle cx="0" cy="0" r="9" fill="var(--paper-alt)" stroke={stroke} strokeWidth="1.2" />
          <line x1="0" y1="0" x2="0" y2="-5" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="4" y2="2.5" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="0" cy="0" r="1.3" fill={stroke} />
        </g>
      );
    }
    if (kind === "issue") {
      return (
        <g transform={`translate(${x} ${y})`} opacity={opacity}>
          <path d="M -2 -10 L 7 -10 L 2 -2 L 8 -2 L -3 11 L 1 2 L -5 2 Z"
                fill="var(--paper-alt)" stroke={stroke} strokeWidth="1.2"
                strokeLinejoin="round" />
        </g>
      );
    }
    return null;
  }

  function HandIcon({ x, y, r = 14, kind = "db", opacity = 1, draw = 1 }) {
    const stroke = "var(--ink)";
    const off = (1 - clamp01(draw));
    const done = draw >= 0.99;
    if (kind === "db") {
      // Cylinder: top ellipse + body. Use no dasharray once drawn so the path is fully closed.
      const ellipseLen = Math.PI * 2 * r;
      const bodyLen = 2*r + 2*Math.PI*r*0.35;
      return (
        <g style={{opacity}} transform={`translate(${x},${y})`}>
          <ellipse cx="0" cy={-r} rx={r} ry={r*0.35} fill="none" stroke={stroke} strokeWidth="1.4"
            strokeDasharray={done ? "none" : ellipseLen}
            strokeDashoffset={done ? 0 : ellipseLen*off} />
          <path d={`M ${-r} ${-r} L ${-r} ${r} A ${r} ${r*0.35} 0 0 0 ${r} ${r} L ${r} ${-r}`}
            fill="none" stroke={stroke} strokeWidth="1.4"
            strokeDasharray={done ? "none" : bodyLen}
            strokeDashoffset={done ? 0 : bodyLen*off}/>
          {/* second ellipse on body bottom for cylinder feel — only when fully drawn */}
          {done && (
            <path d={`M ${-r} ${r*0.0} A ${r} ${r*0.35} 0 0 0 ${r} ${r*0.0}`}
              fill="none" stroke={stroke} strokeWidth="1.0" opacity="0.5"/>
          )}
        </g>
      );
    }
    if (kind === "dash") {
      const rectLen = 2 * (r*2 + r*1.4);
      return (
        <g style={{opacity}} transform={`translate(${x-r},${y-r*0.7})`}>
          <rect x="0" y="0" width={r*2} height={r*1.4} fill="none" stroke={stroke} strokeWidth="1.4"
            strokeDasharray={done ? "none" : rectLen}
            strokeDashoffset={done ? 0 : rectLen*off}/>
          <line x1="4" y1={r*1.1} x2="7" y2={r*0.6} stroke={stroke} strokeWidth="1.2" opacity={1-off}/>
          <line x1="10" y1={r*1.1} x2="13" y2={r*0.3} stroke={stroke} strokeWidth="1.2" opacity={1-off}/>
          <line x1="16" y1={r*1.1} x2="19" y2={r*0.7} stroke={stroke} strokeWidth="1.2" opacity={1-off}/>
        </g>
      );
    }
    if (kind === "api") {
      const diaLen = 4 * Math.sqrt(2) * r;
      return (
        <g style={{opacity}} transform={`translate(${x},${y})`}>
          <path d={`M ${-r} 0 L 0 ${-r} L ${r} 0 L 0 ${r} Z`} fill="none" stroke={stroke} strokeWidth="1.4"
            strokeDasharray={done ? "none" : diaLen}
            strokeDashoffset={done ? 0 : diaLen*off}/>
        </g>
      );
    }
    return null;
  }

  // ── Brown state ─────────────────────────────────────────────────────────
  // Scattered sources, jobs, dashboards, feedback loops, and fragile orchestration.
  // Animates a `scale` factor and `tx,ty` offset so it can shrink / migrate
  // up-left before the new architecture is built centrally.
  function BrownState({ t }) {
    // Visibility: appears 0..14, then shrinks 14..18 toward upper-left, then fades by 32
    const appear = fadeIn(t, T.brown, 5.0);
    // shrink: 1.0 → 0.30  between 14 and 18
    const sh = clamp01((t - T.brownShrink) / 4.0);
    const scale = 1.0 - 0.70 * easeInOut(sh);
    // translate: shifts so its visual center moves to upper-left "memory" zone
    // Original center ≈ (960, 500). Target ≈ (260, 130) within viewBox 1720x800
    const tx = (260 - 960) * easeInOut(sh);
    const ty = (130 - 500) * easeInOut(sh);
    // After lift&shift fade window, brown disappears entirely
    const fade = fadeOut(t, T.liftFade, 2.5);
    const op = appear * fade;
    if (op < 0.01) return null;

    const sources = [
      { x: 150, y: 160, label: "CRM" },
      { x: 120, y: 275, label: "Tracking" },
      { x: 170, y: 390, label: "CMS" },
      { x: 120, y: 505, label: "Billing" },
      { x: 170, y: 620, label: "API" },
      { x: 115, y: 735, label: "Ads" },
      { x: 220, y: 255, label: "Logs" },
    ];
    const pipelines = [
      { x: 560, y: 135, w: 116, h: 58 },
      { x: 760, y: 245, w: 116, h: 58 },
      { x: 535, y: 355, w: 116, h: 58 },
      { x: 825, y: 475, w: 116, h: 58 },
      { x: 640, y: 595, w: 116, h: 58 },
      { x: 940, y: 330, w: 116, h: 58 },
    ];
    const dashes = [
      { x: 1390, y: 170, label: "Dashboard" },
      { x: 1510, y: 295, label: "Dashboard" },
      { x: 1370, y: 445, label: "Dashboard" },
      { x: 1520, y: 580, label: "Dashboard" },
      { x: 1385, y: 715, label: "Dashboard" },
    ];
    const point = (type, idx) => {
      if (type === "s") return { x: sources[idx].x + 24, y: sources[idx].y };
      if (type === "p") return { x: pipelines[idx].x + pipelines[idx].w / 2, y: pipelines[idx].y + pipelines[idx].h / 2 };
      return { x: dashes[idx].x - 24, y: dashes[idx].y };
    };
    const links = [
      ["s", 0, "p", 0, -0.2, "cron"], ["s", 1, "p", 1, 0.25], ["s", 2, "p", 2, -0.3, "issue"],
      ["s", 3, "p", 3, 0.45], ["s", 4, "p", 5, -0.25], ["s", 5, "p", 4, 0.35, "cron"],
      ["s", 6, "p", 1, -0.4, "issue"], ["p", 0, "p", 1, 0.35], ["p", 1, "p", 5, -0.45, "cron"],
      ["p", 2, "p", 3, 0.55], ["p", 4, "p", 3, -0.35, "issue"], ["p", 5, "p", 0, 0.6],
      ["p", 0, "d", 0, 0.2], ["p", 1, "d", 1, -0.35, "cron"], ["p", 2, "d", 2, 0.3],
      ["p", 3, "d", 3, -0.25, "issue"], ["p", 4, "d", 4, 0.4], ["p", 5, "d", 2, -0.55],
    ];
    const dashboardFanoutLinks = [
      ["p", 0, "d", 1, -0.42],
      ["p", 1, "d", 0, 0.52],
      ["p", 3, "d", 4, 0.38],
      ["p", 5, "d", 3, -0.48],
    ];
    // Zirkelbezüge: jobs write back into jobs and sources. Jobs are the actors moving data.
    const feedbackLinks = [
      ["p", 1, "p", 2, 0.9, "issue"],
      ["p", 2, "p", 1, -0.82],
      ["p", 3, "p", 5, -0.78, "cron"],
      ["p", 5, "p", 3, 0.72],
      ["p", 4, "p", 2, -0.62, "issue"],
      ["p", 0, "p", 5, 0.68],
      ["p", 2, "s", 1, -0.9, "issue"],
      ["p", 4, "s", 5, 0.72, "cron"],
      ["p", 5, "s", 4, -0.66],
      ["p", 3, "s", 3, 0.82, "issue"],
    ];

    // When shrunk, hide labels (too small to read)
    const labelOp = (1 - sh);

    return (
      <g style={{ opacity: op }}
         transform={`translate(${tx} ${ty}) scale(${scale})`}
         transform-origin="960 500">
        {/* sources */}
        {sources.map((s, i) => (
          <g key={"s"+i}>
            <HandIcon x={s.x} y={s.y} r={20} kind={i === 4 ? "api" : "db"} draw={fadeIn(t, 0.5 + i*0.25, 0.6)} />
            <text x={s.x - 46} y={s.y + 6} textAnchor="end"
                  fontFamily="'Cormorant Garamond', serif" fontStyle="italic"
                  fontSize="22" fill="var(--ink-soft)"
                  opacity={fadeIn(t, 0.7 + i*0.25, 0.6) * labelOp}>
              {s.label}
            </text>
          </g>
        ))}
        {pipelines.map((p, i) => (
          <HandBox
            key={"p"+i}
            x={p.x} y={p.y} w={p.w} h={p.h}
            label="job" draw={fadeIn(t, 1.1 + i*0.22, 0.55)}
            color="var(--ink-faint)"
          />
        ))}
        {/* dashboards */}
        {dashes.map((d, i) => (
          <g key={"d"+i}>
            <HandIcon x={d.x} y={d.y} r={20} kind="dash" draw={fadeIn(t, 1.5 + i*0.25, 0.6)} />
            <text x={d.x + 46} y={d.y + 6} textAnchor="start"
                  fontFamily="'Cormorant Garamond', serif" fontStyle="italic"
                  fontSize="22" fill="var(--ink-soft)"
                  opacity={fadeIn(t, 1.7 + i*0.25, 0.6) * labelOp}>
              Dashboard
            </text>
          </g>
        ))}
        {/* tangled pipelines */}
        {links.map((l, i) => {
          const a = point(l[0], l[1]);
          const b = point(l[2], l[3]);
          return (
            <HandLine key={"l"+i}
              x1={a.x} y1={a.y}
              x2={b.x} y2={b.y}
              curvy={l[4]}
              draw={fadeIn(t, 2.5 + i*0.18, 0.8)}
              arrow={true}
              color="var(--ink-faint)"
              marker={l[5]}
              markerAt={0.48 + (i % 3) * 0.08}
            />
          );
        })}
        {dashboardFanoutLinks.map((l, i) => {
          const a = point(l[0], l[1]);
          const b = point(l[2], l[3]);
          return (
            <HandLine key={"dl"+i}
              x1={a.x} y1={a.y}
              x2={b.x} y2={b.y}
              curvy={l[4]}
              draw={fadeIn(t, 5.1 + i*0.22, 0.85)}
              arrow={true}
              color="var(--ink-faint)"
            />
          );
        })}
        {feedbackLinks.map((l, i) => {
          const a = point(l[0], l[1]);
          const b = point(l[2], l[3]);
          const fbOp = fadeIn(t, 3.35 + i*0.22, 0.95);
          return (
            <HandLine key={"fb"+i}
              x1={a.x} y1={a.y}
              x2={b.x} y2={b.y}
              curvy={l[4]}
              draw={fbOp}
              opacity={fbOp}
              arrow={true}
              dashed={true}
              color="var(--accent)"
              marker={l[5]}
              markerAt={0.42 + (i % 4) * 0.07}
            />
          );
        })}
      </g>
    );
  }

  // ── Architecture frame ──────────────────────────────────────────────────
  function ArchitectureFrame({ t }) {
    // Layout — fits viewBox 0 0 1720 800
    const FRAME = { x: 120, y: 160, w: 1340, h: 540 };
    /** PRODUCTS key — right gutter so centered .arch-controls does not cover it */
    const GLOSSARY_X = 1436;
    const GLOSSARY_Y = 722;
    const ROW_Y = 280;
    const BOX_H = 110;

    const FOUND_X = 300, FOUND_W = 1120, FOUND_H = 44;
    const FOUND_RIGHT = FOUND_X + FOUND_W;
    const FOUNDATION_X = FRAME.x + 20;
    const FOUNDATION_W = FRAME.w - 40;
    const COLUMN_GAP = 80;

    const SOURCE_R = 22;
    const INGEST_W = 200;
    const CONSUME_W = 280;
    /** Main row: same left / right as orchestrate · observe · IaC */
    const INGEST_X = FOUND_X;
    const CONSUME_X = FOUND_RIGHT - CONSUME_W;
    const SOURCE_X = INGEST_X - COLUMN_GAP - SOURCE_R;
    const SOURCE_Y = ROW_Y + BOX_H / 2;

    const TRANS_1_X  = 700, TRANS_1_W  = 260;
    const TRANS_2_X  = 700, TRANS_2_W  = 260;
    const TRANS_1_Y  = ROW_Y - 48;
    const TRANS_2_Y  = ROW_Y + 48;
    const TRANS_H    = 76;

    const TRANS_C_X  = 660, TRANS_C_W  = 420;
    const TRANS_C_Y  = ROW_Y - 78;
    const TRANS_C_H  = BOX_H + 126;
    const TRANS_C_CENTER_Y = TRANS_C_Y + TRANS_C_H / 2;
    const INGEST_C_X = FOUND_X, INGEST_C_W = 280;
    const INGEST_C_Y = TRANS_C_Y, INGEST_C_H = TRANS_C_H;
    const FOUND_Y_BASE = 480;

    /** Opaque fill so layers above Tenant B mask its dashed frame (slide 5 is dark). */
    const BOX_FILL = "var(--paper-alt)";

    const refactorT = fadeIn(t, T.refactorT, 1.5);
    const refactorI = fadeIn(t, T.refactorI, 1.5);
    const productize = fadeIn(t, T.productize, 1.5);
    const replicate = fadeIn(t, T.replicate, 1.2);
    const multitenancy = fadeIn(t, T.multitenancy, 1.5);

    const mtOffsetX = 28 * multitenancy;
    const mtOffsetY = -28 * multitenancy;

    const sourceDraw = fadeIn(t, T.ingest - 0.8, 1.0);
    const ingestDraw = fadeIn(t, T.ingest, 1.3);
    const trans1Draw = fadeIn(t, T.transform, 1.0);
    const trans2Draw = fadeIn(t, T.transform + 0.4, 1.0);

    // lift & shift arrows: fade in at liftShift, fade out at liftFade
    const liftAppear = [
      fadeIn(t, T.liftShift + 0.0, 1.2),
      fadeIn(t, T.liftShift + 0.6, 1.2),
    ];
    const liftFade = fadeOut(t, T.liftFade, 1.5);
    const liftOp = liftFade;

    const consumeDraw = fadeIn(t, T.consume, 1.2);
    const orchestrateDraw = fadeIn(t, T.orchestrate, 1.3);
    const observeDraw = fadeIn(t, T.observe, 1.3);
    const iacDraw = fadeIn(t, T.iac, 1.3);

    const flowArrow1 = fadeIn(t, T.transform + 1.4, 0.8);
    const flowArrow2 = fadeIn(t, T.consume + 1.1, 0.8);

    const laneA = {
      ingestY: refactorI > 0.5 ? ROW_Y - 52 + TRANS_H / 2 : ROW_Y + BOX_H / 2 - 26,
      transformY: refactorT > 0.5 ? ROW_Y - 52 + TRANS_H / 2 : TRANS_1_Y + TRANS_H / 2,
      consumeY: ROW_Y + BOX_H / 2 - 24,
    };
    const laneB = {
      ingestY: refactorI > 0.5 ? ROW_Y + 44 + TRANS_H / 2 : ROW_Y + BOX_H / 2 + 26,
      transformY: refactorT > 0.5 ? ROW_Y + 44 + TRANS_H / 2 : TRANS_2_Y + TRANS_H / 2,
      consumeY: ROW_Y + BOX_H / 2 + 24,
    };
    const liftIngestX = INGEST_X + 10;
    const liftTransformX = TRANS_1_X + 10;
    const liftTransformY = TRANS_1_Y + TRANS_H / 2;

    return (
      <g>
        {/* Tenant B — back; Tenant A — above B; pipeline/content draws after both */}
        {replicate > 0.01 && multitenancy > 0.01 && (
          <g style={{ opacity: replicate * multitenancy * 0.38 }}>
            <HandBox
              x={FRAME.x + mtOffsetX} y={FRAME.y + mtOffsetY}
              w={FRAME.w} h={FRAME.h}
              draw={1} dashed={true} color="var(--ink-faint)"
            />
            <text x={FRAME.x + FRAME.w + mtOffsetX - 14} y={FRAME.y + mtOffsetY + 22}
                  textAnchor="end" fontFamily="'Inter',sans-serif"
                  fontSize="10" letterSpacing="0.25em"
                  fill="var(--ink-faint)">
              TENANT B
            </text>
          </g>
        )}
        {replicate > 0.01 && (
          <g style={{ opacity: replicate }}>
            <HandBox
              x={FRAME.x} y={FRAME.y} w={FRAME.w} h={FRAME.h}
              draw={replicate} dashed={false} color="var(--ink-soft)"
              fill={BOX_FILL}
            />
            <text x={FRAME.x + 14} y={FRAME.y - 10}
                  fontFamily="'Inter',sans-serif" fontSize="11" letterSpacing="0.25em"
                  fill="var(--ink-faint)"
                  opacity={replicate}>
              ENVIRONMENT{multitenancy > 0.5 ? "  ·  TENANT A" : "  ·  REPLICATE"}
            </text>
          </g>
        )}

        {/* Ingest */}
        {sourceDraw > 0.01 && (
          <g style={{opacity: sourceDraw}}>
            <HandIcon x={SOURCE_X} y={SOURCE_Y} r={SOURCE_R} kind="db" draw={sourceDraw} />
            <text x={SOURCE_X} y={SOURCE_Y + 54}
                  textAnchor="middle"
                  fontFamily="'Cormorant Garamond', serif" fontStyle="italic"
                  fontSize="22" fill="var(--ink-soft)">
              Quelldaten
            </text>
          </g>
        )}
        {sourceDraw > 0.01 && refactorI < 0.5 && (
          <HandLine
            x1={SOURCE_X + 30} y1={SOURCE_Y}
            x2={INGEST_X - 4} y2={ROW_Y + BOX_H / 2}
            draw={sourceDraw}
            color="var(--ink-faint)"
          />
        )}
        {sourceDraw > 0.01 && refactorI > 0.01 && (
          <g style={{opacity: refactorI}}>
            <HandLine
              x1={SOURCE_X + 30} y1={SOURCE_Y - 10}
              x2={INGEST_C_X - 4} y2={laneA.ingestY}
              draw={refactorI}
              color="var(--ink-faint)"
              curvy={-0.2}
            />
            <HandLine
              x1={SOURCE_X + 30} y1={SOURCE_Y + 10}
              x2={INGEST_C_X - 4} y2={laneB.ingestY}
              draw={refactorI}
              color="var(--ink-faint)"
              curvy={0.2}
            />
          </g>
        )}
        {ingestDraw > 0.01 && refactorI < 0.5 && (
          <g style={{opacity: 1 - refactorI*2}}>
            <HandBox
              x={INGEST_X} y={ROW_Y} w={INGEST_W} h={BOX_H}
              draw={ingestDraw} label="ingest"
              fill={BOX_FILL}
            />
          </g>
        )}
        {refactorI > 0.01 && (() => {
          const colA = productize > 0.5 ? "var(--accent)" : "var(--ink)";
          const colB = productize > 0.5 ? "var(--prod-b)" : "var(--ink)";
          return (
            <g style={{opacity: refactorI}}>
              <HandBox
                x={INGEST_C_X} y={INGEST_C_Y} w={INGEST_C_W} h={INGEST_C_H}
                draw={1} color="var(--ink-soft)"
                fill={BOX_FILL}
              />
              <text x={INGEST_C_X + 12} y={ROW_Y - 86}
                    fontFamily="'Inter',sans-serif" fontSize="10" letterSpacing="0.25em"
                    fill="var(--ink-faint)">INGEST</text>
              <HandBox
                x={INGEST_C_X + 18} y={ROW_Y - 52} w={INGEST_C_W - 36} h={TRANS_H}
                draw={1} label="ingest" sub="A"
                color={colA}
                labelColor={productize > 0.5 ? "var(--accent)" : undefined}
                subColor={productize > 0.5 ? "var(--accent)" : undefined}
                fill={BOX_FILL}
              />
              <HandBox
                x={INGEST_C_X + 18} y={ROW_Y + 44} w={INGEST_C_W - 36} h={TRANS_H}
                draw={1} label="ingest" sub="B"
                color={colB}
                labelColor={productize > 0.5 ? "var(--prod-b)" : undefined}
                subColor={productize > 0.5 ? "var(--prod-b)" : undefined}
                fill={BOX_FILL}
              />
            </g>
          );
        })()}

        {/* Transform */}
        {trans1Draw > 0.01 && refactorT < 0.5 && (
          <g style={{opacity: 1 - refactorT*2}}>
            <HandBox
              x={TRANS_1_X} y={TRANS_1_Y} w={TRANS_1_W} h={TRANS_H}
              draw={trans1Draw} label="transform"
              fill={BOX_FILL}
            />
            <HandBox
              x={TRANS_2_X} y={TRANS_2_Y} w={TRANS_2_W} h={TRANS_H}
              draw={trans2Draw} label="transform"
              fill={BOX_FILL}
            />
          </g>
        )}
        {refactorT > 0.01 && (() => {
          const colA = productize > 0.5 ? "var(--accent)" : "var(--ink)";
          const colB = productize > 0.5 ? "var(--prod-b)" : "var(--ink)";
          return (
            <g style={{opacity: refactorT}}>
              <HandBox
                x={TRANS_C_X} y={TRANS_C_Y} w={TRANS_C_W} h={TRANS_C_H}
                draw={1} color="var(--ink-soft)"
                fill={BOX_FILL}
              />
              <text x={TRANS_C_X + 12} y={ROW_Y - 86}
                    fontFamily="'Inter',sans-serif" fontSize="10" letterSpacing="0.25em"
                    fill="var(--ink-faint)">TRANSFORM</text>
              <HandBox
                x={TRANS_C_X + 18} y={ROW_Y - 52} w={TRANS_C_W - 36} h={TRANS_H}
                draw={1} label="transform" sub="A"
                color={colA}
                labelColor={productize > 0.5 ? "var(--accent)" : undefined}
                subColor={productize > 0.5 ? "var(--accent)" : undefined}
                fill={BOX_FILL}
              />
              <HandBox
                x={TRANS_C_X + 18} y={ROW_Y + 44} w={TRANS_C_W - 36} h={TRANS_H}
                draw={1} label="transform" sub="B"
                color={colB}
                labelColor={productize > 0.5 ? "var(--prod-b)" : undefined}
                subColor={productize > 0.5 ? "var(--prod-b)" : undefined}
                fill={BOX_FILL}
              />
            </g>
          );
        })()}

        {/* Flow arrows ingest → transform → consume */}
        {flowArrow1 > 0.01 && (() => {
          const fromX = (refactorI > 0.5) ? (INGEST_C_X + INGEST_C_W) : (INGEST_X + INGEST_W);
          const toX = (refactorT > 0.5) ? (TRANS_C_X + 18) : TRANS_1_X;
          return (
            <g>
              <HandLine
                x1={fromX + 4} y1={laneA.ingestY}
                x2={toX - 4} y2={laneA.transformY}
                draw={flowArrow1}
                curvy={-0.18}
              />
              <HandLine
                x1={fromX + 4} y1={laneB.ingestY}
                x2={toX - 4} y2={laneB.transformY}
                draw={flowArrow1}
                curvy={0.18}
              />
            </g>
          );
        })()}
        {flowArrow2 > 0.01 && (() => {
          const fromX = (refactorT > 0.5) ? (TRANS_C_X + TRANS_C_W - 18) : (TRANS_2_X + TRANS_2_W);
          return (
            <g>
              <HandLine
                x1={fromX + 4} y1={laneA.transformY}
                x2={CONSUME_X - 4} y2={laneA.consumeY}
                draw={flowArrow2}
                curvy={0.16}
              />
              <HandLine
                x1={fromX + 4} y1={laneB.transformY}
                x2={CONSUME_X - 4} y2={laneB.consumeY}
                draw={flowArrow2}
                curvy={-0.16}
              />
            </g>
          );
        })()}

        {/* Consume */}
        {consumeDraw > 0.01 && (
          <HandBox
            x={CONSUME_X} y={ROW_Y} w={CONSUME_W} h={BOX_H}
            draw={consumeDraw} label="consume"
            sub="Analytics · Reporting"
            sub2="Reverse ETL · Data Science"
            fill={BOX_FILL}
          />
        )}

        {/* Lift & shift — one arrow to ingest, one to transform.
            Origin coordinates align with where shrunken brown sits (~upper-left). */}
        {liftAppear[0] > 0.01 && liftOp > 0.01 && (
          <g style={{ opacity: liftOp }}>
            <HandLine x1={220} y1={175} x2={liftIngestX} y2={ROW_Y + BOX_H / 2}
              draw={liftAppear[0]} curvy={0.25} color="var(--accent)" />
            <HandLine x1={300} y1={215} x2={liftTransformX} y2={liftTransformY}
              draw={liftAppear[1]} curvy={-0.2} color="var(--accent)" />
          </g>
        )}

        {/* Foundations */}
        {orchestrateDraw > 0.01 && (
          <HandBox
            x={FOUNDATION_X} y={FOUND_Y_BASE} w={FOUNDATION_W} h={FOUND_H}
            draw={orchestrateDraw} label="orchestrate"
            fill={BOX_FILL}
          />
        )}
        {observeDraw > 0.01 && (
          <HandBox
            x={FOUNDATION_X} y={FOUND_Y_BASE + 56} w={FOUNDATION_W} h={FOUND_H}
            draw={observeDraw} label="observe · monitor · alert"
            fill={BOX_FILL}
          />
        )}
        {iacDraw > 0.01 && (
          <HandBox
            x={FOUNDATION_X} y={FOUND_Y_BASE + 112} w={FOUNDATION_W} h={FOUND_H}
            draw={iacDraw} label="IaC  ·  CI / CD"
            fill={BOX_FILL}
          />
        )}

        {/* Productize — two products run separate ingest and transform lanes. */}
        {productize > 0.01 && (
          <g style={{opacity: productize}}>
            <HandBox
              x={INGEST_C_X + 10} y={ROW_Y - 60}
              w={INGEST_C_W - 20} h={TRANS_H + 16}
              draw={productize} color="var(--accent)" dashed={true}
            />
            <HandBox
              x={TRANS_C_X + 10} y={ROW_Y - 60}
              w={TRANS_C_W - 20} h={TRANS_H + 16}
              draw={productize} color="var(--accent)" dashed={true}
            />
            <HandLine
              x1={INGEST_C_X + INGEST_C_W} y1={laneA.ingestY}
              x2={TRANS_C_X + 12} y2={ROW_Y - 14}
              draw={productize}
              color="var(--accent)"
              curvy={-0.35}
            />

            <HandBox
              x={INGEST_C_X + 10} y={ROW_Y + 36}
              w={INGEST_C_W - 20} h={TRANS_H + 16}
              draw={productize} color="var(--prod-b)" dashed={true}
            />
            <HandBox
              x={TRANS_C_X + 10} y={ROW_Y + 36}
              w={TRANS_C_W - 20} h={TRANS_H + 16}
              draw={productize} color="var(--prod-b)" dashed={true}
            />
            <HandLine
              x1={INGEST_C_X + INGEST_C_W} y1={laneB.ingestY}
              x2={TRANS_C_X + 12} y2={ROW_Y + BOX_H + 10}
              draw={productize}
              color="var(--prod-b)"
              curvy={0.35}
            />

            {/* Glossary — below environment frame (frame bottom y=700), right gutter */}
            <g transform={`translate(${GLOSSARY_X}, ${GLOSSARY_Y})`}>
              <text x="0" y="0"
                    fontFamily="'Inter',sans-serif" fontSize="10" letterSpacing="0.25em"
                    fill="var(--ink-faint)">PRODUCTS</text>
              <line x1="0" y1="8" x2="200" y2="8" stroke="var(--ink-faint)" strokeWidth="0.5" opacity="0.5" />
              {/* swatch A */}
              <rect x="0" y="22" width="14" height="14" fill="none"
                    stroke="var(--accent)" strokeWidth="1.6" />
              <text x="24" y="34"
                    fontFamily="'Cormorant Garamond', serif" fontStyle="italic"
                    fontSize="22" fill="var(--accent)">Product A</text>
              {/* swatch B */}
              <rect x="0" y="54" width="14" height="14" fill="none"
                    stroke="var(--prod-b)" strokeWidth="1.6" />
              <text x="24" y="66"
                    fontFamily="'Cormorant Garamond', serif" fontStyle="italic"
                    fontSize="22" fill="var(--prod-b)">Product B</text>
            </g>
          </g>
        )}
      </g>
    );
  }

  function Scene({ t }) {
    return (
      <>
        <BrownState t={t} />
        <ArchitectureFrame t={t} />
      </>
    );
  }

  function currentStepLabel(t) {
    let label = STEPS[0].label;
    for (const s of STEPS) {
      if (t >= s.t) label = s.label;
    }
    return label;
  }

  function App() {
    const [t, setT] = useState(0);
    const [playing, setPlaying] = useState(false);
    const rafRef = useRef(null);
    const lastRef = useRef(null);

    useEffect(() => {
      function tick(now) {
        if (lastRef.current == null) lastRef.current = now;
        const dt = (now - lastRef.current) / 1000;
        lastRef.current = now;
        setT(prev => {
          if (!playing) return prev;
          let next = prev + dt;
          if (next >= DURATION) { setPlaying(false); return DURATION; }
          return next;
        });
        rafRef.current = requestAnimationFrame(tick);
      }
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }, [playing]);

    useEffect(() => {
      const timeEl = document.getElementById('arch-time');
      const fillEl = document.getElementById('arch-scrub-fill');
      const stepEl = document.getElementById('arch-step');
      const playEl = document.getElementById('arch-play');
      if (timeEl) timeEl.textContent = `${t.toFixed(1)} / ${DURATION.toFixed(1)}`;
      if (fillEl) fillEl.style.width = `${(t/DURATION)*100}%`;
      if (stepEl) stepEl.textContent = currentStepLabel(t);
      if (playEl) playEl.textContent = playing ? "Pause" : "Play";
    }, [t, playing]);

    useEffect(() => {
      const playBtn = document.getElementById('arch-play');
      const resetBtn = document.getElementById('arch-reset');
      const scrub = document.getElementById('arch-scrub');
      if (!playBtn || !resetBtn || !scrub) return;
      const onPlay = () => setPlaying(p => !p);
      const onReset = () => { setT(0); lastRef.current = null; setPlaying(true); };
      const onScrub = (e) => {
        const r = scrub.getBoundingClientRect();
        const pct = clamp01((e.clientX - r.left) / r.width);
        setT(pct * DURATION);
        lastRef.current = null;
      };
      playBtn.addEventListener('click', onPlay);
      resetBtn.addEventListener('click', onReset);
      scrub.addEventListener('click', onScrub);
      return () => {
        playBtn.removeEventListener('click', onPlay);
        resetBtn.removeEventListener('click', onReset);
        scrub.removeEventListener('click', onScrub);
      };
    }, []);

    // Auto-play when slide 05 becomes active.
    useEffect(() => {
      function playIfArchitectureSlide(slide) {
        if (slide?.querySelector('#arch-svg')) setPlaying(true);
      }
      function onWindowMessage(ev) {
        if (ev.data && typeof ev.data.slideIndexChanged === 'number') {
          const slide = document.querySelector(`section[data-deck-slide="${ev.data.slideIndexChanged}"]`);
          playIfArchitectureSlide(slide);
        }
      }
      function onDeckSlideChange(ev) {
        playIfArchitectureSlide(ev.detail?.slide);
      }
      playIfArchitectureSlide(document.querySelector('section[data-deck-active]'));
      const deck = document.querySelector('deck-stage');
      deck?.addEventListener('slidechange', onDeckSlideChange);
      window.addEventListener('message', onWindowMessage);
      return () => {
        deck?.removeEventListener('slidechange', onDeckSlideChange);
        window.removeEventListener('message', onWindowMessage);
      };
    }, []);

    return <Scene t={t} />;
  }

  // Mount into the slide-05 SVG
  function mount() {
    const svg = document.getElementById('arch-svg');
    if (!svg) { setTimeout(mount, 50); return; }
    const root = ReactDOM.createRoot(svg);
    root.render(<App />);
  }
  mount();
})();
