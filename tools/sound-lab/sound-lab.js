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

let PRESETS = {
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
    bed: true,
    masterGain: .8,
    pitchScale: .62,
    layers: [
      { name: "deep pulse", kind: "osc", wave: "sine", freq: 27, endFreq: 31, dur: 2.2, gain: .099, attack: .2, release: .6, lowpass: 200, lfoFreq: 1.8, lfoDepth: 3, pan: 0 },
      { name: "duct hum", kind: "osc", wave: "triangle", freq: 44, endFreq: 52, dur: 2.2, gain: .056, attack: .24, release: .7, lowpass: 420, lfoFreq: .5, lfoDepth: 4, pan: -.08 },
      { name: "air system", kind: "noise", dur: 2.2, gain: .028, highpass: 160, lowpass: 620, attack: .2, release: .7, pan: .08 }
    ]
  },
  "Wide Low Ambient Reference": {
    name: "wideLowAmbientReference",
    bus: "ambience",
    bed: true,
    masterGain: .62,
    pitchScale: 1,
    layers: [
      { name: "deep pressure carrier", kind: "osc", wave: "sine", freq: 68.5, endFreq: 71.5, dur: 2.6, gain: .075, attack: .35, release: .75, lowpass: 180, lfoFreq: .18, lfoDepth: 1.4, pan: -.12 },
      { name: "wide body hum", kind: "osc", wave: "triangle", freq: 45.5, endFreq: 55.5, dur: 2.6, gain: .048, attack: .45, release: .8, lowpass: 260, lfoFreq: .11, lfoDepth: 2.2, pan: .14 },
      { name: "thin upper mist", kind: "noise", dur: 2.6, gain: .018, highpass: 920, lowpass: 2400, endLowpass: 1650, attack: .4, release: .9, pan: .18, drive: .2 }
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
  },
  "Large Explosion Reference": {
    name: "largeExplosionReference",
    bus: "world",
    masterGain: .78,
    pitchScale: .62,
    layers: [
      { name: "clipped air crack", kind: "noise", dur: .16, gain: .09, highpass: 1400, lowpass: 12000, endLowpass: 4200, attack: .001, release: .08, drive: 1.8 },
      { name: "fireball wall", kind: "noise", delay: .04, dur: 1.55, gain: .17, highpass: 22, lowpass: 3200, endLowpass: 520, attack: .015, release: .62, drive: 1.2 },
      { name: "low torn body", kind: "osc", wave: "sawtooth", delay: .05, freq: 44, endFreq: 24, dur: 1.35, gain: .12, attack: .006, release: .72, lowpass: 640, drive: 1.2 },
      { name: "sub pressure shelf", kind: "rumble", delay: .08, strength: 1.15, dur: 1.95 },
      { name: "falling debris fizz", kind: "noise", delay: .55, dur: 2.45, gain: .045, highpass: 160, lowpass: 1800, endLowpass: 320, attack: .04, release: 1.1, drive: .7 },
      { name: "debris spit", kind: "ticks", delay: .38, count: 18, dur: 1.6, gain: .009 }
    ]
  },
  "Boop UI": {
    name: "boop",
    bus: "cockpit",
    masterGain: .78,
    pitchScale: .62,
    layers: [
      { name: "low ui chirp", kind: "osc", wave: "sine", freq: 150, endFreq: 120, dur: .32, gain: .07, attack: .004, release: .035, pan: 0, lowpass: 0, highpass: 0, drive: 0, lfoFreq: 0, lfoDepth: 0 }
    ]
  },
  "Beep UI": {
    name: "beep",
    bus: "cockpit",
    masterGain: .78,
    pitchScale: .62,
    layers: [
      { name: "high ui chirp", kind: "osc", wave: "sine", freq: 920, endFreq: 780, dur: .09, gain: .07, attack: .004, release: .035, pan: 0, lowpass: 0, highpass: 0, drive: 0, lfoFreq: 0, lfoDepth: 0 }
    ]
  },
  "Beam Laser": {
    name: "laserBeam",
    bus: "weapons",
    masterGain: .9,
    pitchScale: .62,
    layers: [
      { name: "cutter body", kind: "osc", wave: "sawtooth", freq: 285, endFreq: 210, dur: .16, gain: .068, attack: .004, release: .045, lowpass: 1200, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "electrical edge", kind: "osc", wave: "triangle", delay: .015, freq: 820, endFreq: 620, dur: .12, gain: .038, attack: .002, release: .035, highpass: 300, lowpass: 4800, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "beam hiss", kind: "noise", delay: .004, dur: .16, gain: .035, highpass: 520, lowpass: 7200, endLowpass: 2600, attack: .006, release: .035, pan: 0, drive: 0 }
    ]
  },
  "Military Laser": {
    name: "laserMilitary",
    bus: "weapons",
    masterGain: .9,
    pitchScale: .62,
    layers: [
      { name: "heavy crack", kind: "osc", wave: "sawtooth", freq: 210, endFreq: 54, dur: .18, gain: .12, attack: .001, release: .055, lowpass: 1400, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "sharp tail", kind: "osc", wave: "sawtooth", delay: .026, freq: 1180, endFreq: 190, dur: .16, gain: .052, attack: .001, release: .035, highpass: 320, lowpass: 7600, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "military ion noise", kind: "noise", delay: .002, dur: .18, gain: .05, highpass: 360, lowpass: 9200, endLowpass: 1700, attack: .001, release: .035, pan: 0, drive: 0 },
      { name: "spark ticks", kind: "ticks", count: 3, dur: .14, gain: .014, pan: 0, delay: 0 }
    ]
  },
  "Mining Laser": {
    name: "laserMining",
    bus: "weapons",
    masterGain: .9,
    pitchScale: .62,
    layers: [
      { name: "industrial cutter", kind: "osc", wave: "sawtooth", freq: 132, endFreq: 58, dur: .46, gain: .105, attack: .018, release: .12, lowpass: 900, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "low bore", kind: "osc", wave: "triangle", delay: .055, freq: 72, endFreq: 42, dur: .42, gain: .062, attack: .028, release: .16, lowpass: 0, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "rock dust", kind: "noise", delay: .018, dur: .42, gain: .07, highpass: 45, lowpass: 2600, endLowpass: 900, attack: .02, release: .16, pan: 0, drive: 0 },
      { name: "debris ticks", kind: "ticks", count: 7, dur: .38, gain: .012, pan: 0, delay: 0 }
    ]
  },
  "Enemy Laser Light": {
    name: "enemyLaser",
    bus: "weapons",
    masterGain: .86,
    pitchScale: .62,
    layers: [
      { name: "light hostile zap", kind: "osc", wave: "triangle", freq: 720, endFreq: 210, dur: .14, gain: .044, attack: .001, release: .035, highpass: 180, lowpass: 5200, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "hostile fizz", kind: "noise", dur: .1, gain: .022, highpass: 640, lowpass: 7600, endLowpass: 1800, attack: .001, release: .035, pan: 0, drive: 0 }
    ]
  },
  "Enemy Laser Medium": {
    name: "enemyLaser",
    bus: "weapons",
    masterGain: .86,
    pitchScale: .62,
    layers: [
      { name: "medium hostile zap", kind: "osc", wave: "triangle", freq: 520, endFreq: 110, dur: .14, gain: .06, attack: .001, release: .035, highpass: 180, lowpass: 5200, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "hostile fizz", kind: "noise", dur: .1, gain: .032, highpass: 640, lowpass: 7600, endLowpass: 1800, attack: .001, release: .035, pan: 0, drive: 0 }
    ]
  },
  "Enemy Laser Heavy": {
    name: "enemyLaser",
    bus: "weapons",
    masterGain: .9,
    pitchScale: .62,
    layers: [
      { name: "heavy hostile shot", kind: "osc", wave: "sawtooth", freq: 310, endFreq: 72, dur: .2, gain: .078, attack: .001, release: .035, highpass: 90, lowpass: 4600, drive: .8, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "sharp hostile tail", kind: "osc", wave: "sawtooth", delay: .018, freq: 1200, endFreq: 190, dur: .16, gain: .032, attack: .001, release: .035, highpass: 320, lowpass: 7600, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "heavy hostile fizz", kind: "noise", dur: .14, gain: .048, highpass: 640, lowpass: 7600, endLowpass: 1800, attack: .001, release: .035, pan: 0, drive: 0 }
    ]
  },
  "Enemy Laser Alien": {
    name: "enemyLaser",
    bus: "weapons",
    masterGain: .9,
    pitchScale: .62,
    layers: [
      { name: "alien cutter", kind: "osc", wave: "triangle", freq: 420, endFreq: 820, dur: .22, gain: .07, attack: .001, release: .035, highpass: 180, lowpass: 6800, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "green plasma fizz", kind: "noise", dur: .16, gain: .041, highpass: 920, lowpass: 9000, endLowpass: 2600, attack: .001, release: .035, pan: 0, drive: 0 }
    ]
  },
  "Shield / Hull Hit": {
    name: "hit",
    bus: "ship",
    masterGain: .9,
    pitchScale: .62,
    layers: [
      { name: "impact wash", kind: "noise", dur: .98, gain: .107, highpass: 118, lowpass: 1235, endLowpass: 1324, attack: .01, release: .14, pan: 0, drive: 0 },
      { name: "body thud", kind: "osc", wave: "triangle", freq: 96, endFreq: 77, dur: 2.2, gain: .018, attack: .24, release: .7, lowpass: 618, highpass: 0, drive: 0, pan: -.08, lfoFreq: 0, lfoDepth: 0 },
      { name: "air shudder", kind: "noise", dur: 3.68, gain: .009, highpass: 235, lowpass: 912, attack: .2, release: .335, pan: .08, drive: 1.2 },
      { name: "hull resonance", kind: "osc", wave: "sine", freq: 116, dur: .87, gain: .04, attack: .01, release: .08, lowpass: 1765, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 }
    ]
  },
  "Death Explosion": {
    name: "death",
    bus: "world",
    masterGain: .9,
    pitchScale: .62,
    layers: [
      { name: "catastrophic bloom", kind: "noise", dur: 1.75, gain: .18, highpass: 18, lowpass: 1600, endLowpass: 340, attack: .001, release: .55, pan: 0, drive: 0 },
      { name: "hull tear", kind: "osc", wave: "sawtooth", freq: 118, endFreq: 18, dur: 1.65, gain: .095, attack: .001, release: .46, lowpass: 760, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "pressure wave", kind: "rumble", delay: .03, strength: 1.28, dur: 1.55, pan: 0 },
      { name: "debris shower", kind: "ticks", count: 16, dur: 1.05, gain: .022, pan: 0, delay: 0 }
    ]
  },
  "Missile Launch": {
    name: "missile",
    bus: "weapons",
    masterGain: .86,
    pitchScale: .62,
    layers: [
      { name: "missile ignition", kind: "osc", wave: "sawtooth", freq: 96, endFreq: 420, dur: .32, gain: .075, attack: .008, release: .075, lowpass: 1600, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "missile smoke", kind: "noise", delay: .03, dur: .4, gain: .06, highpass: 80, lowpass: 4200, endLowpass: 1800, attack: .02, release: .16, pan: 0, drive: 0 }
    ]
  },
  "Classic Launch": {
    name: "launch",
    bus: "ship",
    masterGain: .82,
    pitchScale: .62,
    layers: [
      { name: "launch rise", kind: "osc", wave: "sawtooth", freq: 72, endFreq: 260, dur: .9, gain: .075, attack: .04, release: .22, lowpass: 1050, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "launch wash", kind: "noise", delay: .05, dur: .95, gain: .07, highpass: 34, lowpass: 3400, endLowpass: 1650, attack: .04, release: .26, pan: 0, drive: 0 },
      { name: "launch rumble", kind: "rumble", delay: .08, strength: .46, dur: .85, pan: 0 }
    ]
  },
  "Hyperspace": {
    name: "hyperspace",
    bus: "ambience",
    masterGain: .9,
    pitchScale: .62,
    layers: [
      { name: "charging sweep", kind: "osc", wave: "sawtooth", freq: 74, endFreq: 920, dur: 1.05, gain: .075, attack: .025, release: .14, lowpass: 2600, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "upper vector whine", kind: "osc", wave: "triangle", delay: .14, freq: 180, endFreq: 1480, dur: .98, gain: .052, attack: .025, release: .035, highpass: 90, lowpass: 6200, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "jump tunnel noise", kind: "noise", delay: .02, dur: 1.18, gain: .072, highpass: 120, lowpass: 9800, endLowpass: 3400, attack: .025, release: .22, pan: 0, drive: 0 },
      { name: "jump pressure", kind: "rumble", delay: .02, strength: .54, dur: 1.05, pan: 0 }
    ]
  },
  "ECM": {
    name: "ecm",
    bus: "cockpit",
    masterGain: .82,
    pitchScale: .62,
    layers: [
      { name: "ecm warble low", kind: "osc", wave: "sine", freq: 740, endFreq: 1400, dur: .62, gain: .045, attack: .004, release: .035, pan: 0, lowpass: 0, highpass: 0, drive: 0, lfoFreq: 12, lfoDepth: 460 },
      { name: "ecm warble high", kind: "osc", wave: "sine", delay: .04, freq: 1220, endFreq: 760, dur: .58, gain: .032, attack: .004, release: .035, pan: 0, lowpass: 0, highpass: 0, drive: 0, lfoFreq: 12, lfoDepth: 420 },
      { name: "ecm hiss", kind: "noise", dur: .58, gain: .035, highpass: 1300, lowpass: 9000, attack: .004, release: .035, pan: 0, drive: 0 }
    ]
  },
  "Energy Bomb": {
    name: "bomb",
    bus: "world",
    masterGain: .9,
    pitchScale: .62,
    layers: [
      { name: "bomb flash", kind: "noise", dur: .82, gain: .17, highpass: 70, lowpass: 9800, endLowpass: 880, attack: .001, release: .28, pan: 0, drive: 0 },
      { name: "bomb drop", kind: "osc", wave: "sawtooth", freq: 58, endFreq: 18, dur: .9, gain: .095, attack: .001, release: .28, lowpass: 780, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "bomb rumble", kind: "rumble", strength: 1.05, dur: 1.05, pan: 0 },
      { name: "bomb ticks", kind: "ticks", count: 8, dur: .4, gain: .018, pan: 0, delay: 0 }
    ]
  },
  "Fuel Scoop": {
    name: "scoop",
    bus: "ship",
    masterGain: .75,
    pitchScale: .62,
    layers: [
      { name: "scoop open", kind: "osc", wave: "sine", freq: 420, endFreq: 620, dur: .09, gain: .05, attack: .004, release: .035, pan: 0, lowpass: 0, highpass: 0, drive: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "scoop lock", kind: "osc", wave: "sine", delay: .08, freq: 780, endFreq: 640, dur: .08, gain: .045, attack: .004, release: .035, pan: 0, lowpass: 0, highpass: 0, drive: 0, lfoFreq: 0, lfoDepth: 0 }
    ]
  },
  "Cargo Scoop Pickup": {
    name: "cargoScoop",
    bus: "ship",
    masterGain: .84,
    pitchScale: .62,
    layers: [
      { name: "mechanical intake", kind: "osc", wave: "triangle", freq: 74, endFreq: 46, dur: .18, gain: .06, attack: .002, release: .09, lowpass: 520, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "scoop scrape", kind: "noise", delay: .012, dur: .16, gain: .052, highpass: 28, lowpass: 740, endLowpass: 260, attack: .002, release: .08, pan: 0, drive: .9 },
      { name: "servo catch", kind: "osc", wave: "sawtooth", delay: .11, freq: 185, endFreq: 92, dur: .34, gain: .032, attack: .012, release: .13, lowpass: 980, highpass: 0, drive: .7, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "bay pressure", kind: "noise", delay: .18, dur: .48, gain: .024, highpass: 520, lowpass: 2600, endLowpass: 880, attack: .018, release: .2, pan: 0, drive: 1.1 },
      { name: "cargo thud", kind: "osc", wave: "triangle", delay: .32, freq: 58, endFreq: 34, dur: .26, gain: .05, attack: .004, release: .11, lowpass: 420, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 }
    ]
  },
  "Hangar Servo": {
    name: "hangarServo",
    bus: "world",
    masterGain: .82,
    pitchScale: .62,
    layers: [
      { name: "servo left", kind: "osc", wave: "triangle", freq: 82, endFreq: 132, dur: .48, gain: .046, attack: .018, release: .14, lowpass: 780, highpass: 0, drive: 0, pan: -.16, lfoFreq: 0, lfoDepth: 0 },
      { name: "servo right", kind: "osc", wave: "sawtooth", delay: .045, freq: 205, endFreq: 96, dur: .42, gain: .024, attack: .018, release: .16, lowpass: 1150, highpass: 0, drive: 0, pan: .18, lfoFreq: 0, lfoDepth: 0 },
      { name: "machinery scrape", kind: "noise", delay: .02, dur: .48, gain: .032, highpass: 55, lowpass: 1450, endLowpass: 520, attack: .018, release: .18, pan: .08, drive: 0 }
    ]
  },
  "Clamp Engage": {
    name: "clampEngage",
    bus: "ship",
    masterGain: .86,
    pitchScale: .62,
    layers: [
      { name: "clamp bite", kind: "osc", wave: "triangle", freq: 42, endFreq: 30, dur: .36, gain: .074, attack: .001, release: .19, lowpass: 520, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 },
      { name: "lock scrape", kind: "noise", delay: .01, dur: .2, gain: .072, highpass: 22, lowpass: 480, endLowpass: 130, attack: .001, release: .12, pan: 0, drive: 0 },
      { name: "station latch", kind: "osc", wave: "triangle", delay: .12, freq: 118, endFreq: 68, dur: .28, gain: .036, attack: .004, release: .12, lowpass: 820, highpass: 0, drive: 0, pan: 0, lfoFreq: 0, lfoDepth: 0 }
    ]
  }
};

