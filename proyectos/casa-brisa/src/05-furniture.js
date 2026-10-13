
// =====================================================================
// 9 · Mobiliario (frente local = +z; rot: S 0, N π, E π/2, O -π/2)
// =====================================================================
const RS = 0, RN = Math.PI, RE = Math.PI / 2, RW = -Math.PI / 2;

function sofa(x, y, z, rot, L = 3.0, mat = MAT.telaSofa, accents = true) {
  inPlace(x, y, z, rot, () => {
    box(-L / 2 + 0.08, L / 2 - 0.08, 0, 0.09, -0.4, 0.38, MAT.aceroNegro);
    rbox(0, 0.24, 0, L, 0.3, 0.95, 0.04, mat);
    rbox(0, 0.62, -0.38, L, 0.46, 0.2, 0.06, mat);
    rbox(-L / 2 + 0.1, 0.5, 0, 0.2, 0.26, 0.95, 0.06, mat); rbox(L / 2 - 0.1, 0.5, 0, 0.2, 0.26, 0.95, 0.06, mat);
    const n = Math.max(2, Math.round((L - 0.4) / 0.9)), w = (L - 0.4) / n;
    for (let i = 0; i < n; i++) { const cx = -L / 2 + 0.2 + w * (i + 0.5); rbox(cx, 0.46, 0.07, w - 0.02, 0.14, 0.76, 0.05, mat); rbox(cx, 0.7, -0.21, w - 0.03, 0.42, 0.17, 0.07, mat); }
    if (accents) { rbox(-L / 2 + 0.45, 0.66, -0.06, 0.42, 0.4, 0.13, 0.06, MAT.telaTeal); rbox(L / 2 - 0.45, 0.66, -0.06, 0.42, 0.4, 0.13, 0.06, MAT.telaOcre); }
    colRect(-L / 2, L / 2, -0.475, 0.475, 0, 0.85);
    blob(0, 0, L + 0.5, 1.4);
  });
}
function bed(x, y, z, rot, W = 1.6, L = 2.05, head = MAT.telaGris, hx = 0.35) {
  inPlace(x, y, z, rot, () => {
    box(-W / 2 - hx, W / 2 + hx, 0, 1.15, -L / 2 - 0.1, -L / 2, head);
    box(-W / 2 + 0.12, W / 2 - 0.12, 0, 0.1, -L / 2 + 0.1, L / 2 - 0.16, MAT.aceroNegro);
    box(-W / 2 + 0.14, W / 2 - 0.14, 0.02, 0.035, L / 2 - 0.17, L / 2 - 0.15, MAT.led);
    rbox(0, 0.2, 0, W + 0.06, 0.2, L, 0.03, MAT.telaGris);
    rbox(0, 0.42, 0, W, 0.24, L - 0.06, 0.06, MAT.telaCama);
    rbox(0, 0.565, 0.2, W + 0.06, 0.05, L * 0.66, 0.024, MAT.telaCama);
    rbox(0, 0.6, L / 2 - 0.32, W + 0.08, 0.05, 0.5, 0.024, MAT.telaGris);
    const np = W > 1.3 ? 2 : 1;
    for (let i = 0; i < np; i++) { const px = np === 1 ? 0 : (i ? 1 : -1) * W / 4; rbox(px, 0.63, -L / 2 + 0.3, Math.min(0.66, W / np - 0.06), 0.17, 0.42, 0.07, MAT.telaCama); }
    if (W > 1.3) rbox(0, 0.66, -L / 2 + 0.5, 0.5, 0.14, 0.3, 0.06, MAT.telaOcre);
    colRect(-W / 2 - 0.05, W / 2 + 0.05, -L / 2 - 0.1, L / 2, 0, 0.6);
    blob(0, 0, W + 0.8, L + 0.6);
  });
}
function nightstand(x, y, z, rot, lamp = true) {
  inPlace(x, y, z, rot, () => {
    box(-0.22, 0.22, 0.26, 0.52, -0.2, 0.2, MAT.nogal);
    if (lamp) { cyl(0, 0.52, -0.04, 0.06, 0.02, MAT.laton); cyl(0, 0.54, -0.04, 0.012, 0.28, MAT.laton); cyl(0, 0.78, -0.04, 0.13, 0.18, MAT.opal, 24, 0.11); }
    colRect(-0.22, 0.22, -0.2, 0.2, 0, 0.6);
  });
}
function tvWall(x, y, z, rot, w, h, idx) {
  inPlace(x, y, z, rot, () => {
    box(-w / 2, w / 2, -h / 2, h / 2, -0.03, 0, MAT.vidrioNegro);
    const g = new THREE.PlaneGeometry(w - 0.025, h - 0.025); g.translate(0, 0, 0.002); addGeo(g, MAT['tv' + idx], true);
  });
}
function chair(x, y, z, rot, seat = MAT.robleMueble, back = MAT.robleMueble) {
  inPlace(x, y, z, rot, () => {
    for (const [lx, lz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) box(lx - 0.012, lx + 0.012, 0, 0.44, lz - 0.012, lz + 0.012, MAT.aceroNegro);
    box(-0.21, 0.21, 0.08, 0.1, -0.21, 0.21, MAT.aceroNegro);
    rbox(0, 0.455, 0, 0.45, 0.04, 0.45, 0.012, seat);
    box(-0.012, 0.012, 0.44, 0.84, -0.2, -0.18, MAT.aceroNegro);
    rbox(0, 0.72, -0.2, 0.44, 0.24, 0.03, 0.01, back);
    colRect(-0.23, 0.23, -0.23, 0.23, 0, 0.9);
  });
}
function stool(x, y, z) {
  cyl(x, y, z, 0.2, 0.02, MAT.aceroNegro, 24); cyl(x, y + 0.02, z, 0.025, 0.6, MAT.aceroNegro);
  cyl(x, y + 0.6, z, 0.19, 0.05, MAT.cuero, 24); cyl(x, y + 0.25, z, 0.16, 0.012, MAT.laton, 24, 0.16);
  colRectW(x - 0.2, x + 0.2, z - 0.2, z + 0.2, y, y + 0.7);
}
function table(x, y, z, rot, L, W, top = MAT.robleMueble, h = 0.76) {
  inPlace(x, y, z, rot, () => {
    box(-L / 2, L / 2, h - 0.04, h, -W / 2, W / 2, top);
    for (const s of [-1, 1]) { box(s * (L / 2 - 0.3) - 0.03, s * (L / 2 - 0.3) + 0.03, 0, h - 0.04, -W / 2 + 0.1, W / 2 - 0.1, MAT.aceroNegro); }
    box(-L / 2 + 0.3, L / 2 - 0.3, h - 0.1, h - 0.04, -0.03, 0.03, MAT.aceroNegro);
    colRect(-L / 2, L / 2, -W / 2, W / 2, 0, h);
    blob(0, 0, L + 0.9, W + 1.1);
  });
}
function rug(x0, x1, z0, z1, y = 0) { box(x0, x1, y, y + 0.012, z0, z1, MAT.tapete); }
const jit = (x, y, z, seed) => hash2(Math.round(x * 997) * 7 + Math.round(z * 613), Math.round(y * 577), seed);
function smoothBlob(g, seed, sy = 0.9) { // desplaza y deja normales radiales (sin facetas)
  const p = g.attributes.position, n = g.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 0.84 + jit(x, y, z, seed) * 0.28, l = Math.hypot(x, y, z) || 1;
    p.setXYZ(i, x * k, y * k * sy, z * k); n.setXYZ(i, x / l, y / l, z / l);
  }
  return g;
}
function foliageBlob(cx, cy, cz, r, mat, seed = 1) {
  const g = smoothBlob(new THREE.IcosahedronGeometry(r, 2), seed); g.translate(cx, cy, cz); addGeo(g, mat);
}
function plant(x, y, z, h = 1.2, r = 0.28, mat = MAT.plantaInt, seed = 3) {
  cyl(x, y, z, r, 0.45, MAT.maceta, 20, r * 1.1); cyl(x, y + 0.42, z, r * 0.95, 0.03, MAT.tierra, 20);
  const rnd = mulberry32(seed), n = 11, W = 0.22 + 0.1 * h;
  for (let i = 0; i < n; i++) {
    const L = (h - 0.4) * (0.65 + rnd() * 0.5), tilt = 0.12 + rnd() * 0.6, droop = 0.15 + rnd() * 0.25;
    const g = new THREE.PlaneGeometry(W, L, 1, 8); g.translate(0, L / 2, 0); const q = g.attributes.position;
    for (let k = 0; k < q.count; k++) { const s = q.getY(k) / L, w = q.getX(k); q.setXYZ(k, w, s * L * Math.cos(tilt) - droop * s * s * L * 0.6 - Math.abs(w) * 0.25, s * L * Math.sin(tilt)); }
    g.computeVertexNormals(); g.rotateY(rnd() * Math.PI * 2); g.translate(x, y + 0.43, z); addGeo(g, MAT.hojas, true);
  }
  colRectW(x - r, x + r, z - r, z + r, y, y + h);
}
function downlight(x, y, z) { cyl(x, y - 0.012, z, 0.055, 0.012, MAT.led, 16); }
function lounger(x, y, z, rot) {
  inPlace(x, y, z, rot, () => {
    box(-0.34, 0.34, 0.18, 0.3, -1.0, 1.0, MAT.teca);
    for (const [lx, lz] of [[-0.3, -0.9], [0.3, -0.9], [-0.3, 0.9], [0.3, 0.9]]) box(lx - 0.03, lx + 0.03, 0, 0.18, lz - 0.03, lz + 0.03, MAT.teca);
    rbox(0, 0.35, 0.25, 0.64, 0.08, 1.45, 0.03, MAT.telaExt);
    const g = new RoundedBoxGeometry(0.64, 0.08, 0.7, 2, 0.03); g.rotateX(-0.75); g.translate(0, 0.55, -0.68); addGeo(g, MAT.telaExt);
    rbox(0, 0.72, -0.84, 0.4, 0.12, 0.22, 0.05, MAT.telaTeal);
    colRect(-0.34, 0.34, -1.0, 1.0, 0, 0.7);
    blob(0, 0, 1.1, 2.4);
  });
}
function washer(x, y, z, rot) {
  inPlace(x, y, z, rot, () => {
    box(-0.3, 0.3, 0, 0.85, -0.3, 0.3, MAT.porcelana);
    const g = new THREE.CylinderGeometry(0.2, 0.2, 0.03, 28); g.rotateX(Math.PI / 2); g.translate(0, 0.45, 0.31); addGeo(g, MAT.vidrioNegro);
    const r = new THREE.TorusGeometry(0.21, 0.02, 8, 28); r.translate(0, 0.45, 0.32); addGeo(r, MAT.cromo);
    box(-0.26, 0.26, 0.74, 0.8, 0.3, 0.31, MAT.vidrioNegro);
  });
}
function wc(x, y, z, rot) {
  inPlace(x, y, z, rot, () => {
    box(-0.25, 0.25, 0.0, 1.1, -0.12, 0, MAT.microcemento);
    rbox(0, 0.38, 0.22, 0.38, 0.32, 0.5, 0.12, MAT.porcelana);
    box(-0.09, 0.09, 0.95, 1.06, 0.0, 0.01, MAT.cromo);
    colRect(-0.22, 0.22, -0.12, 0.5, 0, 0.6);
  });
}
function basin(x, y, z) { // lavamanos de sobreponer
  const g = new THREE.CylinderGeometry(0.2, 0.17, 0.13, 32, 1, true); g.translate(x, y + 0.065, z); addGeo(g, MAT.porcelana);
  cyl(x, y, z, 0.17, 0.02, MAT.porcelana, 32); cyl(x, y + 0.02, z, 0.15, 0.005, MAT.vidrioNegro, 24);
}
function tub(x, y, z) { // bañera exenta ovalada
  const pts = [[0, 0], [0.34, 0], [0.39, 0.06], [0.42, 0.5], [0.42, 0.58], [0.4, 0.6], [0.36, 0.58], [0.34, 0.22], [0.25, 0.14], [0, 0.13]].map(([r, h]) => new THREE.Vector2(r, h));
  const g = new THREE.LatheGeometry(pts, 48); g.scale(2.0, 1, 0.95); g.translate(x, y, z); addGeo(g, MAT.banera);
  const w = new THREE.CylinderGeometry(0.33, 0.33, 0.01, 40); w.scale(2.0, 1, 0.95); w.translate(x, y + 0.42, z); addGeo(w, MAT.agua);
  colRectW(x - 0.84, x + 0.84, z - 0.4, z + 0.4, y, y + 0.6);
  blob(x, z, 2.2, 1.3, y + 0.004);
}
function car(x, z, rot, paint) {
  inPlace(x, 0, z, rot, () => {
    rbox(0, 0.66, 0, 1.88, 0.64, 4.62, 0.22, paint);
    rbox(0, 1.16, -0.2, 1.7, 0.5, 2.7, 0.22, MAT.vidrioCarro);
    rbox(0, 1.4, -0.28, 1.6, 0.08, 2.3, 0.04, paint);
    for (const [wx, wz] of [[-0.86, 1.45], [0.86, 1.45], [-0.86, -1.45], [0.86, -1.45]]) {
      const g = new THREE.CylinderGeometry(0.36, 0.36, 0.26, 28); g.rotateZ(Math.PI / 2); g.translate(wx, 0.36, wz); addGeo(g, MAT.llanta);
      const r = new THREE.CylinderGeometry(0.22, 0.22, 0.27, 20); r.rotateZ(Math.PI / 2); r.translate(wx, 0.36, wz); addGeo(r, MAT.inox);
    }
    box(-0.8, -0.35, 0.72, 0.8, 2.3, 2.32, MAT.opal); box(0.35, 0.8, 0.72, 0.8, 2.3, 2.32, MAT.opal);
    box(-0.8, 0.8, 0.8, 0.85, -2.32, -2.3, MAT.vidrioNegro);
    colRect(-0.95, 0.95, -2.32, 2.32, 0, 1.5);
    blob(0, 0, 2.6, 5.4);
  });
}

