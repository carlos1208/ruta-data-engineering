
// =====================================================================
// 4 · Constructor: geometría fusionada por material, UV en metros
// =====================================================================
const GROUPS = {};          // grupo -> Map(material -> [geometrías])
let CUR_GROUP = 'base';
let XF = null;              // transformación activa (muebles rotados)
const setGroup = (g) => { CUR_GROUP = g; };

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _e1 = new THREE.Vector3(), _e2 = new THREE.Vector3();
function worldUV(g) {
  const p = g.attributes.position; let uv = g.attributes.uv;
  if (!uv) { uv = new THREE.BufferAttribute(new Float32Array(p.count * 2), 2); g.setAttribute('uv', uv); }
  for (let i = 0; i < p.count; i += 3) {
    _a.fromBufferAttribute(p, i); _b.fromBufferAttribute(p, i + 1); _c.fromBufferAttribute(p, i + 2);
    _e1.subVectors(_b, _a); _e2.subVectors(_c, _a); _e1.cross(_e2);
    const nx = Math.abs(_e1.x), ny = Math.abs(_e1.y), nz = Math.abs(_e1.z);
    for (let k = 0; k < 3; k++) {
      const x = p.getX(i + k), y = p.getY(i + k), z = p.getZ(i + k);
      if (ny >= nx && ny >= nz) uv.setXY(i + k, x, -z);
      else if (nx >= nz) uv.setXY(i + k, z, y);
      else uv.setXY(i + k, x, y);
    }
  }
}
function addGeo(geo, mat, keepUV = false) {
  if (geo.index) geo = geo.toNonIndexed();
  for (const k of Object.keys(geo.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') geo.deleteAttribute(k);
  if (!geo.attributes.normal) geo.computeVertexNormals();
  if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
  if (XF) geo.applyMatrix4(XF);
  if (!keepUV) worldUV(geo);
  let g = GROUPS[CUR_GROUP]; if (!g) g = GROUPS[CUR_GROUP] = new Map();
  if (!g.has(mat)) g.set(mat, []);
  g.get(mat).push(geo);
}
function box(x0, x1, y0, y1, z0, z1, mat) {
  if (x1 - x0 < 1e-4 || y1 - y0 < 1e-4 || z1 - z0 < 1e-4) return;
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); addGeo(g, mat);
}
const boxC = (cx, cy, cz, w, h, d, mat) => box(cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2, cz - d / 2, cz + d / 2, mat);
function rbox(cx, cy, cz, w, h, d, r, mat) { const g = new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3)); g.translate(cx, cy, cz); addGeo(g, mat); }
function cyl(cx, y0, cz, r, h, mat, seg = 18, rTop) { const g = new THREE.CylinderGeometry(rTop ?? r, r, h, seg); g.translate(cx, y0 + h / 2, cz); addGeo(g, mat); }
function sph(cx, cy, cz, r, mat, ws = 18, hs = 12) { const g = new THREE.SphereGeometry(r, ws, hs); g.translate(cx, cy, cz); addGeo(g, mat); }
function plane(cx, cy, cz, w, h, mat, rotY = 0, keepUV = true) { const g = new THREE.PlaneGeometry(w, h); g.rotateY(rotY); g.translate(cx, cy, cz); addGeo(g, mat, keepUV); }
function inPlace(x, y, z, rot, fn) {
  const prev = XF; const m = new THREE.Matrix4().makeRotationY(rot); m.setPosition(x, y, z);
  XF = prev ? prev.clone().multiply(m) : m; fn(); XF = prev;
}
function blob(cx, cz, w, d, y = 0.004) { // sombra de contacto (malla aparte, no fusionada en la sombra del sol)
  const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); g.translate(cx, y, cz); addGeo(g, MAT.sombra, true);
}