normalizePresetBank(PRESETS);
const state = structuredClone(PRESETS["Blast Off"]);
let ctx;
let master;
let noiseBuffer;
let loopTimer = null;
let currentSources = [];
let bedPreview = null;
let bedRaf = null;
let activePresetName = "Blast Off";

const el = (id) => document.getElementById(id);
const layersEl = el("layers");

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

function smoothParam(param, value, lag = .08) {
  if (!ctx || !param) return;
  param.setTargetAtTime(Math.max(.00001, value), ctx.currentTime, lag);
}

function smoothSignedParam(param, value, lag = .08) {
  if (!ctx || !param) return;
  param.setTargetAtTime(value, ctx.currentTime, lag);
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
  stopBedPreview();
  currentSources.forEach((source) => {
    try { source.stop(); } catch {}
  });
  currentSources = [];
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
  setTransportStatus("STOPPED");
}

function stationBedLayers(patch = state) {
  const oscLayers = patch.layers.filter((layer) => layer.kind === "osc");
  const pressure = patch.layers.find((layer) => /pulse|pressure|deep/i.test(layer.name || "") && layer.kind === "osc") || oscLayers[0] || defaultLayer("osc");
  const duct = patch.layers.find((layer) => /duct|hum|body/i.test(layer.name || "") && layer.kind === "osc") || oscLayers[1] || pressure;
  const air = patch.layers.find((layer) => /air|noise|hiss/i.test(layer.name || "") && layer.kind === "noise") || patch.layers.find((layer) => layer.kind === "noise") || defaultLayer("noise");
  return { pressure, duct, air };
}