function buildFurniture() {
  const E = MAT;
  setGroup('base');
  // ------------------------------ SALA
  rug(4.1, 7.0, -0.1, 3.5);
  sofa(4.875, 0, 1.7, RE, 3.2);
  box(5.85, 6.75, 0, 0.36, 1.1, 1.85, E.travertino); box(6.05, 6.75, 0, 0.28, 1.85, 2.3, E.travertino); colRectW(5.85, 6.75, 1.1, 2.3, 0, 0.4);
  for (let z = -1.6; z <= 4.55; z += 0.08) box(7.24, 7.3, 0, 2.97, z - 0.02, z + 0.02, E.nogal);
  box(6.88, 7.24, 0.22, 0.52, -0.1, 3.5, E.nogal); colRectW(6.88, 7.3, -0.1, 3.5, 0, 0.55);
  tvWall(7.235, 1.38, 1.7, RW, 1.66, 0.95, 0);
  inPlace(6.7, 0, -0.9, RS, () => { rbox(0, 0.22, 0, 0.8, 0.22, 0.8, 0.05, E.cuero); rbox(0, 0.55, -0.32, 0.8, 0.5, 0.16, 0.06, E.cuero); rbox(-0.34, 0.42, 0.02, 0.12, 0.22, 0.72, 0.05, E.cuero); rbox(0.34, 0.42, 0.02, 0.12, 0.22, 0.72, 0.05, E.cuero); box(-0.3, 0.3, 0, 0.1, -0.3, 0.3, E.aceroNegro); colRect(-0.4, 0.4, -0.4, 0.4, 0, 0.8); blob(0, 0, 1.2, 1.2); });
  cyl(5.95, 0, -1.3, 0.16, 0.02, E.aceroNegro, 24); cyl(5.95, 0.02, -1.3, 0.012, 1.5, E.laton); cyl(5.95, 1.45, -1.3, 0.22, 0.26, E.opal, 28, 0.18); colRectW(5.8, 6.1, -1.45, -1.15, 0, 1.7);
  plant(7.0, 0, 4.2, 1.5, 0.3, E.plantaInt, 11);
  for (const x of [4.4, 5.6, 6.8]) for (const z of [-0.6, 1.2, 3.0]) downlight(x, 2.97, z);
  // ------------------------------ COMEDOR
  table(2.1, 0, 2.9, RS, 2.2, 1.0);
  for (const x of [1.45, 2.1, 2.75]) { chair(x, 0, 2.2, RS, E.robleMueble, E.cuero); chair(x, 0, 3.6, RN, E.robleMueble, E.cuero); }
  box(1.2, 3.0, 1.98, 2.03, 2.86, 2.94, E.aceroNegro); box(1.22, 2.98, 1.975, 1.98, 2.87, 2.93, E.led);
  box(1.3, 1.31, 2.03, 2.97, 2.895, 2.905, E.aceroNegro); box(2.89, 2.9, 2.03, 2.97, 2.895, 2.905, E.aceroNegro);
  // ------------------------------ COCINA
  box(-3.44, -2.24, 0, 2.4, 0.875, 1.5, E.nogal);
  box(-3.42, -2.86, 0.05, 2.35, 1.5, 1.515, E.inox);
  box(-2.8, -2.28, 0.9, 1.5, 1.5, 1.515, E.vidrioNegro); box(-2.8, -2.28, 1.55, 1.95, 1.5, 1.515, E.vidrioNegro);
  box(-2.24, -0.96, 0, 0.1, 0.875, 1.42, E.aceroNegro);
  box(-2.24, -0.96, 0.1, 0.87, 0.875, 1.5, E.nogal);
  box(-2.24, -0.96, 0.87, 0.91, 0.875, 1.52, E.encimera);
  box(-2.24, -0.96, 0.91, 1.55, 0.875, 0.89, E.encimera);
  box(-2.2, -1.0, 1.75, 1.79, 0.875, 1.15, E.nogal); box(-2.18, -1.02, 1.745, 1.75, 0.95, 1.12, E.led);
  box(-1.95, -1.35, 0.91, 0.915, 1.0, 1.42, E.vidrioNegro);
  box(-2.0, -1.3, 2.62, 2.98, 0.875, 1.38, E.inox);
  colRectW(-3.44, -0.96, 0.875, 1.52, 0, 2.4);
  // isla con caídas en cascada
  box(-2.94, -0.46, 0, 0.1, 2.5, 3.1, E.aceroNegro);
  box(-2.94, -0.46, 0.1, 0.9, 2.45, 3.15, E.nogal);
  box(-3.0, -0.4, 0.9, 0.96, 2.45, 3.45, E.encimera);
  box(-3.0, -2.94, 0, 0.9, 2.45, 3.45, E.encimera); box(-0.46, -0.4, 0, 0.9, 2.45, 3.45, E.encimera);
  box(-2.1, -1.4, 0.958, 0.962, 2.55, 3.0, E.vidrioNegro);
  cyl(-1.75, 0.96, 2.52, 0.016, 0.38, E.aceroNegro); box(-1.765, -1.735, 1.31, 1.34, 2.52, 2.76, E.aceroNegro);
  colRectW(-3.0, -0.4, 2.45, 3.45, 0, 0.96); blob(-1.7, 2.95, 3.4, 1.6);
  for (const x of [-2.5, -1.7, -0.9]) stool(x, 0, 3.72);
  for (const x of [-2.4, -1.7, -1.0]) { sph(x, 1.95, 2.95, 0.13, E.opal, 24, 16); box(x - 0.004, x + 0.004, 2.08, 2.97, 2.946, 2.954, E.aceroNegro); }
  for (const [x, z] of [[-2.8, 1.9], [-1.2, 1.9], [-0.4, 1.0], [0.6, 0.2], [0.6, -1.1], [2.2, -1.1], [2.2, 0.2]]) downlight(x, 2.98, z);
  // ------------------------------ OFICINA
  rug(3.9, 6.9, -4.5, -2.2);
  box(4.4, 6.4, 0.74, 0.78, -4.62, -3.87, E.robleMueble);
  for (const x of [4.45, 6.35]) { box(x - 0.025, x + 0.025, 0, 0.74, -4.58, -3.91, E.aceroNegro); }
  colRectW(4.4, 6.4, -4.62, -3.87, 0, 0.78); blob(5.4, -4.25, 2.6, 1.3);
  box(5.08, 5.72, 1.0, 1.38, -4.48, -4.46, E.pantalla); box(5.38, 5.42, 0.78, 1.0, -4.5, -4.44, E.aceroNegro);
  inPlace(5.4, 0, -3.35, RN, () => { cyl(0, 0, 0, 0.3, 0.03, E.aceroNegro, 5); cyl(0, 0.03, 0, 0.03, 0.42, E.aceroNegro); rbox(0, 0.48, 0, 0.5, 0.08, 0.48, 0.03, E.telaGris); rbox(0, 0.85, -0.24, 0.48, 0.6, 0.06, 0.03, E.telaGris); colRect(-0.3, 0.3, -0.3, 0.3, 0, 1.1); });
  box(6.95, 7.3, 0, 2.6, -4.7, -1.85, E.nogal);
  plane(6.948, 1.3, -3.275, 2.8, 2.5, E.libros, RW);
  colRectW(6.95, 7.3, -4.7, -1.85, 0, 2.6);
  plant(3.75, 0, -4.35, 1.4, 0.26, E.plantaInt, 21);
  for (const x of [4.3, 6.2]) for (const z of [-4.2, -2.6]) downlight(x, 2.98, z);
  // ------------------------------ VESTÍBULO DOBLE ALTURA
  {
    const r = mulberry32(31);
    for (let i = 0; i < 11; i++) { const x = 1.7 + (r() - 0.5) * 1.0, z = -3.3 + (r() - 0.5) * 1.0, y = 3.8 + r() * 1.4, s = 0.09 + r() * 0.08; sph(x, y, z, s, E.opal, 20, 14); box(x - 0.003, x + 0.003, y + s, CEIL1, z - 0.003, z + 0.003, E.laton); }
  }
  plant(0.85, 0, -4.45, 1.9, 0.32, E.plantaInt, 41);
  box(3.08, 3.1, 3.55, 5.45, -4.6, -2.2, E.aceroNegro); plane(3.075, 4.5, -3.4, 2.36, 1.86, E.arteObregon, RW);
  // ------------------------------ BAÑO SOCIAL
  wc(-1.43, 0, 0.71, RN);
  box(-1.9, -1.45, 0.78, 0.82, -1.55, -0.85, E.encimera); basin(-1.68, 0.82, -1.2);
  box(-1.895, -1.885, 1.1, 1.85, -1.5, -0.9, E.espejo); colRectW(-1.9, -1.45, -1.55, -0.85, 0, 0.9);
  downlight(-1.43, 2.98, -0.4);
  // ------------------------------ GARAJE
  car(-6.1, -2.45, RS, E.carroBlanco); car(-3.4, -2.45, RS, E.carroGrafito);
  box(-7.3, -7.22, 1.1, 1.5, -2.6, -2.3, E.porcelana);
  box(-7.3, -7.18, 1.15, 1.85, -0.65, -0.1, E.inversor); box(-7.3, -7.12, 0.2, 1.0, -0.65, -0.1, E.inversor); colRectW(-7.3, -7.1, -0.65, -0.1, 0, 1.9);
  box(-7.25, -5.4, 0, 2.2, 0.35, 0.725, E.alNegro); colRectW(-7.25, -5.4, 0.35, 0.725, 0, 2.2);
  for (const x of [-6.1, -3.4]) box(x - 0.6, x + 0.6, 2.95, 2.98, -2.43, -2.37, E.led);
  // ------------------------------ ÁREA DE SERVICIO
  washer(-6.9, 0, 1.19, RS); washer(-6.25, 0, 1.19, RS);
  box(-7.3, -4.75, 0.86, 0.9, 0.875, 1.52, E.encimera);
  box(-5.9, -4.75, 0.1, 0.86, 0.875, 1.5, E.nogal); box(-5.6, -5.0, 0.895, 0.9, 1.0, 1.4, E.inox);
  cyl(-5.3, 0.9, 0.95, 0.014, 0.32, E.cromo);
  box(-7.3, -4.75, 1.6, 2.4, 0.875, 1.25, E.nogal);
  colRectW(-7.3, -4.75, 0.875, 1.52, 0, 2.4);
  box(-7.3, -6.3, 0, 0.5, 3.6, 4.6, E.microcemento); box(-7.2, -6.4, 0.5, 0.505, 3.7, 4.5, E.vidrioNegro);
  cyl(-7.25, 1.2, 4.1, 0.02, 0.5, E.cromo); colRectW(-7.3, -6.3, 3.6, 4.6, 0, 0.6);
  box(-5.6, -3.6, 0, 2.2, 4.2, 4.6, E.nogal); colRectW(-5.6, -3.6, 4.2, 4.6, 0, 2.2);
  cyl(-6.9, 0, 3.1, 0.11, 0.07, E.inox, 20); cyl(-6.6, 0, 3.1, 0.11, 0.07, E.inox, 20);
  for (const [x, z] of [[-6.6, 2.4], [-4.5, 2.4]]) downlight(x, 2.98, z);

  // ------------------------------ PLANTA ALTA
  setGroup('upper');
  const Y = FL1;
  // Habitación 2
  rug(-6.4, -4.4, -4.5, -2.4, Y);
  bed(-6.175, Y, -3.45, RE, 1.6, 2.05, E.telaGris);
  nightstand(-6.975, Y, -4.525, RE); nightstand(-6.975, Y, -2.375, RE);
  box(-5.0, -3.45, Y, Y + 2.5, -2.36, -1.76, E.nogal); colRectW(-5.0, -3.45, -2.36, -1.76, Y, Y + 2.5);
  box(-4.23, -4.22, Y + 0.05, Y + 2.45, -2.37, -2.36, E.aceroNegro);
  tvWall(-2.115, Y + 1.25, -3.45, RW, 1.23, 0.71, 1);
  plant(-2.6, Y, -4.45, 1.1, 0.24, E.plantaInt, 51);
  for (const x of [-6.0, -3.6]) for (const z of [-4.0, -2.6]) downlight(x, CEIL1 - 0.02, z);
  // Habitación 3
  rug(4.6, 6.6, -4.5, -2.4, Y);
  bed(6.175, Y, -3.45, RW, 1.6, 2.05, E.telaGris);
  nightstand(6.975, Y, -4.525, RW); nightstand(6.975, Y, -2.375, RW);
  box(4.45, 5.25, Y, Y + 2.5, -2.36, -1.76, E.nogal); colRectW(4.45, 5.25, -2.36, -1.76, Y, Y + 2.5);
  tvWall(3.315, Y + 1.25, -3.45, RE, 1.23, 0.71, 2);
  for (const x of [4.4, 6.2]) for (const z of [-4.0, -2.6]) downlight(x, CEIL1 - 0.02, z);
  // Habitación principal
  rug(4.3, 7.0, -0.15, 2.65, Y);
  bed(6.15, Y, 1.25, RW, 1.9, 2.1, E.telaGris, 0.35);
  nightstand(6.975, Y, -0.02, RW, false); nightstand(6.975, Y, 2.52, RW, false);
  for (const z of [-0.02, 2.52]) { sph(6.95, Y + 1.25, z, 0.11, E.opal, 20, 14); box(6.947, 6.953, Y + 1.36, CEIL1, z - 0.003, z + 0.003, E.laton); }
  tvWall(3.275, Y + 1.2, 1.25, RE, 1.45, 0.83, 0);
  box(4.65, 5.0, Y + 0.38, Y + 0.45, 0.55, 1.95, E.cuero); box(4.66, 4.99, Y, Y + 0.38, 0.6, 0.64, E.aceroNegro); box(4.66, 4.99, Y, Y + 0.38, 1.86, 1.9, E.aceroNegro); colRectW(4.65, 5.0, 0.55, 1.95, Y, Y + 0.5);
  for (const x of [4.2, 5.8]) for (const z of [0.3, 2.2]) downlight(x, CEIL1 - 0.02, z);
  // Vestier
  box(1.26, 3.14, Y, Y + 2.6, -0.44, 0.16, E.nogal); colRectW(1.26, 3.14, -0.44, 0.16, Y, Y + 2.6);
  for (const x of [1.88, 2.51]) box(x - 0.004, x + 0.004, Y + 0.05, Y + 2.55, 0.16, 0.165, E.aceroNegro);
  box(1.35, 2.25, Y + 0.38, Y + 0.45, 2.38, 2.76, E.cuero); colRectW(1.35, 2.25, 2.38, 2.76, Y, Y + 0.5);
  box(2.9, 3.13, Y + 0.2, Y + 2.1, 1.1, 1.8, E.espejo);
  downlight(2.2, CEIL1 - 0.02, 1.0); downlight(2.2, CEIL1 - 0.02, 2.0);
  // Baño principal
  box(-1.7, 0.6, Y + 0.3, Y + 0.85, -0.44, 0.1, E.nogal); box(-1.72, 0.62, Y + 0.85, Y + 0.88, -0.44, 0.12, E.encimera);
  box(-1.68, 0.58, Y + 0.28, Y + 0.3, -0.42, 0.08, E.led);
  basin(-1.1, Y + 0.88, -0.17); basin(0.0, Y + 0.88, -0.17);
  for (const x of [-1.1, 0.0]) { box(x - 0.012, x + 0.012, Y + 1.06, Y + 1.09, -0.44, -0.27, E.aceroNegro); }
  box(-1.65, 0.55, Y + 1.15, Y + 2.05, -0.44, -0.432, E.espejo);
  colRectW(-1.72, 0.62, -0.44, 0.12, Y, Y + 0.9);
  tub(-0.3, Y, 2.15);
  cyl(0.72, Y, 2.15, 0.022, 0.95, E.aceroNegro); box(0.56, 0.72, Y + 0.93, Y + 0.96, 2.14, 2.16, E.aceroNegro);
  glassPane('z', -1.2, 0.5, 1.6, Y, Y + 2.05); box(-1.215, -1.185, Y + 2.05, Y + 2.08, 0.5, 1.6, E.aceroNegro); seg(-1.2, 0.5, -1.2, 1.6, Y, Y + 2.05);
  cyl(-1.75, Y + 2.3, 1.15, 0.15, 0.015, E.aceroNegro, 24); box(-2.24, -1.75, Y + 2.33, Y + 2.35, 1.14, 1.16, E.aceroNegro);
  box(-2.24, -1.2, Y, Y + 0.012, 0.5, 2.0, E.vidrioNegro);
  wc(-2.11, Y, 2.45, RE);
  plant(0.85, Y, 2.55, 0.9, 0.2, E.plantaInt, 61);
  box(0.95, 1.13, Y + 1.0, Y + 1.03, 1.3, 1.9, E.laton);
  downlight(-0.3, CEIL1 - 0.02, 2.15); downlight(-0.5, CEIL1 - 0.02, 0.6); downlight(-1.7, CEIL1 - 0.02, 1.2);
  // Baño compartido
  box(-4.24, -3.74, Y + 0.3, Y + 0.85, 0.3, 1.5, E.nogal); box(-4.24, -3.72, Y + 0.85, Y + 0.88, 0.28, 1.52, E.encimera);
  basin(-3.98, Y + 0.88, 0.9); box(-4.235, -4.228, Y + 1.15, Y + 2.0, 0.45, 1.35, E.espejo); colRectW(-4.24, -3.72, 0.28, 1.52, Y, Y + 0.9);
  glassPane('x', 2.0, -3.2, -2.36, Y, Y + 2.05); seg(-3.2, 2.0, -2.36, 2.0, Y, Y + 2.05);
  cyl(-2.93, Y + 2.3, 2.4, 0.14, 0.015, E.aceroNegro, 24);
  wc(-4.11, Y, 2.4, RE);
  downlight(-3.3, CEIL1 - 0.02, 0.9); downlight(-2.93, CEIL1 - 0.02, 2.4);
  // Habitación de servicio
  bed(-6.2, Y, 2.15, RE, 1.05, 2.0, E.telaGris, 0.1);
  nightstand(-7.05, Y, 1.38, RE, false);
  box(-4.95, -4.36, Y, Y + 2.3, -0.44, 0.75, E.nogal); colRectW(-4.95, -4.36, -0.44, 0.75, Y, Y + 2.3);
  tvWall(-4.375, Y + 1.2, 2.15, RW, 0.96, 0.56, 1);
  downlight(-5.4, CEIL1 - 0.02, 1.8);
  // Baño de servicio
  glassPane('x', 0.35, -7.3, -6.45, Y, Y + 2.0); seg(-7.3, 0.35, -6.45, 0.35, Y, Y + 2.0);
  cyl(-6.9, Y + 2.2, -0.05, 0.11, 0.015, E.aceroNegro, 20);
  wc(-7.18, Y, 0.75, RE);
  box(-6.65, -6.1, Y + 0.82, Y + 0.86, 0.85, 1.04, E.encimera); basin(-6.38, Y + 0.86, 0.95);
  downlight(-6.6, CEIL1 - 0.02, 0.4);
  // Pasillo y galería
  plane(0.0, Y + 1.55, -0.565, 1.3, 1.3, E.arteRayo, RN);
  plant(-6.85, Y, -1.1, 1.1, 0.22, E.plantaInt, 71);
  for (let x = -6.0; x <= 6.5; x += 1.6) downlight(x, CEIL1 - 0.02, -1.1);
  // Balcones
  for (const [x, z, r] of [[-6.4, -5.75, RN], [-5.5, -5.75, RN], [5.9, -5.75, RN], [6.7, -5.75, RN]]) chair(x, Y, z, r, E.teca, E.teca);
  cyl(-5.95, Y, -5.95, 0.22, 0.5, E.travertino, 24); cyl(6.3, Y, -5.95, 0.22, 0.5, E.travertino, 24);
  lounger(4.5, Y, 4.6, RS); lounger(5.9, Y, 4.6, RS); plant(7.0, Y, 3.4, 1.0, 0.25, E.plantaInt, 81);
  chair(-6.6, Y, 4.6, RS, E.teca, E.teca); chair(-5.6, Y, 4.6, RS, E.teca, E.teca); plant(-4.9, Y, 5.4, 0.9, 0.22, E.plantaInt, 91);
  // Luces exteriores empotradas en aleros
  setGroup('base');
  for (let x = -6.8; x <= 7.0; x += 1.7) downlight(x, CEIL0, 5.4);
  setGroup('roof');
  for (const x of [-6.0, -4.0, -0.5, 1.6, 3.2, 4.6, 6.4]) downlight(x, CEIL1, -5.8);
}