// =====================================================================
// 5 · Colisiones y superficies caminables
// =====================================================================
const COLS = [];    // {ax,az,bx,bz,y0,y1}
const SURF = [];    // planos y rampas
const PLAN = { 0: [], 1: [] }; // trazos para el plano (minimapa)
function seg(ax, az, bx, bz, y0, y1) { COLS.push({ ax, az, bx, bz, y0, y1 }); }
const _v = new THREE.Vector3();
function colRect(x0, x1, z0, z1, y0, y1) {
  const pts = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]].map(([x, z]) => { _v.set(x, 0, z); if (XF) _v.applyMatrix4(XF); return [_v.x, _v.z]; });
  const yo = XF ? XF.elements[13] : 0;
  for (let i = 0; i < 4; i++) { const a = pts[i], b = pts[(i + 1) % 4]; seg(a[0], a[1], b[0], b[1], y0 + yo, y1 + yo); }
}
function colCircle(cx, cz, r, y0, y1) { _v.set(cx, 0, cz); if (XF) _v.applyMatrix4(XF); const yo = XF ? XF.elements[13] : 0; colRectW(_v.x - r, _v.x + r, _v.z - r, _v.z + r, y0 + yo, y1 + yo); }
function colRectW(x0, x1, z0, z1, y0, y1) { seg(x0, z0, x1, z0, y0, y1); seg(x1, z0, x1, z1, y0, y1); seg(x1, z1, x0, z1, y0, y1); seg(x0, z1, x0, z0, y0, y1); }
const flat = (x0, x1, z0, z1, y) => SURF.push({ x0, x1, z0, z1, y });
const rampZ = (x0, x1, z0, z1, za, ya, zb, yb) => SURF.push({ x0, x1, z0, z1, ramp: true, za, ya, zb, yb });
function surfY(s, x, z) {
  if (x < s.x0 || x > s.x1 || z < s.z0 || z > s.z1) return null;
  if (!s.ramp) return s.y;
  const t = clamp((z - s.za) / (s.zb - s.za), 0, 1); return s.ya + (s.yb - s.ya) * t;
}
function support(x, z, feet, step = 0.5) {
  let best = -Infinity;
  for (const s of SURF) { const h = surfY(s, x, z); if (h !== null && h <= feet + step && h > best) best = h; }
  return best;
}
function planLine(level, kind, ax, az, bx, bz) {
  if (level === 'both') { PLAN[0].push({ kind, ax, az, bx, bz }); PLAN[1].push({ kind, ax, az, bx, bz }); }
  else PLAN[level].push({ kind, ax, az, bx, bz });
}
const levelOf = (y0, y1) => (y0 < 1 && y1 > 4.5) ? 'both' : (y0 >= 3 ? 1 : 0);

