
// =====================================================================
// 10 · Exterior: lote, piscina, jardines, mascotas, entorno
// =====================================================================
function quad(a, b, c, d, mat) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
  g.computeVertexNormals(); addGeo(g, mat);
}
function hplane(x0, x1, z0, z1, y, mat) { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2); addGeo(g, mat); }
function pond(x0, x1, z0, z1) {
  const E = MAT, k = 0.15;
  box(x0 - k, x1 + k, -0.3, 0.06, z0 - k, z0, E.acera); box(x0 - k, x1 + k, -0.3, 0.06, z1, z1 + k, E.acera);
  box(x0 - k, x0, -0.3, 0.06, z0, z1, E.acera); box(x1, x1 + k, -0.3, 0.06, z0, z1, E.acera);
  hplane(x0, x1, z0, z1, 0.02, E.espejoAgua);
  colRectW(x0 - k, x1 + k, z0 - k, z1 + k, -1, 0.5);
  planLine(0, 'water', x0, z0, x1, z0); planLine(0, 'water', x1, z0, x1, z1); planLine(0, 'water', x1, z1, x0, z1); planLine(0, 'water', x0, z1, x0, z0);
}
function fenceLine(x0, z0, x1, z1, h = 1.0) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 0.11);
  for (let i = 0; i <= n; i++) { const t = i / n, x = lerp(x0, x1, t), z = lerp(z0, z1, t); box(x - 0.02, x + 0.02, 0, h, z - 0.02, z + 0.02, MAT.tecaLamas); }
  const ax = Math.abs(x1 - x0) > Math.abs(z1 - z0);
  if (ax) box(Math.min(x0, x1), Math.max(x0, x1), h - 0.05, h, z0 - 0.035, z0 + 0.035, MAT.aceroNegro); else box(x0 - 0.035, x0 + 0.035, h - 0.05, h, Math.min(z0, z1), Math.max(z0, z1), MAT.aceroNegro);
  seg(x0, z0, x1, z1, 0, h); planLine(0, 'fence', x0, z0, x1, z1);
}
function shrubRow(x0, x1, z, y, seed) { const r = mulberry32(seed); for (let x = x0; x < x1; x += 0.5 + r() * 0.3) foliageBlob(x, y + 0.25, z + (r() - 0.5) * 0.4, 0.32 + r() * 0.15, MAT.seto, seed + Math.floor(x * 10)); }

