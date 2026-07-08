const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const CONTROL_DEFS = {
  osc: [
    ["wave", "select", ["sine", "square", "sawtooth", "triangle"]],
    ["delay", "range", 0, 2, .01],
    ["freq", "range", 16, 1600, 1],
    ["endFreq", "range", 0, 2400, 1],
    ["gain", "range", 0, .25, .001],
    ["dur", "range", .02, 4, .01],
    ["attack", "range", .001, .8, .001],
    ["release", "range", .005, 1.5, .005],
    ["pan", "range", -1, 1, .01],
    ["lowpass", "range", 0, 12000, 10],
    ["highpass", "range", 0, 3000, 10],
    ["drive", "range", 0, 8, .01],
    ["lfoFreq", "range", 0, 60, .1],
    ["lfoDepth", "range", 0, 80, .1]
  ],
  noise: [
    ["delay", "range", 0, 2, .01],
    ["gain", "range", 0, .25, .001],
    ["dur", "range", .02, 5, .01],
    ["attack", "range", .001, .8, .001],
    ["release", "range", .005, 2, .005],
    ["pan", "range", -1, 1, .01],
    ["highpass", "range", 0, 6000, 10],
    ["lowpass", "range", 120, 14000, 10],
    ["endLowpass", "range", 0, 14000, 10],
    ["drive", "range", 0, 8, .01]
  ],
  rumble: [
    ["delay", "range", 0, 2, .01],
    ["strength", "range", 0, 1.8, .01],
    ["dur", "range", .1, 5, .01],
    ["pan", "range", -1, 1, .01]
  ],
  ticks: [
    ["delay", "range", 0, 2, .01],
    ["count", "range", 1, 24, 1],
    ["gain", "range", 0, .08, .001],
    ["dur", "range", .05, 2, .01],
    ["pan", "range", -1, 1, .01]
  ]
};

