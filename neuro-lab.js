/* ============================================================
   NEURODEV LABS — neuro-lab.js
   Hero background: a living lab-civilization of tiny builders.
   The whole colony works in sync like neurons — a pulse wave
   travels through their network and every hammer strike,
   flash, and new building block lands on the beat.

   The camera loops through four views:
     01 TRANSVERSE  — side cross-section of the lab floors
     02 LONGITUDINAL — perspective corridor into the lab
     03 OVERHEAD    — top-down map of the colony
     04 SYNAPTIC    — the colony as the neural network it is
   ============================================================ */

(function () {
  "use strict";

  var canvas = document.getElementById("lab-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var labelEl = document.getElementById("view-label");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- palette (mirrors styles.css tokens) ---------- */
  var C = {
    cyan: "53, 224, 255",
    violet: "139, 92, 246",
    amber: "255, 179, 71",
    ink: "159, 176, 204"
  };
  function rgba(rgb, a) { return "rgba(" + rgb + "," + a + ")"; }

  /* ---------- sizing ---------- */
  var W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.parentElement.clientWidth;
    H = canvas.parentElement.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  /* ---------- the colony ---------- */
  var N = 128;
  var FLOORS = 4;
  var PULSE_INTERVAL = 2.6;   // seconds between synchronized beats
  var HOP_DELAY = 0.14;       // beat delay per network hop — the travelling wave

  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rnd = mulberry(2026);

  var agents = [];
  for (var i = 0; i < N; i++) {
    var floor = Math.floor(rnd() * FLOORS);
    agents.push({
      u: rnd(),                       // along the lab (depth axis)
      v: rnd(),                       // across the lab (width axis)
      w: (floor + 0.5) / FLOORS,      // height (discrete floors)
      floor: floor,
      cap: 4 + Math.floor(rnd() * 6), // building height before it resets
      jitter: rnd() * Math.PI * 2,    // personal idle wobble
      walker: rnd() < 0.22,           // some agents patrol instead of build
      speed: 0.008 + rnd() * 0.02,
      depth: 0                        // network hops from the nucleus (BFS below)
    });
  }

  /* k-nearest-neighbour synapse network in (u,v,w) space */
  var edges = [];
  (function buildNetwork() {
    var K = 3, seen = {};
    for (var a = 0; a < N; a++) {
      var dists = [];
      for (var b = 0; b < N; b++) {
        if (a === b) continue;
        var du = agents[a].u - agents[b].u,
            dv = agents[a].v - agents[b].v,
            dw = (agents[a].w - agents[b].w) * 1.6;
        dists.push([du * du + dv * dv + dw * dw, b]);
      }
      dists.sort(function (x, y) { return x[0] - y[0]; });
      for (var k = 0; k < K; k++) {
        var b2 = dists[k][1];
        var key = Math.min(a, b2) + ":" + Math.max(a, b2);
        if (!seen[key]) { seen[key] = 1; edges.push([Math.min(a, b2), Math.max(a, b2)]); }
      }
    }
    /* BFS from a central nucleus so the pulse radiates outward */
    var adj = [];
    for (var n = 0; n < N; n++) adj.push([]);
    edges.forEach(function (e) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    var nucleus = 0, best = 9;
    for (var m = 0; m < N; m++) {
      var d = Math.abs(agents[m].u - 0.5) + Math.abs(agents[m].v - 0.5);
      if (d < best) { best = d; nucleus = m; }
    }
    var q = [nucleus], dist = {};
    dist[nucleus] = 0;
    while (q.length) {
      var cur = q.shift();
      adj[cur].forEach(function (nx) {
        if (dist[nx] === undefined) { dist[nx] = dist[cur] + 1; q.push(nx); }
      });
    }
    var maxD = 1;
    for (var p = 0; p < N; p++) {
      agents[p].depth = dist[p] !== undefined ? dist[p] : 10;
      if (agents[p].depth > maxD) maxD = agents[p].depth;
    }
    agents.forEach(function (ag) { ag.depthNorm = ag.depth / maxD; });
  })();

  /* ---------- the synchronized beat ----------
     phase(agent) — how far this agent is through its current beat.
     Agents at equal network depth fire at the exact same instant:
     that's the "nerve cell" synchrony. */
  function beatPhase(ag, t) {
    return (t - ag.depth * HOP_DELAY) / PULSE_INTERVAL;
  }
  function flashOf(phase) {
    var f = phase - Math.floor(phase);
    return Math.pow(Math.max(0, 1 - f * 3.2), 2);   // sharp spike on the beat
  }
  function blocksOf(ag, phase) {
    if (phase < 0) return 0;
    return Math.floor(phase) % (ag.cap + 2);         // grows a block per beat, then resets
  }

  /* ---------- shared drawing helpers ---------- */
  function drawWorker(x, y, s, t, ag, alpha) {
    /* a tiny builder: head, body, and a hammer arm swinging on the beat */
    var ph = beatPhase(ag, t);
    var flash = flashOf(ph);
    var swing = Math.sin(ph * Math.PI * 2) * 0.9;
    var glow = 0.35 + flash * 0.65;

    ctx.strokeStyle = rgba(C.cyan, alpha * (0.5 + flash * 0.5));
    ctx.lineWidth = Math.max(1, s * 0.16);
    ctx.beginPath();                                  // body
    ctx.moveTo(x, y - s * 1.1);
    ctx.lineTo(x, y - s * 0.25);
    ctx.moveTo(x, y - s * 0.25);                      // legs
    ctx.lineTo(x - s * 0.35, y);
    ctx.moveTo(x, y - s * 0.25);
    ctx.lineTo(x + s * 0.35, y);
    ctx.moveTo(x, y - s * 0.85);                      // hammer arm
    ctx.lineTo(x + Math.cos(swing) * s * 0.7, y - s * 0.85 - Math.sin(swing) * s * 0.6);
    ctx.stroke();

    ctx.fillStyle = rgba(C.cyan, alpha * glow);       // head
    ctx.beginPath();
    ctx.arc(x, y - s * 1.35, Math.max(1, s * 0.26), 0, Math.PI * 2);
    ctx.fill();

    if (flash > 0.4) {                                // beat flash halo
      ctx.fillStyle = rgba(C.amber, alpha * flash * 0.5);
      ctx.beginPath();
      ctx.arc(x, y - s * 0.8, s * 1.5 * flash, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStructure(x, baseY, s, blocks, alpha, hue) {
    for (var b = 0; b < blocks; b++) {
      var glowB = b === blocks - 1 ? 0.9 : 0.45;
      ctx.fillStyle = rgba(hue, alpha * glowB);
      ctx.fillRect(x - s * 0.5, baseY - (b + 1) * s * 0.62, s, s * 0.5);
    }
  }

  /* ============================================================
     VIEW 01 — TRANSVERSE (side cross-section, stacked floors)
     ============================================================ */
  function renderTransverse(t, alpha) {
    var mx = W * 0.06, topY = H * 0.16, botY = H * 0.9;
    var floorGap = (botY - topY) / (FLOORS - 0.4);

    ctx.strokeStyle = rgba(C.ink, alpha * 0.16);
    ctx.lineWidth = 1;
    for (var f = 0; f < FLOORS; f++) {                // floor slabs
      var fy = botY - f * floorGap;
      ctx.beginPath();
      ctx.moveTo(mx, fy);
      ctx.lineTo(W - mx, fy);
      ctx.stroke();
    }
    for (var col = 0; col <= 6; col++) {              // support columns
      var cxp = mx + (W - 2 * mx) * (col / 6);
      ctx.strokeStyle = rgba(C.ink, alpha * 0.08);
      ctx.beginPath();
      ctx.moveTo(cxp, botY);
      ctx.lineTo(cxp, botY - (FLOORS - 1) * floorGap);
      ctx.stroke();
    }

    /* synapse links between builders, drawn faint behind them */
    ctx.lineWidth = 1;
    edges.forEach(function (e) {
      var a = agents[e[0]], b = agents[e[1]];
      var ax = mx + a.v * (W - 2 * mx), ay = botY - a.floor * floorGap;
      var bx2 = mx + b.v * (W - 2 * mx), by = botY - b.floor * floorGap;
      var fl = Math.max(flashOf(beatPhase(a, t)), flashOf(beatPhase(b, t)));
      ctx.strokeStyle = rgba(C.violet, alpha * (0.05 + fl * 0.22));
      ctx.beginPath();
      ctx.moveTo(ax, ay - 8);
      ctx.lineTo(bx2, by - 8);
      ctx.stroke();
    });

    agents.forEach(function (ag) {
      var fy = botY - ag.floor * floorGap;
      var vx = ag.walker
        ? (ag.v + Math.sin(t * ag.speed * 22 + ag.jitter) * 0.14 + 1) % 1
        : ag.v;
      var x = mx + vx * (W - 2 * mx);
      var ph = beatPhase(ag, t);
      if (!ag.walker) drawStructure(x + 13, fy, 7, blocksOf(ag, ph), alpha, C.violet);
      drawWorker(x, fy, 9, t, ag, alpha);
    });
  }

  /* ============================================================
     VIEW 02 — LONGITUDINAL (perspective corridor into the lab)
     ============================================================ */
  function renderLongitudinal(t, alpha) {
    var cx = W * 0.5, cy = H * 0.44, K = Math.min(W, H) * 0.92;

    /* corridor floor grid — rails converging on the vanishing point */
    for (var r = -4; r <= 4; r++) {
      ctx.strokeStyle = rgba(C.ink, alpha * 0.12);
      ctx.lineWidth = 1;
      ctx.beginPath();
      var zNear = 0.22, zFar = 2.2;
      ctx.moveTo(cx + (r / 4) * K * 0.55 / zNear, cy + K * 0.42 / zNear);
      ctx.lineTo(cx + (r / 4) * K * 0.55 / zFar, cy + K * 0.42 / zFar);
      ctx.stroke();
    }
    for (var d = 0; d < 9; d++) {                     // cross beams
      var z = 0.24 + d * 0.24;
      ctx.strokeStyle = rgba(C.ink, alpha * 0.1);
      ctx.beginPath();
      ctx.moveTo(cx - K * 0.55 / z, cy + K * 0.42 / z);
      ctx.lineTo(cx + K * 0.55 / z, cy + K * 0.42 / z);
      ctx.stroke();
    }

    /* far-to-near so close builders draw over distant ones */
    var order = agents.slice().sort(function (a, b) { return a.u - b.u; });
    order.reverse();
    order.forEach(function (ag) {
      var z = 0.24 + ag.u * 1.9;
      var s = 13 / z;
      if (s < 1.4) return;
      var x = cx + (ag.v - 0.5) * K * 0.98 / z;
      var y = cy + K * 0.42 / z;
      var fade = alpha * Math.min(1, 1.35 - ag.u);
      var ph = beatPhase(ag, t);
      if (!ag.walker) drawStructure(x + s * 1.5, y, s * 0.8, blocksOf(ag, ph), fade, C.violet);
      drawWorker(x, y, s, t, ag, fade);
    });
  }

  /* ============================================================
     VIEW 03 — OVERHEAD (top-down colony map)
     ============================================================ */
  function renderOverhead(t, alpha) {
    var mx = W * 0.08, my = H * 0.14;
    var gw = W - 2 * mx, gh = H - my - H * 0.1;

    ctx.strokeStyle = rgba(C.ink, alpha * 0.09);
    ctx.lineWidth = 1;
    for (var gx = 0; gx <= 10; gx++) {
      ctx.beginPath();
      ctx.moveTo(mx + gw * gx / 10, my);
      ctx.lineTo(mx + gw * gx / 10, my + gh);
      ctx.stroke();
    }
    for (var gy = 0; gy <= 6; gy++) {
      ctx.beginPath();
      ctx.moveTo(mx, my + gh * gy / 6);
      ctx.lineTo(mx + gw, my + gh * gy / 6);
      ctx.stroke();
    }

    edges.forEach(function (e) {
      var a = agents[e[0]], b = agents[e[1]];
      var fl = Math.max(flashOf(beatPhase(a, t)), flashOf(beatPhase(b, t)));
      ctx.strokeStyle = rgba(C.violet, alpha * (0.06 + fl * 0.3));
      ctx.beginPath();
      ctx.moveTo(mx + a.u * gw, my + a.v * gh);
      ctx.lineTo(mx + b.u * gw, my + b.v * gh);
      ctx.stroke();
    });

    agents.forEach(function (ag) {
      var ph = beatPhase(ag, t);
      var flash = flashOf(ph);
      var ux = ag.walker ? (ag.u + Math.sin(t * ag.speed * 20 + ag.jitter) * 0.1 + 1) % 1 : ag.u;
      var x = mx + ux * gw, y = my + ag.v * gh;

      if (!ag.walker) {                               // building footprint glows as it grows
        var blocks = blocksOf(ag, ph);
        var size = 4 + blocks * 1.6;
        ctx.fillStyle = rgba(C.violet, alpha * (0.12 + blocks / (ag.cap + 2) * 0.4));
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        ctx.strokeStyle = rgba(C.violet, alpha * 0.4);
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);
      }

      ctx.fillStyle = rgba(C.cyan, alpha * (0.5 + flash * 0.5));
      ctx.beginPath();
      ctx.arc(x, y, 2.2 + flash * 2.6, 0, Math.PI * 2);
      ctx.fill();
      if (flash > 0.35) {
        ctx.strokeStyle = rgba(C.amber, alpha * flash * 0.6);
        ctx.beginPath();
        ctx.arc(x, y, 6 + flash * 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  /* ============================================================
     VIEW 04 — SYNAPTIC (the colony as a rotating neural net)
     ============================================================ */
  function project3d(ag, t) {
    var rx = t * 0.12, tilt = 0.5;
    var px = ag.u - 0.5, py = ag.v - 0.5, pz = ag.w - 0.5;
    var x1 = px * Math.cos(rx) - pz * Math.sin(rx);
    var z1 = px * Math.sin(rx) + pz * Math.cos(rx);
    var y1 = py * Math.cos(tilt) - z1 * Math.sin(tilt);
    var z2 = py * Math.sin(tilt) + z1 * Math.cos(tilt);
    var persp = 1.6 / (1.6 + z2);
    return {
      x: W * 0.5 + x1 * Math.min(W, H) * 0.92 * persp,
      y: H * 0.47 + y1 * Math.min(W, H) * 0.78 * persp,
      s: persp
    };
  }

  function renderSynaptic(t, alpha) {
    var pts = agents.map(function (ag) { return project3d(ag, t); });

    edges.forEach(function (e) {
      var a = agents[e[0]], b = agents[e[1]];
      var pa = pts[e[0]], pb = pts[e[1]];
      ctx.strokeStyle = rgba(C.violet, alpha * 0.14);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();

      /* the impulse travelling along the axon between the two neurons */
      var from = a.depth <= b.depth ? pa : pb;
      var to = a.depth <= b.depth ? pb : pa;
      var lead = Math.min(a.depth, b.depth);
      var frac = ((t - lead * HOP_DELAY) / PULSE_INTERVAL) % 1;
      if (frac >= 0 && frac < 0.35) {
        var q = frac / 0.35;
        var ix = from.x + (to.x - from.x) * q;
        var iy = from.y + (to.y - from.y) * q;
        ctx.fillStyle = rgba(C.cyan, alpha * (1 - q) * 0.95);
        ctx.beginPath();
        ctx.arc(ix, iy, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    agents.forEach(function (ag, idx) {
      var p = pts[idx];
      var flash = flashOf(beatPhase(ag, t));
      var r = (2.4 + flash * 4) * p.s;
      var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.2);
      grad.addColorStop(0, rgba(C.cyan, alpha * (0.5 + flash * 0.5)));
      grad.addColorStop(1, rgba(C.cyan, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba(C.cyan, alpha * (0.75 + flash * 0.25));
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ============================================================
     VIEW LOOP + CROSSFADE
     ============================================================ */
  var VIEWS = [
    { name: "01 // TRANSVERSE VIEW", render: renderTransverse },
    { name: "02 // LONGITUDINAL VIEW", render: renderLongitudinal },
    { name: "03 // OVERHEAD VIEW", render: renderOverhead },
    { name: "04 // SYNAPTIC VIEW", render: renderSynaptic }
  ];
  var VIEW_SECONDS = 9, FADE_SECONDS = 1.4;
  var shownLabel = -1;

  function frame(now) {
    var t = now / 1000;
    ctx.clearRect(0, 0, W, H);

    /* ambient depth glow behind everything */
    var bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, Math.max(W, H) * 0.7);
    bgGrad.addColorStop(0, "rgba(13, 21, 38, 0.85)");
    bgGrad.addColorStop(1, "rgba(4, 7, 15, 0)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    var cycle = t / VIEW_SECONDS;
    var current = Math.floor(cycle) % VIEWS.length;
    var next = (current + 1) % VIEWS.length;
    var local = (cycle - Math.floor(cycle)) * VIEW_SECONDS;
    var fadeIn = Math.min(1, local / FADE_SECONDS);
    var fadeOut = Math.max(0, (local - (VIEW_SECONDS - FADE_SECONDS)) / FADE_SECONDS);

    VIEWS[current].render(t, fadeIn * (1 - fadeOut));
    if (fadeOut > 0) VIEWS[next].render(t, fadeOut);

    var labelIdx = fadeOut > 0.5 ? next : current;
    if (labelIdx !== shownLabel && labelEl) {
      shownLabel = labelIdx;
      labelEl.classList.add("is-switching");
      setTimeout(function () {
        labelEl.textContent = VIEWS[shownLabel].name;
        labelEl.classList.remove("is-switching");
      }, 220);
    }

    requestAnimationFrame(frame);
  }

  if (reducedMotion) {
    /* static single frame of the synaptic view — no motion */
    renderSynaptic(4, 1);
    if (labelEl) labelEl.textContent = "04 // SYNAPTIC VIEW";
  } else {
    requestAnimationFrame(frame);
  }
})();