function startBedPreview() {
  ensureAudio();
  if (!ctx) return;
  stopAll();
  master.gain.value = state.masterGain;
  const pressure = ctx.createOscillator();
  const duct = ctx.createOscillator();
  const noiseSrc = ctx.createBufferSource();
  const pressureGain = ctx.createGain();
  const ductGain = ctx.createGain();
  const airGain = ctx.createGain();
  const pressureFilter = ctx.createBiquadFilter();
  const ductFilter = ctx.createBiquadFilter();
  const airHp = ctx.createBiquadFilter();
  const airBp = ctx.createBiquadFilter();
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

  pressure.type = "sine";
  duct.type = "triangle";
  noiseSrc.buffer = noiseBuffer;
  noiseSrc.loop = true;
  pressureFilter.type = "lowpass";
  ductFilter.type = "lowpass";
  airHp.type = "highpass";
  airBp.type = "bandpass";
  airBp.Q.value = 3.2;
  for (const gain of [pressureGain, ductGain, airGain]) gain.gain.value = .00001;

  pressure.connect(pressureFilter).connect(pressureGain).connect(master);
  duct.connect(ductFilter).connect(ductGain).connect(master);
  const airOut = pan || master;
  noiseSrc.connect(airHp).connect(airBp).connect(airGain).connect(airOut);
  if (pan) pan.connect(master);
  pressure.start();
  duct.start();
  noiseSrc.start();
  bedPreview = { pressure, duct, noiseSrc, pressureGain, ductGain, airGain, pressureFilter, ductFilter, airHp, airBp, pan };
  setTransportStatus("BED LIVE");
  updateBedPreview();
}