function buildExterior() {
  const E = MAT;
  setGroup('base');
  // ---------------- calle y vecindario inmediato
  box(-160, 160, -0.5, -0.15, -21, -14, E.asfalto);
  box(-160, 160, -0.5, 0.0, -14, -12, E.acera);
  box(-160, 160, -0.5, 0.0, -23, -21, E.acera);
  for (let x = -150; x < 150; x += 6) box(x, x + 3, -0.15, -0.145, -17.56, -17.44, E.porcelana);
  box(-160, 160, -0.6, -0.05, -160, -23, E.grama);
  box(-160, -12.2, -0.6, -0.05, -12, 14.3, E.grama);
  box(12.2, 160, -0.6, -0.05, -12, 14.3, E.grama);
  // terreno bajo el borde infinito: muro de contención de 3 m, banca y talud natural hasta -6 m
  box(-160, 160, -6.8, -6.0, 21, 160, E.grama);
  box(-12.2, 12.2, -3.4, -3.0, 14.5, 16.0, E.grama);
  // vértices en sentido antihorario visto desde la cara que se ve, para que la normal apunte hacia afuera
  quad([-160, -6.0, 21], [160, -6.0, 21], [160, -3.0, 16], [-160, -3.0, 16], E.grama);
  quad([-160, -3.0, 16], [-12.2, -3.0, 16], [-12.2, -0.05, 14.3], [-160, -0.05, 14.3], E.grama);
  quad([12.2, -3.0, 16], [160, -3.0, 16], [160, -0.05, 14.3], [12.2, -0.05, 14.3], E.grama);
  quad([-12.2, -0.4, 14.5], [-12.2, -0.4, 14.5], [-12.2, -3.0, 16], [-12.2, -3.0, 14.5], E.coralina);
  quad([12.2, -3.0, 14.5], [12.2, -3.0, 16], [12.2, -0.4, 14.5], [12.2, -0.4, 14.5], E.coralina);
  // ---------------- lote
  box(-12.2, 12.2, -0.6, -0.05, -12, -5, E.grama);
  box(-12.2, -7.5, -0.6, -0.05, -5, 8.0, E.grama);
  box(7.5, 12.2, -0.6, -0.05, -5, 8.0, E.grama);
  box(-7.5, -2.0, -0.4, -0.02, -12, -5, E.adoquin);
  box(1.35, 2.85, -0.15, 0.04, -12, -5.0, E.acera); flat(1.35, 2.85, -12, -5.0, 0.04);
  box(1.33, 1.35, -0.08, -0.04, -11.9, -5.1, E.led); box(2.85, 2.87, -0.08, -0.04, -11.9, -5.1, E.led);
  pond(-1.6, 1.15, -11.0, -6.6); pond(3.05, 7.3, -11.0, -6.6);
  cyl(-0.75, -0.05, -9.4, 0.6, 0.42, E.coralina, 32); cyl(-0.75, 0.37, -9.4, 0.52, 0.03, E.tierra, 32); colRectW(-1.35, -0.15, -10.0, -8.8, -1, 0.5);
  // jardineras al pie de la fachada norte
  box(3.05, 7.3, -0.3, 0.22, -6.45, -5.05, E.coralina); box(3.15, 7.2, 0.22, 0.24, -6.35, -5.15, E.tierra); shrubRow(3.4, 7.1, -5.75, 0.24, 5);
  colRectW(3.05, 7.3, -6.45, -5.05, -1, 0.5);
  box(-1.9, 1.3, -0.3, 0.12, -6.45, -5.05, E.coralina); box(-1.85, 1.25, 0.12, 0.14, -6.4, -5.1, E.gravilla); shrubRow(-1.6, 1.0, -5.8, 0.14, 9);
  colRectW(-1.9, 1.3, -6.45, -5.05, -1, 0.5);
  // linderos: setos laterales y muro bajo al frente
  box(11.6, 12.2, -0.05, 1.8, -11.7, 14.3, E.seto); box(-12.2, -11.6, -0.05, 1.8, -11.7, 14.3, E.seto);
  seg(11.6, -12, 11.6, 14.3, -1, 3); seg(-11.6, -12, -11.6, 14.3, -1, 3);
  for (const [a, b] of [[-12.2, -7.8], [-1.7, 1.3], [2.9, 12.2]]) { box(a, b, -0.05, 0.45, -12.0, -11.7, E.coralina); seg(a, -11.85, b, -11.85, -1, 0.45); planLine(0, 'wall', a, -11.85, b, -11.85); }
  shrubRow(-11.4, -8.2, -11.35, -0.05, 13); shrubRow(3.2, 11.3, -11.35, -0.05, 17);
  seg(-160, -14, 160, -14, -1, 3);  // borde del andén
  // ---------------- terraza, piscina y borde infinito
  box(-3.5, 7.5, -0.4, 0, 4.8, 8.0, E.teca);
  box(-12.2, 12.2, -0.4, 0, 8.0, 9.35, E.travertino);
  box(-12.2, -6.15, -0.4, 0, 9.35, 14.3, E.travertino);
  box(9.15, 12.2, -0.4, 0, 9.35, 14.3, E.travertino);
  box(-6.15, 9.15, -0.05, 0, 9.35, 9.5, E.travertino); box(-6.15, -6.0, -0.05, 0, 9.5, 13.5, E.travertino); box(9.0, 9.15, -0.05, 0, 9.5, 13.5, E.travertino);
  box(-6.15, 9.15, -1.5, -0.05, 9.35, 9.5, E.mosaico); box(-6.15, -6.0, -1.5, -0.05, 9.5, 13.5, E.mosaico); box(9.0, 9.15, -1.5, -0.05, 9.5, 13.5, E.mosaico);
  box(-6.15, 9.15, -1.5, -0.075, 13.5, 13.65, E.mosaico);
  box(-6.0, 9.0, -1.6, -1.5, 9.5, 13.5, E.mosaico);
  box(-6.0, -5.4, -1.5, -0.32, 9.5, 11.2, E.mosaico); box(-5.4, -4.8, -1.5, -0.62, 9.5, 11.2, E.mosaico); box(-4.8, -4.2, -1.5, -0.92, 9.5, 11.2, E.mosaico);
  box(-6.0, 9.0, -1.5, -0.5, 13.0, 13.5, E.mosaico);   // banca sumergida mirando al horizonte
  hplane(-6.0, 9.0, 9.5, 13.68, -0.035, E.agua);
  { const g = new THREE.PlaneGeometry(15.3, 0.55); g.translate(1.5, -0.35, 13.665); addGeo(g, E.cascada, true); }
  box(-6.15, 9.15, -0.95, -0.85, 13.65, 14.3, E.mosaico);
  box(-6.15, 9.15, -0.95, -0.45, 14.15, 14.3, E.coralina);
  hplane(-6.15, 9.15, 13.65, 14.15, -0.62, E.agua);
  box(-12.2, 12.2, -3.2, -0.45, 14.3, 14.5, E.coralina);
  box(-12.2, -6.15, -0.45, 0, 14.3, 14.5, E.coralina); box(9.15, 12.2, -0.45, 0, 14.3, 14.5, E.coralina);
  glassRail('x', 14.42, -11.6, -6.15, 0); glassRail('x', 14.42, 9.15, 11.6, 0);
  colRectW(-6.15, 9.15, 9.35, 14.5, -3, 1.0);
  for (const x of [-4, -1, 2, 5, 8]) { const g = new THREE.CylinderGeometry(0.07, 0.07, 0.02, 20); g.rotateX(Math.PI / 2); g.translate(x, -0.6, 9.51); addGeo(g, E.led); }
  planLine(0, 'water', -6.0, 9.5, 9.0, 9.5); planLine(0, 'water', 9.0, 9.5, 9.0, 13.6); planLine(0, 'water', 9.0, 13.6, -6.0, 13.6); planLine(0, 'water', -6.0, 13.6, -6.0, 9.5);
  // pérgola de teca sobre el comedor exterior
  for (const x of [1.1, 7.35]) { box(x - 0.05, x + 0.05, 0, 3.0, 7.85, 7.95, E.aceroNegro); colRectW(x - 0.08, x + 0.08, 7.82, 7.98, 0, 3); }
  box(1.05, 7.4, 2.85, 3.0, 7.85, 7.95, E.aceroNegro);
  for (let x = 1.15; x <= 7.36; x += 0.22) box(x - 0.025, x + 0.025, 2.96, 3.12, 6.0, 8.0, E.tecaLamas);
  // muebles exteriores
  sofa(-1.8, 0, 6.95, RS, 2.8, E.telaExt);
  box(-2.3, -1.3, 0, 0.35, 7.65, 8.25, E.travertino); colRectW(-2.3, -1.3, 7.65, 8.25, 0, 0.4);
  table(4.8, 0, 7.05, RS, 2.2, 0.95, E.teca);
  for (const x of [4.15, 4.8, 5.45]) { chair(x, 0, 6.36, RS, E.teca, E.teca); chair(x, 0, 7.74, RN, E.teca, E.teca); }
  lounger(9.85, 0, 11.3, RS); lounger(11.0, 0, 11.3, RS); lounger(-8.0, 0, 11.3, RS); lounger(-9.2, 0, 11.3, RS);
  cyl(10.45, 0, 12.95, 0.2, 0.06, E.aceroNegro, 20); cyl(10.45, 0, 12.95, 0.025, 2.4, E.aceroNegro);
  { const g = new THREE.ConeGeometry(1.4, 0.45, 8, 1, true); g.translate(10.45, 2.35, 12.95); addGeo(g, E.telaExt); colRectW(10.3, 10.6, 12.8, 13.1, 0, 2.5); }
  plant(-11.0, 0, 9.6, 1.2, 0.35, E.follaje, 101); plant(9.9, 0, 8.6, 1.2, 0.35, E.follaje, 103);
  for (const x of [-11.2, -9.6, 9.6, 11.2]) { box(x - 0.06, x + 0.06, 0, 0.5, 8.2, 8.32, E.aceroNegro); box(x - 0.05, x + 0.05, 0.42, 0.48, 8.31, 8.33, E.led); }
  // ---------------- patio de mascotas
  box(-11.6, -7.5, -0.05, -0.04, 0.5, 4.85, E.grama);
  fenceLine(-11.6, 0.5, -7.5, 0.5); fenceLine(-11.6, 4.85, -9.7, 4.85); fenceLine(-8.7, 4.85, -7.5, 4.85);
  // patio privado de la habitación de servicio
  box(-9.6, -7.5, -0.3, 0, 5.0, 7.95, E.teca); fenceLine(-11.6, 8.0, -9.7, 8.0); fenceLine(-8.7, 8.0, -7.5, 8.0);
  chair(-8.3, 0, 6.9, RS, E.teca, E.teca); plant(-9.25, 0, 6.0, 1.0, 0.25, E.plantaInt, 97);
  // casa de mascota en dos niveles: madriguera abajo, mirador arriba, rampa y techo verde
  {
    const x0 = -11.3, x1 = -9.9, z0 = 1.0, z1 = 2.6;
    box(x0, x1, 0, 0.05, z0, z1, E.teca);
    box(x0, x0 + 0.04, 0, 0.8, z0, z1, E.teca); box(x0, x1, 0, 0.8, z0, z0 + 0.04, E.teca); box(x0, x1, 0, 0.8, z1 - 0.04, z1, E.teca);
    box(x1 - 0.04, x1, 0, 0.8, z0, 1.55, E.teca); box(x1 - 0.04, x1, 0, 0.8, 2.1, z1, E.teca); box(x1 - 0.04, x1, 0.6, 0.8, 1.55, 2.1, E.teca);
    box(x0, x1, 0.8, 0.85, z0, z1, E.teca);
    rbox(-10.6, 0.1, 1.8, 0.9, 0.1, 1.1, 0.04, E.cojinMascota);
    box(x0, -10.3, 0.85, 1.5, z0, z0 + 0.04, E.teca); box(x0, x0 + 0.04, 0.85, 1.5, z0, 2.0, E.teca); box(x0, -10.3, 0.85, 1.5, 1.96, 2.0, E.teca);
    box(-10.34, -10.3, 0.85, 1.5, z0, 1.25, E.teca); box(-10.34, -10.3, 1.38, 1.5, 1.25, 2.0, E.teca);
    box(-11.35, -10.25, 1.5, 1.55, 0.95, 2.05, E.teca); box(-11.33, -10.27, 1.55, 1.63, 0.97, 2.03, E.techoVerde);
    for (let z = 2.05; z < 2.6; z += 0.1) box(-9.92, -9.88, 0.85, 1.15, z - 0.015, z + 0.015, E.aceroNegro);
    box(-9.92, -9.88, 1.13, 1.17, 2.0, 2.6, E.aceroNegro);
    // rampa con listones
    const ang = Math.atan2(0.85, 1.7), len = Math.hypot(0.85, 1.7);
    inPlace(-10.65, 0, 2.6, 0, () => {
      const g = new THREE.BoxGeometry(0.42, 0.04, len); g.translate(0, 0, len / 2); g.rotateX(ang); g.translate(0, 0.83, 0); addGeo(g, E.teca);
      for (let i = 1; i < 8; i++) { const t = i / 8, cz = t * 1.7, cy = 0.85 - t * 0.85; box(-0.2, 0.2, cy, cy + 0.03, cz - 0.015, cz + 0.015, E.tecaLamas); }
    });
    cyl(-9.4, 0, 3.1, 0.12, 0.07, E.inox, 20); cyl(-9.1, 0, 3.1, 0.12, 0.07, E.inox, 20);
    colRectW(x0, x1, z0, z1, 0, 1.6); colRectW(-10.87, -10.43, 2.6, 4.3, 0, 0.9);
  }
}

