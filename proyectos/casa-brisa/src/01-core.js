import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Sky } from 'three/addons/objects/Sky.js';

// =====================================================================
// 0 · Utilidades
// =====================================================================
const $ = (s) => document.querySelector(s);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
async function progress(p, msg) {
  $('#load-bar').style.width = (p * 100).toFixed(0) + '%';
  if (msg) $('#load-msg').textContent = msg;
  await nextFrame();
}

const isTouch = matchMedia('(pointer: coarse)').matches;

// =====================================================================
// 1 · Render
// =====================================================================
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
let QUALITY = isTouch ? 'media' : 'alta';
function applyPixelRatio() {
  renderer.setPixelRatio(QUALITY === 'alta' ? Math.min(devicePixelRatio, 1.75) : Math.min(devicePixelRatio, 1));
}
applyPixelRatio();
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
$('#stage').appendChild(renderer.domElement);
renderer.domElement.tabIndex = 0;
const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.05, 4000);
camera.rotation.order = 'YXZ';

// =====================================================================
// 2 · Ruido tileable y texturas procedurales
// =====================================================================
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash2(a, b, s) { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
class TN {
  constructor(px, py, seed) { this.px = px; this.py = py; const r = mulberry32(seed * 9973 + px * 31 + py); const n = px * py; this.v = new Float32Array(n); for (let i = 0; i < n; i++) this.v[i] = r(); }
  get(x, y) {
    const px = this.px, py = this.py; let xi = Math.floor(x), yi = Math.floor(y); const xf = x - xi, yf = y - yi;
    xi %= px; if (xi < 0) xi += px; yi %= py; if (yi < 0) yi += py;
    const x1 = xi + 1 === px ? 0 : xi + 1, y1 = yi + 1 === py ? 0 : yi + 1;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const V = this.v;
    const a = V[yi * px + xi], b = V[yi * px + x1], c = V[y1 * px + xi], d = V[y1 * px + x1];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
}
function FBM(fx, fy, oct, seed) {
  const ns = []; for (let o = 0; o < oct; o++) ns.push(new TN(fx << o, fy << o, seed + o * 131));
  return (u, v) => { let s = 0, a = 0.5, t = 0; for (let o = 0; o < oct; o++) { const n = ns[o]; s += a * n.get(u * n.px, v * n.py); t += a; a *= 0.5; } return s / t; };
}

function canvasTex(canvas, srgb) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function buildTex(N, pixel, normalK = 2, wantRough = false) {
  const c = document.createElement('canvas'); c.width = c.height = N;
  const ctx = c.getContext('2d'); const img = ctx.createImageData(N, N); const d = img.data;
  const H = new Float32Array(N * N); const R = wantRough ? new Float32Array(N * N) : null;
  const o = { r: 0, g: 0, b: 0, h: 0.5, ro: 0.5 };
  for (let y = 0; y < N; y++) {
    const v = (y + 0.5) / N;
    for (let x = 0; x < N; x++) {
      pixel((x + 0.5) / N, v, o);
      const i = y * N + x, j = i * 4;
      d[j] = o.r; d[j + 1] = o.g; d[j + 2] = o.b; d[j + 3] = 255; H[i] = o.h; if (R) R[i] = o.ro;
    }
  }
  ctx.putImageData(img, 0, 0);
  const out = { map: canvasTex(c, true) };
  if (normalK > 0) {
    const nc = document.createElement('canvas'); nc.width = nc.height = N;
    const nctx = nc.getContext('2d'); const ni = nctx.createImageData(N, N); const nd = ni.data;
    for (let y = 0; y < N; y++) {
      const ym = ((y - 1 + N) % N) * N, yp = ((y + 1) % N) * N, yr = y * N;
      for (let x = 0; x < N; x++) {
        const xm = (x - 1 + N) % N, xp = (x + 1) % N;
        const dx = (H[yr + xp] - H[yr + xm]) * normalK, dy = (H[yp + x] - H[ym + x]) * normalK;
        const l = Math.hypot(dx, dy, 1); const j = (yr + x) * 4;
        nd[j] = (-dx / l * 0.5 + 0.5) * 255; nd[j + 1] = (dy / l * 0.5 + 0.5) * 255; nd[j + 2] = (1 / l * 0.5 + 0.5) * 255; nd[j + 3] = 255;
      }
    }
    nctx.putImageData(ni, 0, 0); out.normal = canvasTex(nc, false);
  }
  if (R) {
    const rc = document.createElement('canvas'); rc.width = rc.height = N;
    const rctx = rc.getContext('2d'); const ri = rctx.createImageData(N, N); const rd = ri.data;
    for (let i = 0; i < N * N; i++) { const v = clamp(R[i], 0, 1) * 255; rd[i * 4] = rd[i * 4 + 1] = rd[i * 4 + 2] = v; rd[i * 4 + 3] = 255; }
    rctx.putImageData(ri, 0, 0); out.rough = canvasTex(rc, false);
  }
  return out;
}

// --- Patrones -------------------------------------------------------
const PX = {
  roble() { // tablas de roble 20 cm x 1,2 m en un tile de 2,4 m
    const g1 = FBM(2, 40, 3, 11), g2 = FBM(1, 160, 2, 12), fig = FBM(4, 8, 3, 13);
    return (u, v, o) => {
      const rows = 12, r = Math.floor(v * rows), fv = v * rows - r;
      const off = hash2(r, 1, 7); const pu = (u + off) * 2, pi = Math.floor(pu), fu = pu - pi, pk = ((pi % 2) + 2) % 2;
      const tone = hash2(r, pk, 9); const uu = u + off * 0.37, vv = v + tone * 0.13;
      const g = g1(uu, vv), s = g2(uu, vv), f = fig(uu, vv);
      let k = 0.8 + tone * 0.24 + (g - 0.5) * 0.34 + (f - 0.5) * 0.14; const line = smooth(0.6, 0.8, s); k -= line * 0.12;
      let R = 192 * k, G = 150 * k, B = 104 * k, h = 0.6 + (g - 0.5) * 0.2 - line * 0.12;
      if (fv < 0.011 || fv > 0.989 || fu < 0.003 || fu > 0.997) { R *= 0.45; G *= 0.42; B *= 0.4; h = 0; }
      o.r = R; o.g = G; o.b = B; o.h = h; o.ro = 0.48 + line * 0.15 - tone * 0.06;
    };
  },
  teca() { // listones de teca 14,5 cm + 5 mm de junta
    const g1 = FBM(2, 48, 3, 21), g2 = FBM(1, 200, 2, 22), fig = FBM(3, 12, 3, 23);
    return (u, v, o) => {
      const rows = 16, r = Math.floor(v * rows), fv = v * rows - r;
      const off = hash2(r, 3, 24); const pu = u + off, pi = Math.floor(pu), fu = pu - pi;
      const tone = hash2(r, 0, 25); const uu = u + off * 0.5, vv = v + tone * 0.2;
      const g = g1(uu, vv), s = g2(uu, vv), f = fig(uu, vv);
      let k = 0.78 + tone * 0.3 + (g - 0.5) * 0.4 + (f - 0.5) * 0.18; k -= smooth(0.6, 0.85, s) * 0.16;
      let R = 158 * k, G = 101 * k, B = 60 * k, h = 0.65 + (g - 0.5) * 0.25 - smooth(0.6, 0.85, s) * 0.15;
      if (fv < 0.034 || fu < 0.0025) { R = 34; G = 26; B = 20; h = 0; }
      o.r = R; o.g = G; o.b = B; o.h = h;
    };
  },
  nogal() { // enchape de nogal, veta vertical
    const g1 = FBM(36, 2, 3, 31), g2 = FBM(150, 1, 2, 32), fig = FBM(6, 3, 3, 33);
    return (u, v, o) => {
      const g = g1(u, v), s = g2(u, v), f = fig(u, v);
      let k = 0.86 + (g - 0.5) * 0.45 + (f - 0.5) * 0.25 - smooth(0.62, 0.85, s) * 0.18;
      o.r = 98 * k; o.g = 64 * k; o.b = 42 * k; o.h = 0.5 + (g - 0.5) * 0.3 - smooth(0.62, 0.85, s) * 0.2;
    };
  },
  marmol() { // porcelanato símil Calacatta 120x120 en tile de 2,4 m
    const w1 = FBM(3, 3, 5, 41), w2 = FBM(5, 5, 4, 42), cl = FBM(4, 4, 3, 43);
    return (u, v, o) => {
      const a = w1(u, v), b = w2(u, v), c = cl(u, v);
      const s1 = Math.abs(Math.sin((u + v * 2 + a * 2.4) * Math.PI * 2));
      const s2 = Math.abs(Math.sin((u * 2 - v + b * 1.8) * Math.PI * 2));
      const v1 = Math.pow(1 - s1, 26), v2 = Math.pow(1 - s2, 70) * 0.75, gold = Math.pow(1 - s1, 7) * (1 - v1) * 0.6;
      const cloud = (c - 0.5) * 12;
      let R = 239 + cloud - v1 * 95 - v2 * 55 - gold * 4, G = 237 + cloud - v1 * 93 - v2 * 58 - gold * 12, B = 233 + cloud - v1 * 86 - v2 * 66 - gold * 26;
      let h = 0.5; const gu = (u * 2) % 1, gv = (v * 2) % 1;
      if (gu < 0.0016 || gu > 0.9984 || gv < 0.0016 || gv > 0.9984) { R = G = B = 192; h = 0.25; }
      o.r = R; o.g = G; o.b = B; o.h = h;
    };
  },
  concreto() { // concreto de formaleta de tabla con pasadores
    const bl = FBM(5, 5, 5, 51), fine = FBM(64, 64, 2, 52), gr = FBM(3, 90, 2, 53);
    return (u, v, o) => {
      const rows = 16, r = Math.floor(v * rows), fv = v * rows - r; const bt = hash2(r, 0, 54) - 0.5;
      const b = bl(u, v) - 0.5, f = fine(u, v) - 0.5, g = gr(u + bt, v) - 0.5;
      let k = 164 + b * 40 + f * 16 + bt * 12 + g * 10, h = 0.5 + f * 0.18 + g * 0.12;
      if (fv < 0.03) { k -= 12; h -= 0.18; }
      const hx = ((u * 4) % 1) - 0.5, hy = ((v * 4) % 1) - 0.5; const dd = Math.hypot(hx, hy) * 0.6;
      if (dd < 0.022) { const t = dd < 0.013 ? 1 : (0.022 - dd) / 0.009; k -= 62 * t; h -= 0.7 * t; }
      const pu = (u * 2) % 1; if (pu < 0.002 || pu > 0.998) { k -= 18; h -= 0.25; }
      o.r = k; o.g = k * 0.985; o.b = k * 0.95; o.h = h;
    };
  },
  coralina() { // piedra coralina en sillares de 60x30
    const p1 = FBM(40, 40, 3, 61), p2 = FBM(14, 14, 3, 62), fos = FBM(8, 8, 4, 63), fn = FBM(96, 96, 1, 64);
    return (u, v, o) => {
      const rows = 8, r = Math.floor(v * rows), fv = v * rows - r; const cu = u * 4 + (r % 2) * 0.5; const c = Math.floor(cu), fu = cu - c;
      const bt = hash2(r, ((c % 4) + 4) % 4, 65) - 0.5; const a = p1(u, v), b = p2(u, v), f = fos(u, v), fi = fn(u, v);
      const pit = smooth(0.69, 0.75, a), bp = smooth(0.76, 0.82, b) * 0.7, pp = Math.max(pit, bp);
      let R = 216 + bt * 22 + (f - 0.5) * 26 + (fi - 0.5) * 12 - pp * 44;
      let G = 203 + bt * 19 + (f - 0.5) * 23 + (fi - 0.5) * 12 - pp * 44;
      let B = 176 + bt * 14 + (f - 0.5) * 20 + (fi - 0.5) * 12 - pp * 40;
      let h = 0.75 + (f - 0.5) * 0.15 - pit * 0.35 - bp * 0.45 + (fi - 0.5) * 0.05;
      if (fv < 0.02 || fv > 0.98 || fu < 0.008 || fu > 0.992) { R *= 0.78; G *= 0.77; B *= 0.74; h = 0.05; }
      o.r = R; o.g = G; o.b = B; o.h = h;
    };
  },
  travertino() {
    const ve = FBM(2, 22, 4, 71), cl = FBM(4, 4, 3, 72), pi = FBM(48, 24, 2, 73);
    return (u, v, o) => {
      const iu = Math.floor(u * 4), iv = Math.floor(v * 4), fu = u * 4 - iu, fv = v * 4 - iv; const t = hash2(iu, iv, 74) - 0.5;
      const a = ve(u + t * 0.4, v + t * 0.2), c = cl(u, v), p = smooth(0.72, 0.8, pi(u, v));
      const band = Math.abs(Math.sin((v * 6 + a * 3) * Math.PI * 2));
      let k = 1 + t * 0.06 + (c - 0.5) * 0.07 - Math.pow(1 - band, 10) * 0.08 - p * 0.1;
      let R = 226 * k, G = 208 * k, B = 178 * k, h = 0.7 - p * 0.5 + (a - 0.5) * 0.1;
      if (fu < 0.006 || fu > 0.994 || fv < 0.006 || fv > 0.994) { R *= 0.8; G *= 0.79; B *= 0.77; h = 0.1; }
      o.r = R; o.g = G; o.b = B; o.h = h;
    };
  },
  mosaico() { // teselas de 2,5 cm en tile de 1 m
    return (u, v, o) => {
      const n = 40, iu = Math.floor(u * n), iv = Math.floor(v * n), fu = u * n - iu, fv = v * n - iv;
      const t = hash2(iu, iv, 81), t2 = hash2(iu, iv, 82);
      let R = 26 + t * 26, G = 126 + t * 46 + t2 * 18, B = 146 + t * 40, h = 0.8;
      if (t2 > 0.93) { R = 214; G = 232; B = 230; }
      if (fu < 0.08 || fu > 0.92 || fv < 0.08 || fv > 0.92) { R = 206; G = 212; B = 210; h = 0.3; }
      o.r = R; o.g = G; o.b = B; o.h = h;
    };
  },
  grama() {
    const g1 = FBM(8, 8, 4, 91), g2 = FBM(48, 48, 3, 92), bl = FBM(256, 64, 1, 93);
    return (u, v, o) => {
      const a = g1(u, v), b = g2(u, v), c = bl(u, v); const dry = smooth(0.62, 0.8, a) * 0.5;
      o.r = 76 + (a - 0.5) * 34 + (c - 0.5) * 26 + dry * 46; o.g = 98 + (a - 0.5) * 38 + (b - 0.5) * 26 + (c - 0.5) * 34 + dry * 16; o.b = 52 + (a - 0.5) * 14 + dry * 10;
      o.h = c * 0.8 + b * 0.2;
    };
  },
  estuco() {
    const a1 = FBM(24, 24, 4, 101), a2 = FBM(128, 128, 1, 102);
    return (u, v, o) => { const a = a1(u, v), b = a2(u, v); const k = 242 + (a - 0.5) * 7 + (b - 0.5) * 5; o.r = k; o.g = k; o.b = k; o.h = a * 0.4 + b * 0.6; };
  },
  microcemento() {
    const cl = FBM(4, 4, 5, 111), tr = FBM(12, 3, 3, 112), fn = FBM(100, 100, 1, 113);
    return (u, v, o) => { const a = cl(u, v), b = tr(u, v), c = fn(u, v); const k = 1 + (a - 0.5) * 0.16 + (b - 0.5) * 0.06 + (c - 0.5) * 0.03; o.r = 194 * k; o.g = 188 * k; o.b = 178 * k; o.h = b * 0.5 + c * 0.5; };
  },
  tela() {
    const sl = FBM(64, 4, 2, 121), n = FBM(32, 32, 2, 122);
    return (u, v, o) => {
      const wu = Math.sin(u * Math.PI * 2 * 150), wv = Math.sin(v * Math.PI * 2 * 150); const s = sl(u, v), m = n(u, v);
      const k = 206 + wu * wv * 12 + (s - 0.5) * 22 + (m - 0.5) * 10; o.r = k; o.g = k; o.b = k; o.h = 0.5 + wu * wv * 0.4 + (s - 0.5) * 0.3;
    };
  },
  adoquin() { // losetas 60x60 con junta verde de 8 cm
    const n = FBM(16, 16, 3, 131), gr = FBM(64, 64, 2, 132);
    return (u, v, o) => {
      const cu = (u * 4) % 1, cv = (v * 4) % 1; const inP = cu > 0.059 && cu < 0.941 && cv > 0.059 && cv < 0.941;
      if (inP) { const t = hash2(Math.floor(u * 4), Math.floor(v * 4), 133) - 0.5; const k = 202 + (n(u, v) - 0.5) * 24 + t * 14; o.r = k; o.g = k * 0.99; o.b = k * 0.96; o.h = 0.8; }
      else { const g = gr(u, v); o.r = 70 + g * 30; o.g = 104 + g * 40; o.b = 42 + g * 10; o.h = 0.2 + g * 0.2; }
    };
  },
  asfalto() {
    const n = FBM(32, 32, 3, 141), s = FBM(200, 200, 1, 142);
    return (u, v, o) => { const a = n(u, v), b = s(u, v); let k = 62 + (a - 0.5) * 18 + (b > 0.7 ? 30 : 0); o.r = k; o.g = k; o.b = k * 1.03; o.h = b * 0.6 + a * 0.4; };
  },
  follaje() {
    const a1 = FBM(12, 12, 4, 151), a2 = FBM(64, 64, 2, 152);
    return (u, v, o) => { const a = a1(u, v), b = a2(u, v); const lit = smooth(0.35, 0.75, b); o.r = 34 + lit * 46 + (a - 0.5) * 20; o.g = 62 + lit * 66 + (a - 0.5) * 30; o.b = 26 + lit * 22; o.h = b; };
  },
  corteza() {
    const n = FBM(8, 24, 3, 161);
    return (u, v, o) => { const r = (v * 26) % 1; const ring = r < 0.18 ? 0.7 : 1; const a = n(u, v); const k = ring * (0.9 + (a - 0.5) * 0.3); o.r = 132 * k; o.g = 116 * k; o.b = 96 * k; o.h = ring * 0.6 + a * 0.4; };
  },
  tapete() {
    const a1 = FBM(80, 80, 2, 171), a2 = FBM(6, 6, 3, 172);
    return (u, v, o) => { const a = a1(u, v), b = a2(u, v); const k = 214 + (a - 0.5) * 30 + (b - 0.5) * 12; o.r = k; o.g = k * 0.97; o.b = k * 0.92; o.h = a; };
  },
};

// --- Texturas pintadas en canvas -----------------------------------
function drawCanvas(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; }
function texPanelSolar() {
  return canvasTex(drawCanvas(256, 512, (g, w, h) => {
    g.fillStyle = '#c9ccd1'; g.fillRect(0, 0, w, h);
    const cw = (w - 14) / 6, ch = (h - 14) / 12;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 12; j++) {
      const x = 7 + i * cw, y = 7 + j * ch; const gr = g.createLinearGradient(x, y, x + cw, y + ch);
      gr.addColorStop(0, '#16203a'); gr.addColorStop(1, '#0d1428'); g.fillStyle = gr; g.fillRect(x + 1, y + 1, cw - 2, ch - 2);
      g.fillStyle = 'rgba(190,200,215,.55)'; for (let k = 1; k < 4; k++) g.fillRect(x + (cw * k) / 4, y + 1, 0.8, ch - 2);
    }
  }), true);
}
function texLibros() {
  const t = canvasTex(drawCanvas(512, 512, (g, w, h) => {
    g.fillStyle = '#3b2a1e'; g.fillRect(0, 0, w, h);
    const r = mulberry32(7); const pal = ['#8c2f2a', '#1f3b57', '#d8cfbd', '#2f4d3a', '#c58b3a', '#efe9dc', '#5a5f66', '#7a3d5c', '#24242a', '#b9a37d'];
    for (let row = 0; row < 5; row++) {
      let x = 6; const y1 = (row + 1) * (h / 5) - 8;
      while (x < w - 10) {
        const bw = 8 + r() * 16, bh = 60 + r() * 34; if (r() < 0.08) { x += 30 + r() * 30; continue; }
        g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(x, y1 - bh, bw, bh);
        g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 2, y1 - bh + 8, bw - 4, 2); g.fillRect(x + 2, y1 - 14, bw - 4, 2);
        x += bw + 1;
      }
    }
  }), true);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
function texTV(kind) {
  const t = canvasTex(drawCanvas(512, 288, (g, w, h) => {
    if (kind === 0) { // atardecer en el Caribe
      let gr = g.createLinearGradient(0, 0, 0, h * 0.62); gr.addColorStop(0, '#2b2a5c'); gr.addColorStop(0.55, '#d0674a'); gr.addColorStop(1, '#f6c26b');
      g.fillStyle = gr; g.fillRect(0, 0, w, h * 0.62);
      gr = g.createLinearGradient(0, h * 0.62, 0, h); gr.addColorStop(0, '#2d4f74'); gr.addColorStop(1, '#0d1d33'); g.fillStyle = gr; g.fillRect(0, h * 0.62, w, h);
      g.fillStyle = '#ffe2a3'; g.beginPath(); g.arc(w * 0.62, h * 0.58, 26, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,214,150,.6)'; for (let i = 0; i < 14; i++) g.fillRect(w * 0.62 - 30 + Math.sin(i) * 10, h * 0.64 + i * 6, 60 - i * 3, 2);
      g.strokeStyle = '#120d14'; g.lineWidth = 5; g.beginPath(); g.moveTo(70, h); g.quadraticCurveTo(90, 160, 120, 80); g.stroke();
      g.fillStyle = '#120d14'; for (let k = 0; k < 7; k++) { g.save(); g.translate(120, 80); g.rotate(-2.6 + k * 0.75); g.beginPath(); g.ellipse(46, 0, 50, 7, 0.25, 0, Math.PI * 2); g.fill(); g.restore(); }
    } else if (kind === 1) { // selva y niebla
      let gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#cfe3dc'); gr.addColorStop(1, '#1d3a2c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const r = mulberry32(3);
      for (let L = 0; L < 4; L++) { g.fillStyle = ['#7ea594', '#4f7d68', '#2f5a45', '#183626'][L]; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 16) g.lineTo(x, h * (0.35 + L * 0.15) - r() * 30 - Math.sin(x / 50 + L) * 14); g.lineTo(w, h); g.fill(); }
    } else { // carnaval: formas abstractas
      g.fillStyle = '#141018'; g.fillRect(0, 0, w, h); const pal = ['#e63b2e', '#f5c518', '#1aa37a', '#2a62c9', '#f08bb6', '#ffffff'];
      const r = mulberry32(11);
      for (let i = 0; i < 26; i++) { g.fillStyle = pal[i % pal.length]; g.globalAlpha = 0.85; g.beginPath(); g.arc(r() * w, r() * h, 10 + r() * 50, 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = 1; g.fillStyle = '#fff'; g.font = '700 30px Archivo, Arial'; g.fillText('CARNAVAL', 24, h - 26);
    }
  }), true);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
function texArteObregon() {
  const t = canvasTex(drawCanvas(640, 480, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#c9a46a'); gr.addColorStop(0.55, '#5d7f8e'); gr.addColorStop(1, '#203247');
    g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = mulberry32(21);
    const pal = ['rgba(30,48,72,.75)', 'rgba(224,214,190,.8)', 'rgba(170,58,40,.7)', 'rgba(20,20,24,.8)', 'rgba(232,190,90,.75)', 'rgba(70,120,140,.7)'];
    for (let i = 0; i < 70; i++) {
      g.strokeStyle = pal[Math.floor(r() * pal.length)]; g.lineWidth = 4 + r() * 26; g.lineCap = 'round'; g.beginPath();
      const x = r() * w, y = r() * h; g.moveTo(x, y); g.bezierCurveTo(x + (r() - 0.5) * 300, y + (r() - 0.5) * 200, x + (r() - 0.5) * 300, y + (r() - 0.5) * 200, x + (r() - 0.5) * 260, y + (r() - 0.5) * 160); g.stroke();
    }
    g.fillStyle = 'rgba(245,240,228,.85)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 4, 0, Math.PI * 2); g.fill(); }
  }), true);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
function texArteRayo() {
  const t = canvasTex(drawCanvas(512, 512, (g, w, h) => {
    g.fillStyle = '#f2efe8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#111'; g.lineCap = 'square';
    for (let i = 0; i < 9; i++) { g.lineWidth = 16; const m = 40 + i * 24; g.strokeRect(m, m, w - 2 * m, h - 2 * m); }
    g.strokeStyle = '#f2efe8'; g.lineWidth = 10;
    for (let i = 0; i < 9; i++) { const m = 40 + i * 24; g.beginPath(); g.moveTo(m, w / 2 - 30 + i * 6); g.lineTo(m, w / 2 + 30 - i * 6); g.stroke(); }
  }), true);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
function texFronda() {
  const t = canvasTex(drawCanvas(128, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); const r = mulberry32(5);
    g.strokeStyle = '#5b6b2a'; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 0); g.stroke();
    for (let y = h - 30; y > 6; y -= 7) {
      const t2 = y / h; const len = (w / 2 - 4) * Math.sin(Math.PI * Math.min(1, (1 - t2) * 1.15 + 0.08));
      for (const s of [-1, 1]) {
        const gg = 90 + r() * 50 | 0; g.strokeStyle = `rgb(${40 + r() * 30 | 0},${gg},${30 + r() * 20 | 0})`; g.lineWidth = 3.2;
        g.beginPath(); g.moveTo(w / 2, y); g.quadraticCurveTo(w / 2 + s * len * 0.5, y - 10, w / 2 + s * len, y - 18 - r() * 6); g.stroke();
      }
    }
  }), true);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
function texOndas() { // mapa normal de ondas para el agua
  const N = 256, n1 = FBM(6, 6, 4, 201);
  const H = new Float32Array(N * N); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) H[y * N + x] = n1((x + 0.5) / N, (y + 0.5) / N);
  const c = document.createElement('canvas'); c.width = c.height = N; const ctx = c.getContext('2d'); const im = ctx.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = (H[y * N + (x + 1) % N] - H[y * N + (x - 1 + N) % N]) * 6, dy = (H[((y + 1) % N) * N + x] - H[((y - 1 + N) % N) * N + x]) * 6;
    const l = Math.hypot(dx, dy, 1), j = (y * N + x) * 4; im.data[j] = (-dx / l * 0.5 + 0.5) * 255; im.data[j + 1] = (dy / l * 0.5 + 0.5) * 255; im.data[j + 2] = (1 / l * 0.5 + 0.5) * 255; im.data[j + 3] = 255;
  }
  ctx.putImageData(im, 0, 0); return canvasTex(c, false);
}
function texCascada() {
  return canvasTex(drawCanvas(64, 256, (g, w, h) => {
    const r = mulberry32(9); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; g.fillRect(r() * w, r() * h, 1 + r() * 1.5, 10 + r() * 40); }
  }), true);
}
function texSombra() { // mancha de oclusión bajo muebles
  const t = canvasTex(drawCanvas(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }), false);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