function stopBedPreview() {
  if (bedRaf) {
    cancelAnimationFrame(bedRaf);
    bedRaf = null;
  }
  if (!bedPreview) return;
  for (const source of [bedPreview.pressure, bedPreview.duct, bedPreview.noiseSrc]) {
    try { source.stop(); } catch {}
  }
  bedPreview = null;
}

function updateBedPreview() {
  if (!bedPreview || !ctx) return;
  master.gain.value = state.masterGain;
  const { pressure, duct, air } = stationBedLayers(state);
  const now = ctx.currentTime;
  const pulse = .54 + Math.sin(now * 1.85) * .22 + Math.sin(now * .47 + 2.1) * .18;
  const ductMod = .5 + Math.sin(now * .28) * .22;
  const airMod = .64 + Math.sin(now * .42 + 1.1) * .16;
  const pressureFreq = (pressure.freq || 27) + ((pressure.endFreq || pressure.freq || 31) - (pressure.freq || 27)) * pulse;
  const ductFreq = (duct.freq || 44) + ((duct.endFreq || duct.freq || 52) - (duct.freq || 44)) * ductMod;
  const airFreq = Math.max(80, (air.lowpass || 620) * (.7 + airMod * .45));
  const airHpFreq = Math.max(1, air.highpass || 160);
  const level = 1.45;

  smoothParam(bedPreview.pressure.frequency, Math.max(1, pressureFreq * state.pitchScale), .08);
  smoothParam(bedPreview.duct.frequency, Math.max(1, ductFreq * state.pitchScale), .1);
  smoothParam(bedPreview.pressureFilter.frequency, Math.max(90, (pressure.lowpass || 200) * state.pitchScale), .12);
  smoothParam(bedPreview.ductFilter.frequency, Math.max(90, (duct.lowpass || 420) * state.pitchScale), .12);
  smoothParam(bedPreview.airHp.frequency, airHpFreq * state.pitchScale, .14);
  smoothParam(bedPreview.airBp.frequency, airFreq * state.pitchScale, .1);
  smoothParam(bedPreview.pressureGain.gain, (pressure.gain || 0) * (.72 + pulse * .38) * level, .08);
  smoothParam(bedPreview.ductGain.gain, (duct.gain || 0) * (.66 + ductMod * .42) * level, .1);
  smoothParam(bedPreview.airGain.gain, (air.gain || 0) * (.5 + airMod * .32) * level, .12);
  if (bedPreview.pan) smoothSignedParam(bedPreview.pan.pan, Math.sin(now * .18) * .08, .16);
  bedRaf = requestAnimationFrame(updateBedPreview);
}