const PRESETS = {
  "Blast Off": {
    name: "blastOff",
    bus: "ship",
    masterGain: .9,
    pitchScale: 1.24,
    layers: [
      { name: "dirty square thrust", kind: "osc", wave: "square", freq: 16, endFreq: 12, gain: .088, dur: 1.28, attack: .001, release: .22, lowpass: 310, drive: 3.2, lfoFreq: 9.9, lfoDepth: 10.3, pan: 0, delay: 0, highpass: 0 },
      { name: "sub modulation", kind: "osc", wave: "square", delay: .05, freq: 29, endFreq: 49, gain: .052, dur: 1.95, attack: .007, release: .28, lowpass: 380, drive: 4.1, lfoFreq: 6.3, lfoDepth: 43.1, pan: 0, highpass: 0 },
      { name: "pressure wash", kind: "noise", delay: 0, dur: 1.04, gain: .029, highpass: 1360, lowpass: 620, endLowpass: 12150, attack: .03, release: 1.805, pan: 0, drive: 2.5 },
      { name: "floor rumble", kind: "rumble", delay: .14, strength: 1.46, dur: 1.18, pan: 0 }
    ]
  },
  "Launch Spool": {
    name: "launchSpool",
    bus: "ship",
    masterGain: .82,
    pitchScale: .62,
    layers: [
      { name: "low reactor body", kind: "osc", wave: "triangle", delay: 0, freq: 42, endFreq: 58, gain: .036, dur: 1.15, attack: .12, release: .34, lowpass: 360, highpass: 0, drive: .5, lfoFreq: 3.4, lfoDepth: 2.8, pan: 0 },
      { name: "fizzling ion hiss", kind: "noise", delay: .08, dur: 1.18, gain: .038, highpass: 760, lowpass: 3100, endLowpass: 6200, attack: .16, release: .42, pan: 0, drive: 1.4 },
      { name: "uneven plasma crackle", kind: "ticks", delay: .18, count: 8, gain: .004, dur: .9, pan: 0 },
      { name: "floor pressure", kind: "rumble", delay: .08, strength: .34, dur: 1.05, pan: 0 }
    ]
  },
  "Mag Clamp": {
    name: "clampRelease",
    bus: "ship",
    masterGain: .92,
    pitchScale: .62,
    layers: [
      { name: "clunk body", kind: "osc", wave: "triangle", freq: 56, endFreq: 38, dur: .3, gain: .082, attack: .002, release: .16, lowpass: 560, pan: 0, delay: 0, highpass: 0, drive: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "sub drop", kind: "osc", wave: "sine", delay: .16, freq: 25, endFreq: 223, dur: .42, gain: .072, attack: .001, release: .22, pan: 0, lowpass: 0, highpass: 0, drive: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "metal release", kind: "noise", delay: .006, dur: 1.73, gain: .053, highpass: 24, lowpass: 620, endLowpass: 150, attack: .09, release: .095, pan: 0, drive: 0 },
      { name: "electrical ticks", kind: "ticks", count: 3, dur: .13, gain: .009, pan: 0, delay: 0 }
    ]
  },
  "Station Rumble": {
    name: "stationRumble",
    bus: "ambience",
    masterGain: .8,
    pitchScale: .62,
    layers: [
      { name: "deep pulse", kind: "osc", wave: "sine", freq: 55, endFreq: 31, dur: 2.2, gain: .065, attack: .2, release: .6, lowpass: 200, lfoFreq: 1.8, lfoDepth: 3, pan: 0, delay: 0, highpass: 0, drive: 0 },
      { name: "duct hum", kind: "osc", wave: "triangle", freq: 44, endFreq: 52, dur: 2.2, gain: .018, attack: .058, release: .7, lowpass: 420, lfoFreq: .5, lfoDepth: 4, pan: -.08, delay: 0, highpass: 0, drive: 0 },
      { name: "air system", kind: "noise", dur: 2.2, gain: .009, highpass: 160, lowpass: 620, attack: .069, release: .7, pan: .08, delay: 0, endLowpass: 0, drive: 0 }
    ]
  },
  "Pulse Laser": {
    name: "laserPulse",
    bus: "weapons",
    masterGain: .9,
    pitchScale: .62,
    layers: [
      { name: "capacitor snap", kind: "osc", wave: "square", freq: 170, endFreq: 82, dur: .07, gain: .105, attack: .001, release: .025, lowpass: 1600 },
      { name: "bolt fizz", kind: "osc", wave: "sawtooth", delay: .018, freq: 920, endFreq: 260, dur: .12, gain: .048, attack: .001, release: .035, highpass: 260, lowpass: 7200 },
      { name: "ion noise", kind: "noise", delay: .006, dur: .13, gain: .04, highpass: 980, lowpass: 8800, endLowpass: 2600, attack: .001 }
    ]
  },
  "Explosion": {
    name: "explosion",
    bus: "world",
    masterGain: .82,
    pitchScale: .62,
    layers: [
      { name: "fire bloom", kind: "noise", dur: 1.05, gain: .15, highpass: 22, lowpass: 2200, endLowpass: 580, attack: .001, release: .34 },
      { name: "torn metal", kind: "osc", wave: "sawtooth", freq: 92, endFreq: 24, dur: 1.05, gain: .078, attack: .002, release: .28, lowpass: 720, drive: .4 },
      { name: "debris", kind: "ticks", count: 9, dur: .62, gain: .018 },
      { name: "sub pressure", kind: "rumble", strength: .82, dur: 1.15 }
    ]
  }
};

const state = structuredClone(PRESETS["Blast Off"]);
let ctx;
let master;
let noiseBuffer;
let loopTimer = null;
let snapshotA = null;
let snapshotB = null;
let currentSources = [];

const el = (id) => document.getElementById(id);
const layersEl = el("layers");
const exportEl = el("exportText");

function ensureAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) {
    ctx = new AudioCtx();
    master = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -17;
    limiter.knee.value = 18;
    limiter.ratio.value = 4.2;
    limiter.attack.value = .004;
    limiter.release.value = .22;
    master.connect(limiter).connect(ctx.destination);
    noiseBuffer = makeNoiseBuffer();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function makeNoiseBuffer() {
  const length = Math.max(1, Math.floor(ctx.sampleRate * 1.2));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function distortionCurve(amount = 1.6) {
  const curve = new Float32Array(256);
  const k = clamp(amount, .1, 8) * 28;
  for (let i = 0; i < curve.length; i++) {
    const x = i / (curve.length - 1) * 2 - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

function envelope(gain, t, dur, level, attack = .006, release = .035) {
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0001, level), t + attack);
  gain.gain.exponentialRampToValueAtTime(.0001, t + Math.max(attack + release, dur));
}

function panConnect(node, pan = 0) {
  if (Math.abs(pan) > .001 && ctx.createStereoPanner) {
    const panner = ctx.createStereoPanner();
    panner.pan.value = clamp(pan, -1, 1);
    node.connect(panner).connect(master);
  } else {
    node.connect(master);
  }
}

function applyFilters(node, layer, t) {
  let out = node;
  if (layer.highpass > 0) {
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(layer.highpass * state.pitchScale, t);
    out.connect(hp);
    out = hp;
  }
  if (layer.lowpass > 0) {
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(Math.max(120, layer.lowpass * state.pitchScale), t);
    if (layer.endLowpass > 0) lp.frequency.exponentialRampToValueAtTime(Math.max(120, layer.endLowpass * state.pitchScale), t + Math.max(.01, layer.dur));
    out.connect(lp);
    out = lp;
  }
  if (layer.drive > 0) {
    const shaper = ctx.createWaveShaper();
    shaper.curve = distortionCurve(layer.drive);
    shaper.oversample = "2x";
    out.connect(shaper);
    out = shaper;
  }
  return out;
}

function stopAll() {
  currentSources.forEach((source) => {
    try { source.stop(); } catch {}
  });
  currentSources = [];
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
}

function playPatch(patch = state, allowLoop = true) {
  ensureAudio();
  if (!ctx) return;
  master.gain.value = patch.masterGain;
  const start = ctx.currentTime + .015;
  let maxDur = .5;
  patch.layers.forEach((layer) => {
    const t = start + (layer.delay || 0);
    maxDur = Math.max(maxDur, (layer.delay || 0) + (layer.dur || .2) + (layer.release || .05));
    if (layer.kind === "osc") playOscLayer(layer, t, patch);
    if (layer.kind === "noise") playNoiseLayer(layer, t, patch);
    if (layer.kind === "rumble") playRumbleLayer(layer, t);
    if (layer.kind === "ticks") playTickLayer(layer, t);
  });
  if (allowLoop && el("loopToggle").checked && !loopTimer) {
    loopTimer = setInterval(() => playPatch(patch, false), Math.max(.2, maxDur + .16) * 1000);
  }
}

function playOscLayer(layer, t, patch) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = layer.wave || "sine";
  osc.frequency.setValueAtTime(Math.max(16, layer.freq * patch.pitchScale), t);
  if (layer.endFreq > 0) osc.frequency.exponentialRampToValueAtTime(Math.max(16, layer.endFreq * patch.pitchScale), t + Math.max(.01, layer.dur));
  if (layer.lfoFreq > 0 && layer.lfoDepth > 0) {
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(layer.lfoFreq, t);
    lfoGain.gain.setValueAtTime(layer.lfoDepth * patch.pitchScale, t);
    lfo.connect(lfoGain).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + layer.dur + .08);
    currentSources.push(lfo);
  }
  envelope(amp, t, layer.dur, layer.gain, layer.attack, layer.release);
  applyFilters(osc, layer, t).connect(amp);
  panConnect(amp, layer.pan || 0);
  osc.start(t);
  osc.stop(t + layer.dur + .08);
  currentSources.push(osc);
}