// =====================================================================
// 6 · Muros con vanos
// =====================================================================
// axis 'x': muro a lo largo de X en z = c (mA mira a -z, mB a +z)
// axis 'z': muro a lo largo de Z en x = c (mA mira a -x, mB a +x)
// vanos: {a0,a1,y0,y1,k:'win'|'door'|'open', mull}
function wallBox(axis, c, p0, p1, q0, q1, t, mA, mB) {
  if (axis === 'x') { if (mA === mB) box(p0, p1, q0, q1, c - t / 2, c + t / 2, mA); else { box(p0, p1, q0, q1, c - t / 2, c, mA); box(p0, p1, q0, q1, c, c + t / 2, mB); } }
  else { if (mA === mB) box(c - t / 2, c + t / 2, q0, q1, p0, p1, mA); else { box(c - t / 2, c, q0, q1, p0, p1, mA); box(c, c + t / 2, q0, q1, p0, p1, mB); } }
}
function wallSeg(axis, c, p0, p1, y0, y1) { if (axis === 'x') seg(p0, c, p1, c, y0, y1); else seg(c, p0, c, p1, y0, y1); }
function wall(axis, c, a0, a1, y0, y1, t, mA, mB, opens = [], o = {}) {
  const lv = levelOf(y0, y1);
  if (o.cap0) { wallBox(axis, c, a0, a0 + o.cap0, y0, y1, t, o.capMat || mA, o.capMat || mA); wallSeg(axis, c, a0, a0 + o.cap0, y0, y1); a0 += o.cap0; }
  if (o.cap1) { wallBox(axis, c, a1 - o.cap1, a1, y0, y1, t, o.capMat || mA, o.capMat || mA); wallSeg(axis, c, a1 - o.cap1, a1, y0, y1); a1 -= o.cap1; }
  const ops = opens.filter((p) => p.a1 > a0 && p.a0 < a1).sort((p, q) => p.a0 - q.a0);
  let cur = a0;
  const solid = (p0, p1) => { if (p1 - p0 < 1e-4) return; wallBox(axis, c, p0, p1, y0, y1, t, mA, mB); wallSeg(axis, c, p0, p1, y0, y1); plan(p0, p1, 'wall'); };
  const plan = (p0, p1, kind) => { if (axis === 'x') planLine(lv, kind, p0, c, p1, c); else planLine(lv, kind, c, p0, c, p1); };
  for (const op of ops) {
    const oa0 = Math.max(op.a0, a0), oa1 = Math.min(op.a1, a1);
    if (oa0 > cur) solid(cur, oa0);
    if (op.y0 > y0) { wallBox(axis, c, oa0, oa1, y0, op.y0, t, mA, mB); if (op.y0 - y0 > 0.3) wallSeg(axis, c, oa0, oa1, y0, op.y0); }
    if (op.y1 < y1) wallBox(axis, c, oa0, oa1, op.y1, y1, t, mA, mB);
    if (op.k === 'win') { glazing(axis, c, oa0, oa1, op.y0, op.y1, t, op.mull ?? 1.6); wallSeg(axis, c, oa0, oa1, op.y0, op.y1); plan(oa0, oa1, 'glass'); }
    else if (op.k === 'door') { lining(axis, c, oa0, oa1, op.y0, op.y1, t); plan(oa0, oa1, 'door'); }
    cur = Math.max(cur, oa1);
  }
  if (cur < a1) solid(cur, a1);
}
// ventana fija: marco perimetral + parteluces + vidrio
function glazing(axis, c, a0, a1, y0, y1, t, mull = 1.6, depth = 0.07) {
  const f = 0.05, d = Math.min(depth, t);
  const B = (p0, p1, q0, q1) => { if (axis === 'x') box(p0, p1, q0, q1, c - d / 2, c + d / 2, MAT.alNegro); else box(c - d / 2, c + d / 2, q0, q1, p0, p1, MAT.alNegro); };
  B(a0, a1, y0, y0 + f); B(a0, a1, y1 - f, y1); B(a0, a0 + f, y0, y1); B(a1 - f, a1, y0, y1);
  const n = Math.max(1, Math.round((a1 - a0) / mull));
  for (let i = 1; i < n; i++) { const m = a0 + (a1 - a0) * i / n; B(m - 0.025, m + 0.025, y0, y1); }
  glassPane(axis, c, a0 + f, a1 - f, y0 + f, y1 - f);
}
function glassPane(axis, c, a0, a1, y0, y1, mat = MAT.vidrio) {
  const w = a1 - a0, h = y1 - y0; if (w <= 0 || h <= 0) return;
  if (axis === 'x') plane((a0 + a1) / 2, (y0 + y1) / 2, c, w, h, mat, 0);
  else plane(c, (y0 + y1) / 2, (a0 + a1) / 2, w, h, mat, Math.PI / 2);
}
function lining(axis, c, a0, a1, y0, y1, t) { // forro de vano en roble
  const k = 0.02, d = t + 0.02;
  if (axis === 'x') { box(a0, a0 + k, y0, y1, c - d / 2, c + d / 2, MAT.robleMueble); box(a1 - k, a1, y0, y1, c - d / 2, c + d / 2, MAT.robleMueble); box(a0, a1, y1 - k, y1, c - d / 2, c + d / 2, MAT.robleMueble); }
  else { box(c - d / 2, c + d / 2, y0, y1, a0, a0 + k, MAT.robleMueble); box(c - d / 2, c + d / 2, y0, y1, a1 - k, a1, MAT.robleMueble); box(c - d / 2, c + d / 2, y1 - k, y1, a0, a1, MAT.robleMueble); }
}
function glassRail(axis, c, a0, a1, yb, h = 1.05) {
  glassPane(axis, c, a0, a1, yb + 0.02, yb + h, MAT.vidrioBaranda);
  if (axis === 'x') { box(a0, a1, yb, yb + 0.06, c - 0.04, c + 0.04, MAT.alNegro); box(a0, a1, yb + h - 0.02, yb + h + 0.02, c - 0.025, c + 0.025, MAT.inox); }
  else { box(c - 0.04, c + 0.04, yb, yb + 0.06, a0, a1, MAT.alNegro); box(c - 0.025, c + 0.025, yb + h - 0.02, yb + h + 0.02, a0, a1, MAT.inox); }
  wallSeg(axis, c, a0, a1, yb, yb + h);
  if (axis === 'x') planLine(yb > 2 ? 1 : 0, 'rail', a0, c, a1, c); else planLine(yb > 2 ? 1 : 0, 'rail', c, a0, c, a1);
}