function setTransportStatus(text) {
  const status = el("transportStatus");
  if (status) status.textContent = text;
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
  if (allowLoop && !loopTimer) {
    loopTimer = setInterval(() => playPatch(patch, false), Math.max(.2, maxDur + .16) * 1000);
    setTransportStatus("LOOPING");
  }
}

function playSelectedPatch() {
  if (state.bed) {
    startBedPreview();
    return;
  }
  stopAll();
  playPatch(state, true);
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
  const presetSelect = el("presetSelect");
  if (presetSelect && presetSelect.value !== activePresetName) presetSelect.value = activePresetName;
  el("patchSummary").textContent = `${state.layers.length} layer ${state.bed ? "continuous bed" : "one-shot"} patch for Ultra Elite ${state.bus} bus.`;
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

function normalizePatch(patch) {
  patch.name ||= "customSound";
  patch.bus ||= "ship";
  patch.masterGain = Number.isFinite(patch.masterGain) ? patch.masterGain : .8;
  patch.pitchScale = Number.isFinite(patch.pitchScale) ? patch.pitchScale : .62;
  patch.bed = patch.bed === true || String(patch.bed || "").toLowerCase() === "true" || String(patch.mode || "").toLowerCase() === "bed";
  if (!Array.isArray(patch.layers)) patch.layers = [];
  patch.layers.forEach((layer) => {
    layer.kind ||= "osc";
    Object.assign(layer, { ...defaultLayer(layer.kind), ...layer });
  });
  return patch;
}

function normalizePresetBank(bank) {
  Object.entries(bank).forEach(([, patch]) => normalizePatch(patch));
  return bank;
}

function syncActivePreset() {
  if (!activePresetName) return;
  PRESETS[activePresetName] = structuredClone(state);
}

function loadPatch(patch, presetName = null) {
  if (presetName) activePresetName = presetName;
  Object.assign(state, structuredClone(patch));
  render();
}

function selectPreset(name) {
  if (!PRESETS[name]) return;
  syncActivePreset();
  stopAll();
  activePresetName = name;
  loadPatch(PRESETS[name], name);
  playSelectedPatch();
}

function suggestPatch() {
  const text = el("soundPrompt").value.toLowerCase();
  if (text.includes("spool") || text.includes("engine") || text.includes("whine") || text.includes("launch")) return selectPreset("Launch Spool");
  if (text.includes("clamp") || text.includes("clunk")) return selectPreset("Mag Clamp");
  if (text.includes("station") || text.includes("rumble") || text.includes("hum")) return selectPreset("Station Rumble");
  if (text.includes("laser") || text.includes("beam") || text.includes("bolt")) return selectPreset("Pulse Laser");
  if (text.includes("explosion") || text.includes("boom") || text.includes("blast")) return selectPreset("Explosion");
  return selectPreset("Blast Off");
}

function updateExport() {
  syncActivePreset();
  el("playBtn").textContent = state.bed ? "Play Bed" : "Play Loop";
  setBankStatus(`${Object.keys(PRESETS).length} PRESETS READY.`);
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

function setBankStatus(text) {
  const status = el("bankStatus");
  if (status) status.textContent = text;
}

function rebuildPresetSelect() {
  const presetSelect = el("presetSelect");
  presetSelect.innerHTML = "";
  Object.entries(PRESETS).forEach(([name, patch]) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = `${name} (${patch.name}${patch.bed ? ", bed" : ""})`;
    presetSelect.appendChild(option);
  });
  presetSelect.value = activePresetName;
}

function exportBankJson() {
  syncActivePreset();
  return JSON.stringify(PRESETS, null, 2);
}

function extractJson(text) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Clipboard is empty.");
  try {
    return JSON.parse(trimmed);
  } catch {}
  const marker = trimmed.indexOf("// ALL SOUND LAB PRESETS");
  const jsonText = marker >= 0 ? trimmed.slice(marker).replace(/^\/\/ ALL SOUND LAB PRESETS\s*/, "") : trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);
  return JSON.parse(jsonText);
}