function playNoiseLayer(layer, t, patch) {
  const src = ctx.createBufferSource();
  const amp = ctx.createGain();
  src.buffer = noiseBuffer;
  src.loop = true;
  envelope(amp, t, layer.dur, layer.gain, layer.attack, layer.release);
  applyFilters(src, layer, t).connect(amp);
  panConnect(amp, layer.pan || 0);
  src.start(t);
  src.stop(t + layer.dur + .08);
  currentSources.push(src);
}

function playRumbleLayer(layer, t) {
  const sub = ctx.createOscillator();
  const body = ctx.createOscillator();
  const amp = ctx.createGain();
  const shaper = ctx.createWaveShaper();
  shaper.curve = distortionCurve(1.2);
  sub.type = "sine";
  body.type = "triangle";
  sub.frequency.setValueAtTime(28, t);
  sub.frequency.exponentialRampToValueAtTime(14, t + layer.dur * 1.1);
  body.frequency.setValueAtTime(42, t);
  body.frequency.exponentialRampToValueAtTime(20, t + layer.dur);
  envelope(amp, t, layer.dur * 1.28, .064 * layer.strength, .03, .42);
  sub.connect(shaper);
  body.connect(shaper);
  shaper.connect(amp);
  panConnect(amp, layer.pan || 0);
  sub.start(t);
  body.start(t + .015);
  sub.stop(t + layer.dur * 1.32 + .12);
  body.stop(t + layer.dur * 1.28 + .12);
  currentSources.push(sub, body);
}

function playTickLayer(layer, t) {
  for (let i = 0; i < layer.count; i++) {
    const delay = Math.random() * layer.dur;
    const f = 520 + Math.random() * 1800;
    playOscLayer({
      kind: "osc",
      wave: "triangle",
      delay,
      freq: f,
      endFreq: f * (.62 + Math.random() * .26),
      dur: .025 + Math.random() * .045,
      gain: layer.gain * (.55 + Math.random()),
      attack: .001,
      release: .025,
      highpass: 260,
      lowpass: 0,
      drive: 0,
      lfoFreq: 0,
      lfoDepth: 0,
      pan: clamp((layer.pan || 0) + (Math.random() - .5) * .35, -1, 1)
    }, t + delay, state);
  }
}

function render() {
  el("patchName").value = state.name;
  el("masterGain").value = state.masterGain;
  el("busSelect").value = state.bus;
  el("pitchScale").value = state.pitchScale;
  el("patchSummary").textContent = `${state.layers.length} layer patch for Ultra Elite ${state.bus} bus.`;
  layersEl.innerHTML = "";
  state.layers.forEach((layer, index) => renderLayer(layer, index));
  updateExport();
}

function renderLayer(layer, index) {
  const tpl = el("layerTemplate").content.cloneNode(true);
  const card = tpl.querySelector(".layer-card");
  const name = tpl.querySelector(".layer-name");
  const kind = tpl.querySelector(".layer-kind");
  const grid = tpl.querySelector(".control-grid");
  name.value = layer.name || `Layer ${index + 1}`;
  kind.value = layer.kind;
  name.addEventListener("input", () => { layer.name = name.value; updateExport(); });
  kind.addEventListener("change", () => {
    const replacement = defaultLayer(kind.value);
    replacement.name = layer.name || replacement.name;
    state.layers[index] = replacement;
    render();
  });
  tpl.querySelector(".duplicate-layer").addEventListener("click", () => {
    state.layers.splice(index + 1, 0, structuredClone(layer));
    render();
  });
  tpl.querySelector(".remove-layer").addEventListener("click", () => {
    state.layers.splice(index, 1);
    render();
  });
  CONTROL_DEFS[layer.kind].forEach((def) => grid.appendChild(controlFor(layer, def)));
  layersEl.appendChild(tpl);
  card.dataset.kind = layer.kind;
}