// =====================================================================
// 7 · Puertas que se abren (E)
// =====================================================================
const DOORS = [];
const DOOR_ROOT = new THREE.Group(); scene.add(DOOR_ROOT);
function uvMeters(g) { const ng = g.index ? g.toNonIndexed() : g; worldUV(ng); return ng; }
function panelMesh(w, h, d, mat) { // caja con UV en metros (local)
  const g = uvMeters(new THREE.BoxGeometry(w, h, d)); const m = new THREE.Mesh(g, mat); m.castShadow = !mat.userData.noCast; m.receiveShadow = true; return m;
}
function glassPanelGroup(w, h) { // hoja corrediza: marco + vidrio
  const g = new THREE.Group(); const f = 0.055;
  const parts = [[w, f, 0.05, 0, f / 2], [w, f, 0.05, 0, h - f / 2], [f, h, 0.05, -w / 2 + f / 2, h / 2], [f, h, 0.05, w / 2 - f / 2, h / 2]];
  for (const [pw, ph, pd, px, py] of parts) { const m = panelMesh(pw, ph, pd, MAT.alNegro); m.position.set(px, py, 0); g.add(m); }
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(w - 2 * f, h - 2 * f), MAT.vidrio); gl.position.set(0, h / 2, 0); g.add(gl);
  return g;
}
// corrediza: vano [a0,a1] en el muro (axis, c). La mitad 'mov' se desliza sobre la mitad fija.
function slider(axis, c, a0, a1, y0, y1, o = {}) {
  const movEnd = o.movEnd !== false; const mid = (a0 + a1) / 2; const lv = y0 > 2 ? 1 : 0;
  const fix = movEnd ? [a0, mid] : [mid, a1], mov = movEnd ? [mid, a1] : [a0, mid];
  const out = o.out ?? 1; // hacia qué lado sale la hoja móvil
  // marco perimetral fijo
  const d = 0.12;
  const B = (p0, p1, q0, q1) => { if (axis === 'x') box(p0, p1, q0, q1, c - d / 2, c + d / 2, MAT.alNegro); else box(c - d / 2, c + d / 2, q0, q1, p0, p1, MAT.alNegro); };
  B(a0, a1, y0, y0 + 0.03); B(a0, a1, y1 - 0.06, y1); B(a0 - 0.04, a0, y0, y1); B(a1, a1 + 0.04, y0, y1);
  // hoja fija (fusionada)
  glazing(axis, c - (axis === 'x' ? 0 : 0) - out * 0.025, fix[0], fix[1], y0 + 0.03, y1 - 0.06, 0.05, 9);
  wallSeg(axis, c, fix[0], fix[1], y0, y1);
  // hoja móvil
  const w = mov[1] - mov[0], h = (y1 - 0.06) - (y0 + 0.03);
  const leaf = glassPanelGroup(w, h); const pivot = new THREE.Group(); pivot.add(leaf);
  const base = new THREE.Vector3();
  if (axis === 'x') { pivot.position.set((mov[0] + mov[1]) / 2, y0 + 0.03, c + out * 0.025); }
  else { pivot.position.set(c + out * 0.025, y0 + 0.03, (mov[0] + mov[1]) / 2); pivot.rotation.y = Math.PI / 2; }
  base.copy(pivot.position);
  DOOR_ROOT.add(pivot);
  const travel = (fix[0] + fix[1]) / 2 - (mov[0] + mov[1]) / 2; // hacia el centro de la fija
  const segClosed = axis === 'x' ? { ax: mov[0], az: c, bx: mov[1], bz: c, y0, y1 } : { ax: c, az: mov[0], bx: c, bz: mov[1], y0, y1 };
  const dr = {
    label: o.label || 'puerta corrediza', obj: pivot, t: o.open === false ? 0 : 1, target: o.open === false ? 0 : 1, speed: 1.4,
    center: axis === 'x' ? new THREE.Vector3((a0 + a1) / 2, y0 + 1.2, c) : new THREE.Vector3(c, y0 + 1.2, (a0 + a1) / 2),
    apply(t) { const e = t * t * (3 - 2 * t) * 0.96; if (axis === 'x') pivot.position.x = base.x + travel * e; else pivot.position.z = base.z + travel * e; },
    segs() { return this.t < 0.6 ? [segClosed] : []; },
  };
  dr.apply(dr.t); DOORS.push(dr);
  if (axis === 'x') { planLine(lv, 'glass', fix[0], c, fix[1], c); planLine(lv, 'door', mov[0], c, mov[1], c); }
  else { planLine(lv, 'glass', c, fix[0], c, fix[1]); planLine(lv, 'door', c, mov[0], c, mov[1]); }
  return dr;
}