async function importBankFromClipboard() {
  try {
    const parsed = extractJson(await navigator.clipboard.readText());
    if (parsed.layers) {
      normalizePatch(parsed);
      PRESETS[activePresetName] = structuredClone(parsed);
    } else {
      PRESETS = normalizePresetBank(parsed);
      if (!PRESETS[activePresetName]) activePresetName = Object.keys(PRESETS)[0] || "Imported Sound";
    }
    rebuildPresetSelect();
    loadPatch(PRESETS[activePresetName], activePresetName);
    setBankStatus("BANK IMPORTED.");
  } catch (err) {
    setBankStatus(`IMPORT FAILED: ${err.message}`);
  }
}

function bind() {
  rebuildPresetSelect();
  el("presetSelect").addEventListener("change", (e) => selectPreset(e.target.value));
  el("playBtn").addEventListener("click", playSelectedPatch);
  el("stopBtn").addEventListener("click", stopAll);
  el("suggestBtn").addEventListener("click", suggestPatch);
  el("addLayerBtn").addEventListener("click", () => { state.layers.push(defaultLayer("osc")); render(); });
  el("patchName").addEventListener("input", (e) => { state.name = e.target.value; updateExport(); });
  el("masterGain").addEventListener("input", (e) => { state.masterGain = Number(e.target.value); updateExport(); });
  el("busSelect").addEventListener("change", (e) => { state.bus = e.target.value; updateExport(); });
  el("pitchScale").addEventListener("input", (e) => { state.pitchScale = Number(e.target.value); updateExport(); });
  el("copyAll").addEventListener("click", async () => { await copy(exportBankJson()); setBankStatus("BANK COPIED."); });
  el("importAll").addEventListener("click", importBankFromClipboard);
}

bind();
render();