function controlFor(layer, def) {
  const [key, type, a, b, step] = def;
  const wrap = document.createElement("div");
  wrap.className = "control";
  const label = document.createElement("label");
  label.textContent = labelText(key);
  let input;
  if (type === "select") {
    input = document.createElement("select");
    a.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      input.appendChild(option);
    });
  } else {
    input = document.createElement("input");
    input.type = "range";
    input.min = a;
    input.max = b;
    input.step = step;
  }
  if (layer[key] == null) layer[key] = type === "select" ? a[0] : Number(a);
  input.value = layer[key];
  const readout = document.createElement("div");
  readout.className = "readout";
  readout.textContent = input.value;
  input.addEventListener("input", () => {
    layer[key] = type === "select" ? input.value : Number(input.value);
    readout.textContent = input.value;
    updateExport();
  });
  label.appendChild(input);
  wrap.append(label, readout);
  return wrap;
}

function labelText(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase());
}

function defaultLayer(kind) {
  if (kind === "noise") return { name: "noise layer", kind, delay: 0, dur: .4, gain: .04, attack: .01, release: .14, pan: 0, highpass: 80, lowpass: 2800, endLowpass: 900, drive: 0 };
  if (kind === "rumble") return { name: "rumble layer", kind, delay: 0, strength: .45, dur: .9, pan: 0 };
  if (kind === "ticks") return { name: "spark ticks", kind, delay: 0, count: 5, gain: .014, dur: .36, pan: 0 };
  return { name: "osc layer", kind: "osc", wave: "sine", delay: 0, freq: 120, endFreq: 0, gain: .04, dur: .3, attack: .01, release: .08, pan: 0, lowpass: 1200, highpass: 0, drive: 0, lfoFreq: 0, lfoDepth: 0 };
}

function loadPatch(patch) {
  Object.assign(state, structuredClone(patch));
  render();
}

function suggestPatch() {
  const text = el("soundPrompt").value.toLowerCase();
  if (text.includes("spool") || text.includes("engine") || text.includes("whine") || text.includes("launch")) return loadPatch(PRESETS["Launch Spool"]);
  if (text.includes("clamp") || text.includes("clunk")) return loadPatch(PRESETS["Mag Clamp"]);
  if (text.includes("station") || text.includes("rumble") || text.includes("hum")) return loadPatch(PRESETS["Station Rumble"]);
  if (text.includes("laser") || text.includes("beam") || text.includes("bolt")) return loadPatch(PRESETS["Pulse Laser"]);
  if (text.includes("explosion") || text.includes("boom") || text.includes("blast")) return loadPatch(PRESETS["Explosion"]);
  return loadPatch(PRESETS["Blast Off"]);
}

function updateExport() {
  exportEl.value = `${JSON.stringify(state, null, 2)}\n\n${toJsCase(state)}`;
}