// ---------------- palmas y árboles (instanciados)
const ni = (g) => (g.index ? g.toNonIndexed() : g);
function makePalm() {
  const H = 7.4;
  const trunk = new THREE.CylinderGeometry(0.15, 0.23, H, 10, 16, true); trunk.translate(0, H / 2, 0);
  const p = trunk.attributes.position; for (let i = 0; i < p.count; i++) { const t = p.getY(i) / H; p.setX(i, p.getX(i) + 0.7 * t * t); }
  trunk.computeVertexNormals();
  const tUV = trunk.attributes.uv; for (let i = 0; i < tUV.count; i++) tUV.setXY(i, tUV.getX(i) * 1.2, p.getY(i) / 1.0);
  const fronds = [];
  const r = mulberry32(77);
  for (let i = 0; i < 16; i++) {
    const L = 2.8 + r() * 0.8; const g = new THREE.PlaneGeometry(0.85, L, 1, 12); g.translate(0, L / 2, 0);
    const q = g.attributes.position;
    for (let k = 0; k < q.count; k++) {
      const x = q.getX(k), s = q.getY(k) / L; const w = x * Math.sin(Math.PI * Math.min(1, s * 1.1 + 0.08));
      const rise = i < 5 ? 0.75 : 0.42, droop = i < 5 ? 0.6 : 1.05;
      q.setXYZ(k, w, L * (rise * s - droop * s * s) - Math.abs(w) * 0.35, s * L);
    }
    g.computeVertexNormals();
    g.rotateY(i * 2.4 + r() * 0.3);
    g.translate(0.7, H, 0);
    fronds.push(g);
  }
  const fr = mergeGeometries(fronds.map(ni));
  const nuts = []; for (let i = 0; i < 5; i++) { const s = new THREE.SphereGeometry(0.12, 10, 8); s.translate(0.7 + Math.cos(i * 1.3) * 0.22, H - 0.25, Math.sin(i * 1.3) * 0.22); nuts.push(ni(s)); }
  const nut = mergeGeometries(nuts); worldUV(nut);
  return { trunk: ni(trunk), fronds: fr, nut };
}
function makeTree(seed) {
  const r = mulberry32(seed); const parts = [];
  const trunk = new THREE.CylinderGeometry(0.16, 0.26, 3.2, 8); trunk.translate(0, 1.6, 0);
  for (let i = 0; i < 7; i++) {
    const g = smoothBlob(new THREE.IcosahedronGeometry(1.2 + r() * 0.7, 2), seed + i, 0.75);
    const a = r() * 6.28, d = r() * 1.4; g.translate(Math.cos(a) * d, 3.6 + r() * 1.6, Math.sin(a) * d); parts.push(ni(g));
  }
  const crown = mergeGeometries(parts); worldUV(crown); const tr = ni(trunk); worldUV(tr);
  return { trunk: tr, crown };
}
function instanced(geo, mat, mats, cast = true) {
  const m = new THREE.InstancedMesh(geo, mat, mats.length); mats.forEach((x, i) => m.setMatrixAt(i, x));
  m.castShadow = cast; m.receiveShadow = true; m.instanceMatrix.needsUpdate = true; m.computeBoundingSphere(); scene.add(m); return m;
}
function buildVegetation() {
  const E = MAT, tmp = new THREE.Object3D();
  const M = (x, y, z, s, ry) => { tmp.position.set(x, y, z); tmp.rotation.set(0, ry, 0); tmp.scale.setScalar(s); tmp.updateMatrix(); return tmp.matrix.clone(); };
  // palmas del lote
  const palmPos = [[-10.4, -9.6, 1.0], [10.0, -9.8, 1.1], [10.5, -3.4, 0.9], [10.6, 4.4, 1.05], [-10.9, 8.7, 1.1], [10.9, 13.6, 0.95], [-11.0, 13.6, 1.0], [-10.6, -3.0, 0.85]];
  const palm = makePalm(); const pm = palmPos.map(([x, z, s], i) => M(x, -0.05, z, s, i * 1.7));
  instanced(palm.trunk, E.corteza, pm); const frm = instanced(palm.fronds, E.fronda, pm); instanced(palm.nut, E.corteza, pm);
  frm.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: E.fronda.map, alphaTest: 0.45 });
  for (const [x, z] of palmPos) colRectW(x - 0.25, x + 0.25, z - 0.25, z + 0.25, -1, 3);
  // árboles de sombra en el entorno
  const r = mulberry32(5150); const tm = [];
  const add = (x, z, y) => tm.push(M(x, y, z, 0.8 + r() * 0.9, r() * 6.28));
  for (let i = 0; i < 140; i++) {
    const zone = r();
    if (zone < 0.55) { const x = (r() - 0.5) * 260, z = 22 + r() * 135; add(x, z, -6.0); }
    else if (zone < 0.75) { const x = (r() - 0.5) * 300, z = -26 - r() * 130; add(x, z, -0.05); }
    else { const s = r() < 0.5 ? -1 : 1, x = s * (16 + r() * 120), z = -12 + r() * 26; add(x, z, -0.05); }
  }
  for (let x = -60; x <= 60; x += 11) tm.push(M(x + 3, 0, -22.2, 0.75, x));
  const tree = makeTree(9); instanced(tree.trunk, E.corteza, tm); instanced(tree.crown, E.follaje, tm);
  // guayacanes amarillos
  const gy = [M(-0.75, 0.37, -9.4, 0.72, 0.3), M(-10.6, -0.05, 4.4, 0.7, 1.2), M(9.6, -6.0, 22, 1.2, 2), M(-14, -6.0, 30, 1.1, 1)];
  const gt = makeTree(21); instanced(gt.trunk, E.corteza, gy); instanced(gt.crown, E.follajeAmarillo, gy);
  colRectW(-10.8, -10.4, 4.2, 4.6, -1, 3);
  // vecinos (volúmenes simples) y cerros lejanos
  setGroup('base');
  const houses = [[-34, -16, -40, -27, 6.4], [-9, 9, -42, -28, 6.6], [15, 33, -40, -27, 3.4], [17, 30, -9, 9, 6.2], [-30, -17, -8, 10, 3.3], [30, 46, 30, 44, 3.2, -6], [-48, -30, 34, 50, 6.2, -6], [-12, 4, 90, 104, 6.2, -6], [22, 40, 86, 102, 3.3, -6]];
  for (const [x0, x1, z0, z1, h, yb = 0] of houses) {
    box(x0, x1, yb, yb + h, z0, z1, E.casaVecina);
    box(x0 + 0.5, x1 - 0.5, yb + h, yb + h + 0.25, z0 + 0.5, z1 - 0.5, E.casaVecina);
    const fz = z1 < 0 ? z1 + 0.02 : z0 - 0.02;
    for (let y = yb + 1.0; y < yb + h - 1; y += 3.1) for (let x = x0 + 1.5; x < x1 - 2; x += 3.4) { const dz = z1 < 0 ? [fz - 0.04, fz] : [fz, fz + 0.04]; box(x, x + 1.8, y, y + 1.4, Math.min(...dz), Math.max(...dz), E.ventanaVecina); }
  }
  const N = 220, pos = [], idx = [], rr = mulberry32(42);
  for (let i = 0; i <= N; i++) {
    const a = i / N * Math.PI * 2, R = 1100; const h = 40 + 90 * Math.pow(Math.abs(Math.sin(a * 3.1 + 1.0) * Math.sin(a * 1.7)), 0.7) + rr() * 18;
    const x = Math.cos(a) * R, z = Math.sin(a) * R; pos.push(x, -5, z, x, h, z);
    if (i < N) { const b = i * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
  }
  const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setIndex(idx); hg.computeVertexNormals();
  const hills = new THREE.Mesh(hg, E.cerroLejano); hills.material.side = THREE.DoubleSide; scene.add(hills);
}