function toJsCase(patch) {
  const gamePitchScale = .62;
  const gameFilterScale = .68;
  const pitchRatio = (patch.pitchScale || gamePitchScale) / gamePitchScale;
  const filterRatio = (patch.pitchScale || gamePitchScale) / gameFilterScale;
  const pitch = (value) => value > 0 ? value * pitchRatio : value;
  const filter = (value) => value > 0 ? value * filterRatio : value;
  const actualFilter = (value) => value > 0 ? value * (patch.pitchScale || gamePitchScale) : 0;
  const lines = [`case "${patch.name}":`];
  patch.layers.forEach((layer) => {
    if (layer.kind === "osc") {
      const fn = layer.lfoFreq > 0 && layer.lfoDepth > 0 ? "modulatedSquare" : "tone";
      const args = compact({
        delay: layer.delay,
        freq: pitch(layer.freq),
        endFreq: layer.endFreq > 0 ? pitch(layer.endFreq) : null,
        lfoFreq: fn === "modulatedSquare" ? layer.lfoFreq : null,
        lfoDepth: fn === "modulatedSquare" ? pitch(layer.lfoDepth) : null,
        dur: layer.dur,
        gain: layer.gain,
        type: fn === "tone" ? layer.wave : null,
        attack: layer.attack,
        release: layer.release,
        bus: patch.bus,
        pan: layer.pan,
        highpass: layer.highpass > 0 ? filter(layer.highpass) : null,
        lowpass: layer.lowpass > 0 ? filter(layer.lowpass) : null,
        drive: layer.drive > 0 ? layer.drive : null,
        minFreq: fn === "tone" && (pitch(layer.freq) < 24 || (layer.endFreq > 0 && pitch(layer.endFreq) < 24)) ? 16 : null
      });
      lines.push(`  ${fn}(${formatArgs(args)});`);
    }
    if (layer.kind === "noise") {
      lines.push(`  noise(${formatArgs(compact({
        delay: layer.delay,
        dur: layer.dur,
        gain: layer.gain,
        highpass: filter(layer.highpass),
        lowpass: filter(layer.lowpass),
        endLowpass: layer.endLowpass > 0 ? filter(layer.endLowpass) : null,
        attack: layer.attack,
        release: layer.release,
        bus: patch.bus,
        pan: layer.pan,
        drive: layer.drive > 0 ? layer.drive : null,
        minHighpass: actualFilter(layer.highpass) > 0 && actualFilter(layer.highpass) < 20 ? 1 : null,
        minLowpass: (actualFilter(layer.lowpass) > 0 && actualFilter(layer.lowpass) < 120) || (actualFilter(layer.endLowpass) > 0 && actualFilter(layer.endLowpass) < 120) ? 1 : null
      }))});`);
    }
    if (layer.kind === "rumble") {
      lines.push(`  rumble(${formatArgs(compact({ delay: layer.delay, strength: layer.strength, dur: layer.dur, bus: patch.bus, pan: layer.pan }))});`);
    }
    if (layer.kind === "ticks") {
      lines.push(`  sparkTicks(${formatArgs(compact({ count: layer.count, dur: layer.dur, gain: layer.gain, bus: patch.bus, pan: layer.pan }))});`);
    }
  });
  lines.push("  return true;");
  return lines.join("\n");
}

function compact(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== null && value !== undefined && value !== 0 && value !== ""));
}

function formatArgs(obj) {
  const bits = Object.entries(obj).map(([key, value]) => `${key}: ${typeof value === "string" ? JSON.stringify(value) : Number.isInteger(value) ? value : Number(value).toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}`);
  return `{ ${bits.join(", ")} }`;
}

async function copy(text) {
  await navigator.clipboard.writeText(text);
}

function bind() {
  Object.entries(PRESETS).forEach(([name, patch]) => {
    const button = document.createElement("button");
    button.textContent = name;
    button.addEventListener("click", () => loadPatch(patch));
    el("presetList").appendChild(button);
  });
  el("playBtn").addEventListener("click", () => { stopAll(); playPatch(); });
  el("stopBtn").addEventListener("click", stopAll);
  el("suggestBtn").addEventListener("click", suggestPatch);
  el("addLayerBtn").addEventListener("click", () => { state.layers.push(defaultLayer("osc")); render(); });
  el("patchName").addEventListener("input", (e) => { state.name = e.target.value; updateExport(); });
  el("masterGain").addEventListener("input", (e) => { state.masterGain = Number(e.target.value); updateExport(); });
  el("busSelect").addEventListener("change", (e) => { state.bus = e.target.value; updateExport(); });
  el("pitchScale").addEventListener("input", (e) => { state.pitchScale = Number(e.target.value); updateExport(); });
  el("copyJson").addEventListener("click", () => copy(JSON.stringify(state, null, 2)));
  el("copyJs").addEventListener("click", () => copy(toJsCase(state)));
  el("storeA").addEventListener("click", () => { snapshotA = structuredClone(state); });
  el("storeB").addEventListener("click", () => { snapshotB = structuredClone(state); });
  el("playA").addEventListener("click", () => snapshotA && playPatch(snapshotA, false));
  el("playB").addEventListener("click", () => snapshotB && playPatch(snapshotB, false));
}

bind();
render();
