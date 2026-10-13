
// =====================================================================
// 8 · La casa
// =====================================================================
// Ejes: x = oriente, z = sur, y = arriba. Fachada principal hacia -z (norte).
const CEIL0 = 3.0, FL1 = 3.3, CEIL1 = 6.1, ROOF = 6.4;
const RISE = 1.65 / 9, RUN = 0.28;

function buildHouse() {
  const E = MAT;
  // ------------------------------------------------------------ PLANTA BAJA
  setGroup('base');
  box(-7.5, 7.5, -0.45, -0.02, -5, 4.8, E.concreto);                 // placa
  box(-1.9, 7.3, -0.02, 0, -4.8, -1.7, E.marmol);                   // vestíbulo + oficina
  box(-0.84, 7.3, -0.02, 0, -1.7, 0.8, E.marmol);                   // hall + sala
  box(-3.44, 7.3, -0.02, 0, 0.8, 4.6, E.marmol);                    // cocina, comedor, sala
  box(-7.3, -2.1, -0.02, 0, -4.8, 0.725, E.concretoPulido);         // garaje
  box(-1.9, -0.96, -0.02, 0, -1.64, 0.725, E.microcemento);         // baño social
  box(-7.3, -3.56, -0.02, 0, 0.875, 4.6, E.microcemento);           // servicio
  box(-7.5, -3.5, -0.45, -0.02, 4.8, 8.0, E.concreto);              // placa de la ampliación de servicio
  box(-7.3, -3.7, -0.02, 0, 4.8, 7.8, E.microcemento);              // habitación y baño de servicio
  flat(-12, 12, -14, 14.3, 0);                                       // todo el lote y la casa a nivel 0

  // Fachada norte (garaje y oficina) — la doble altura va aparte
  wall('x', -4.9, -7.5, -1.9, 0, CEIL0, 0.2, E.coralina, E.estucoInt,
    [{ a0: -7.2, a1: -4.85, y0: 0, y1: 2.4, k: 'open' }, { a0: -4.65, a1: -2.3, y0: 0, y1: 2.4, k: 'open' }], { cap0: 0.2, cap1: 0.2 });
  wall('x', -4.9, 3.1, 7.5, 0, CEIL0, 0.2, E.coralina, E.estucoInt, [{ a0: 3.7, a1: 7.0, y0: 0.9, y1: 2.7, k: 'win', mull: 1.1 }], { cap0: 0.2, cap1: 0.2 });
  // Fachada sur
  wall('x', 4.7, -7.3, -3.44, 0, CEIL0, 0.2, E.estucoInt, E.estucoInt, [{ a0: -4.8, a1: -3.95, y0: 0, y1: 2.2, k: 'door' }]);
  glazing('x', 4.7, -3.44, -1.3, 0, CEIL0, 0.2, 9); seg(-3.44, 4.7, -1.3, 4.7, 0, CEIL0); planLine(0, 'glass', -3.44, 4.7, -1.3, 4.7);
  slider('x', 4.7, -1.3, 3.1, 0, CEIL0, { movEnd: true, out: 1, label: 'ventanal del comedor' });
  slider('x', 4.7, 3.1, 7.3, 0, CEIL0, { movEnd: false, out: 1, label: 'ventanal de la sala' });
  // Fachadas oeste y este
  wall('z', -7.4, -5, 8.0, 0, CEIL0, 0.2, E.coralina, E.estucoInt,
    [{ a0: -3.6, a1: -1.0, y0: 1.9, y1: 2.6, k: 'win' }, { a0: 1.7, a1: 3.5, y0: 0, y1: 2.4, k: 'open' },
     { a0: 4.9, a1: 5.75, y0: 0, y1: 2.3, k: 'door' }, { a0: 6.2, a1: 7.55, y0: 0.9, y1: 2.4, k: 'win' }], { cap0: 0.2, cap1: 0.2 });
  // Ampliación de servicio: habitación con baño propio y patio privado (planta baja)
  wall('x', 7.9, -7.3, -3.7, 0, CEIL0, 0.2, E.estucoInt, E.coralina, [{ a0: -7.0, a1: -5.4, y0: 1.9, y1: 2.6, k: 'win' }, { a0: -4.6, a1: -3.95, y0: 1.9, y1: 2.5, k: 'win' }]);
  wall('z', -3.6, 4.8, 5.93, 0, CEIL0, 0.2, E.estucoInt, E.coralina);
  wall('z', -3.6, 5.93, 8.0, 0, CEIL0, 0.2, E.microcemento, E.coralina, [], { cap1: 0.2, capMat: E.coralina });
  wall('z', -5.1, 4.8, 5.93, 0, CEIL0, 0.12, E.estucoInt, E.estucoInt, [{ a0: 4.95, a1: 5.8, y0: 0, y1: 2.2, k: 'door' }]);
  wall('z', -5.1, 5.93, 7.8, 0, CEIL0, 0.12, E.estucoInt, E.microcemento);
  wall('x', 5.93, -5.04, -3.7, 0, CEIL0, 0.12, E.estucoInt, E.microcemento, [{ a0: -4.65, a1: -3.85, y0: 0, y1: 2.2, k: 'door' }]);
  slider('z', -7.4, 1.7, 3.5, 0, 2.4, { movEnd: true, out: -1, label: 'puerta al patio de mascotas' });
  wall('z', 7.4, -5, 4.8, 0, CEIL0, 0.2, E.estucoInt, E.coralina, [{ a0: -4.4, a1: -2.2, y0: 0.9, y1: 2.7, k: 'win' }], { cap0: 0.2, cap1: 0.2, capMat: E.coralina });

  // Muros interiores PB
  wall('z', -2.0, -4.8, -1.7, 0, CEIL0, 0.2, E.estucoInt, E.estucoInt);
  wall('z', -2.0, -1.7, 0.725, 0, CEIL0, 0.2, E.estucoInt, E.microcemento);
  wall('z', 3.2, -4.8, -1.7, 0, CEIL0, 0.2, E.estucoInt, E.estucoInt, [{ a0: -3.0, a1: -2.1, y0: 0, y1: 2.3, k: 'door' }]);
  wall('x', -1.7, 3.3, 7.3, 0, CEIL0, 0.12, E.estucoInt, E.estucoInt);
  wall('x', -1.7, -1.9, -0.84, 0, CEIL0, 0.12, E.estucoInt, E.microcemento);
  wall('z', -0.9, -1.76, 0.725, 0, CEIL0, 0.12, E.microcemento, E.estucoInt, [{ a0: -0.6, a1: 0.2, y0: 0, y1: 2.2, k: 'door' }]);
  wall('x', 0.8, -7.3, -2.1, 0, CEIL0, 0.15, E.estucoInt, E.estucoInt, [{ a0: -4.6, a1: -3.7, y0: 0, y1: 2.2, k: 'door' }]);
  wall('x', 0.8, -1.9, -0.84, 0, CEIL0, 0.15, E.microcemento, E.estucoInt);
  wall('z', -3.5, 0.875, 4.6, 0, CEIL0, 0.12, E.estucoInt, E.estucoInt, [{ a0: 1.6, a1: 2.5, y0: 0, y1: 2.2, k: 'door' }]);

  // Muro de doble altura (cara del vacío) — parte alta
  setGroup('upper');
  wall('z', -2.0, -4.8, -1.7, CEIL0, CEIL1, 0.2, E.estucoInt, E.estucoInt);
  wall('z', 3.2, -4.8, -1.7, CEIL0, CEIL1, 0.2, E.estucoInt, E.estucoInt);

  // Cielos rasos de PB (desaparecen en el corte "planta baja")
  box(-7.3, -2.1, 2.98, CEIL0, -4.8, 0.725, E.estucoInt);
  box(3.3, 7.3, 2.98, CEIL0, -4.8, -1.76, E.estucoInt);
  box(-1.9, -0.96, 2.98, CEIL0, -1.64, 0.725, E.estucoInt);
  box(-7.3, -3.56, 2.98, CEIL0, 0.875, 4.6, E.estucoInt);
  box(-3.44, 0.0, 2.98, CEIL0, 0.875, 4.6, E.estucoInt);
  box(-0.84, 0.0, 2.98, CEIL0, -1.7, 0.875, E.estucoInt);
  box(0.0, 7.3, 2.97, CEIL0, -1.7, 4.6, E.techoMadera);
  box(-7.3, -3.7, 2.98, CEIL0, 4.8, 7.8, E.estucoInt);
  // Losa entre pisos (el canto queda a la vista como franja de concreto)
  box(-7.5, 7.5, CEIL0, FL1 - 0.02, -1.7, 6.0, E.concreto);
  box(-7.5, -3.5, CEIL0, FL1 - 0.02, 6.0, 8.0, E.concreto);
  box(-7.5, -2.0, CEIL0, FL1 - 0.02, -5, -1.7, E.concreto);
  box(3.2, 7.5, CEIL0, FL1 - 0.02, -5, -1.7, E.concreto);
  box(-7.3, -2.2, CEIL0 + 0.06, FL1 - 0.02, -6.4, -5, E.concreto);
  box(3.4, 7.3, CEIL0 + 0.06, FL1 - 0.02, -6.4, -5, E.concreto);

  // ------------------------------------------------------------ PLANTA ALTA
  const F = FL1 - 0.02;
  // pisos
  box(-7.3, -2.1, F, FL1, -4.8, -1.7, E.roble);
  box(3.3, 7.3, F, FL1, -4.8, -1.7, E.roble);
  box(-7.3, 7.3, F, FL1, -1.7, -0.5, E.roble);
  box(1.2, 7.3, F, FL1, -0.5, 2.8, E.roble);
  box(-4.3, 1.2, F, FL1, -0.5, 2.8, E.microcemento);
  // balcones y cubierta verde
  box(-7.3, -2.2, F, FL1, -6.4, -5.0, E.teca);
  box(3.4, 7.3, F, FL1, -6.4, -5.0, E.teca);
  box(3.3, 7.45, F, FL1, 3.0, 6.0, E.teca);
  box(-7.45, -4.36, F, FL1, -0.44, 7.95, E.teca);                    // terraza familiar
  box(-4.36, 3.3, F, FL1 + 0.1, 3.0, 5.85, E.techoVerde);
  box(-4.36, 3.3, F, FL1 + 0.22, 5.85, 6.0, E.concreto);
  box(-4.36, -3.65, F, FL1 + 0.1, 6.0, 7.85, E.techoVerde);
  box(-4.36, -3.5, F, FL1 + 0.22, 7.85, 8.0, E.concreto); box(-3.65, -3.5, F, FL1 + 0.22, 6.0, 7.85, E.concreto);
  flat(-7.3, -1.9, -4.85, -1.7, FL1); flat(3.1, 7.3, -4.85, -1.7, FL1); flat(-7.3, 7.3, -1.76, -0.44, FL1); flat(-4.3, 7.3, -0.5, 2.85, FL1);
  flat(-7.3, -2.2, -6.35, -4.8, FL1); flat(3.4, 7.3, -6.35, -4.8, FL1); flat(3.3, 7.45, 2.8, 5.95, FL1); flat(-7.45, -4.36, -0.56, 7.95, FL1);

  // Fachada norte PA: ventanales corredizos a los balcones
  slider('x', -4.9, -7.3, -2.1, FL1, CEIL1, { movEnd: true, out: -1, label: 'ventanal al balcón' });
  slider('x', -4.9, 3.3, 7.3, FL1, CEIL1, { movEnd: false, out: -1, label: 'ventanal al balcón' });
  // Fachada sur PA
  wall('x', 2.9, -4.24, -2.3, FL1, CEIL1, 0.2, E.microcemento, E.estucoExt, [{ a0: -4.0, a1: -2.6, y0: 4.7, y1: 5.9, k: 'win' }]);
  wall('x', 2.9, -2.3, 1.2, FL1, CEIL1, 0.2, E.microcemento, E.estucoExt, [{ a0: -1.9, a1: 0.9, y0: 3.75, y1: 5.9, k: 'win', mull: 1.4 }]);
  wall('x', 2.9, 1.2, 3.26, FL1, CEIL1, 0.2, E.estucoInt, E.estucoExt, [{ a0: 1.5, a1: 2.9, y0: 5.0, y1: 5.9, k: 'win' }]);
  slider('x', 2.9, 3.26, 7.3, FL1, CEIL1, { movEnd: false, out: 1, label: 'ventanal al balcón' });
  // Fachadas oeste y este PA
  wall('z', -7.4, -5, -0.5, FL1 - 0.02, CEIL1, 0.2, E.estucoExt, E.estucoInt, [{ a0: -1.6, a1: -0.75, y0: FL1, y1: CEIL1 - 0.05, k: 'win' }], { cap0: 0.2, cap1: 0.2, capMat: E.estucoExt });
  wall('z', 7.4, -5, 3.0, FL1 - 0.02, CEIL1, 0.2, E.estucoInt, E.estucoExt, [{ a0: -1.6, a1: -0.6, y0: FL1, y1: CEIL1 - 0.05, k: 'win' }], { cap0: 0.2, cap1: 0.2, capMat: E.estucoExt });
  // Interiores PA
  wall('x', -1.7, -7.3, -2.1, FL1, CEIL1, 0.12, E.estucoInt, E.estucoInt, [{ a0: -3.3, a1: -2.4, y0: FL1, y1: FL1 + 2.2, k: 'door' }]);
  wall('x', -1.7, 3.3, 7.3, FL1, CEIL1, 0.12, E.estucoInt, E.estucoInt, [{ a0: 3.4, a1: 4.3, y0: FL1, y1: FL1 + 2.2, k: 'door' }]);
  glassRail('x', -1.7, -0.8, 3.1, FL1);
  const D = (a0, a1) => ({ a0, a1, y0: FL1, y1: FL1 + 2.2, k: 'door' });
  slider('x', -0.5, -7.3, -4.36, FL1, CEIL1, { movEnd: true, out: 1, label: 'ventanal a la terraza' });
  wall('x', -0.5, -4.3, -2.3, FL1, CEIL1, 0.12, E.estucoInt, E.microcemento, [D(-3.9, -3.1)]);
  wall('x', -0.5, -2.3, 1.2, FL1, CEIL1, 0.12, E.estucoInt, E.microcemento);
  wall('x', -0.5, 1.2, 3.2, FL1, CEIL1, 0.12, E.estucoInt, E.estucoInt);
  wall('x', -0.5, 3.2, 7.3, FL1, CEIL1, 0.12, E.estucoInt, E.estucoInt, [D(3.4, 4.3)]);
  wall('z', -4.3, -0.44, 3.0, FL1, CEIL1, 0.12, E.estucoExt, E.microcemento, [], { cap1: 0.2, capMat: E.estucoExt });
  wall('z', -2.3, -0.44, 2.8, FL1, CEIL1, 0.12, E.microcemento, E.microcemento);
  wall('z', 1.2, -0.44, 2.8, FL1, CEIL1, 0.12, E.microcemento, E.estucoInt, [D(0.3, 1.1)]);
  wall('z', 3.2, -0.44, 2.8, FL1, CEIL1, 0.12, E.estucoInt, E.estucoInt, [D(2.0, 2.75)]);
  // barandas de balcones
  glassRail('x', -6.35, -7.3, -2.2, FL1); glassRail('z', -2.2, -6.35, -5.0, FL1);
  glassRail('x', -6.35, 3.4, 7.3, FL1); glassRail('z', 3.4, -6.35, -5.0, FL1);
  glassRail('x', 5.95, 3.3, 7.45, FL1); glassRail('z', 7.45, 3.0, 5.95, FL1); glassRail('z', 3.3, 3.0, 5.95, FL1);
  glassRail('z', -7.45, -0.5, 7.95, FL1); glassRail('x', 7.95, -7.45, -4.36, FL1); glassRail('z', -4.36, 3.0, 7.95, FL1);
  // pórtico norte: aletas laterales que enmarcan los balcones
  box(-7.5, -7.3, CEIL0, CEIL1, -6.6, -5.0, E.estucoExt); seg(-7.3, -6.6, -7.3, -5.0, FL1, CEIL1);
  box(7.3, 7.5, CEIL0, CEIL1, -6.6, -5.0, E.estucoExt); seg(7.3, -6.6, 7.3, -5.0, FL1, CEIL1);
  // celosías de teca en oriente y occidente (pasillo)
  for (let z = -2.0; z <= -0.75; z += 0.12) { box(-7.66, -7.54, FL1 - 0.1, CEIL1 + 0.05, z - 0.02, z + 0.02, E.tecaLamas); box(7.54, 7.66, FL1 - 0.1, CEIL1 + 0.05, z - 0.02, z + 0.02, E.tecaLamas); }
  box(-7.7, -7.5, CEIL1 + 0.05, CEIL1 + 0.12, -2.1, -0.65, E.aceroNegro); box(7.5, 7.7, CEIL1 + 0.05, CEIL1 + 0.12, -2.1, 0.0, E.aceroNegro);

  // ------------------------------------------------------------ CUBIERTA
  setGroup('roof');
  box(-7.3, 7.3, CEIL1 - 0.02, CEIL1, -4.8, -0.56, E.estucoInt);       // cielo raso PA (incluye vacío)
  box(-4.24, 7.3, CEIL1 - 0.02, CEIL1, -0.56, 2.8, E.estucoInt);
  box(-7.5, -4.3, CEIL1, ROOF, -6.6, 0.1, E.estucoExt);               // losa de cubierta con aleros (en L)
  box(-4.3, 7.5, CEIL1, ROOF, -6.6, 4.2, E.estucoExt);
  box(-7.35, -4.3, ROOF, ROOF + 0.02, -6.45, -0.05, E.gravilla); box(-4.15, 7.35, ROOF, ROOF + 0.02, -0.05, 4.05, E.gravilla); box(-4.3, 7.35, ROOF, ROOF + 0.02, -6.45, -0.05, E.gravilla);
  box(-7.5, 7.5, ROOF, ROOF + 0.35, -6.6, -6.45, E.estucoExt); box(-4.3, 7.5, ROOF, ROOF + 0.35, 4.05, 4.2, E.estucoExt);
  box(-7.5, -7.35, ROOF, ROOF + 0.35, -6.45, 0.1, E.estucoExt); box(7.35, 7.5, ROOF, ROOF + 0.35, -6.45, 4.05, E.estucoExt);
  box(-7.35, -4.3, ROOF, ROOF + 0.35, -0.05, 0.1, E.estucoExt); box(-4.3, -4.15, ROOF, ROOF + 0.35, -0.05, 4.05, E.estucoExt);
  // paneles solares: 2 filas x 9, inclinados 10° al sur
  for (const zc of [-3.6, -0.6]) for (let i = 0; i < 9; i++) {
    const xc = (zc < -1 ? -4.52 : -3.42) + i * 1.13;
    inPlace(xc, ROOF + 0.42, zc, 0, () => {
      const g = new THREE.BoxGeometry(1.1, 0.04, 2.26); g.rotateX(10 * D2R); addGeo(g, E.alNegro);
      const p = new THREE.PlaneGeometry(1.06, 2.22); p.rotateX(-Math.PI / 2); p.translate(0, 0.022, 0); p.rotateX(10 * D2R); addGeo(p, E.panelSolar, true);
      box(-0.5, -0.46, -0.4, -0.18, 0.9, 0.94, E.aceroNegro); box(0.46, 0.5, -0.4, -0.18, 0.9, 0.94, E.aceroNegro);
      box(-0.5, -0.46, -0.4, 0.14, -0.94, -0.9, E.aceroNegro); box(0.46, 0.5, -0.4, 0.14, -0.94, -0.9, E.aceroNegro);
    });
  }
  for (const x of [-3.4, -2.2]) { box(x - 0.45, x + 0.45, ROOF, ROOF + 0.8, 1.4, 2.2, E.inox); cyl(x, ROOF + 0.8, 1.8, 0.3, 0.02, E.aceroNegro, 20); }
  box(4.2, 5.4, ROOF, ROOF + 0.12, 1.4, 2.6, E.concreto);
  cyl(4.8, ROOF + 0.12, 2.0, 0.55, 1.2, E.casaVecina ?? E.estucoExt, 24);

  // ------------------------------------------------------------ DOBLE ALTURA
  setGroup('base');
  curtainWall();
  stair();
  doorsMain();
}

function curtainWall() {
  const E = MAT, z = -4.95;
  const mullions = [-1.9, -0.65, 0.4, 1.4, 2.8, 3.1];
  for (const x of mullions) box(x - 0.035, x + 0.035, 0, CEIL1, z - 0.09, z + 0.09, E.alNegro);
  box(-1.9, 3.1, 3.0, 3.1, z - 0.09, z + 0.09, E.alNegro);
  box(-1.9, 3.1, CEIL1 - 0.06, CEIL1, z - 0.09, z + 0.09, E.alNegro);
  box(-1.9, 3.1, 0, 0.05, z - 0.09, z + 0.09, E.alNegro);
  for (let i = 0; i < mullions.length - 1; i++) {
    const a0 = mullions[i] + 0.035, a1 = mullions[i + 1] - 0.035;
    if (mullions[i] !== 1.4) glassPane('x', z, a0, a1, 0.05, 3.0);
    glassPane('x', z, a0, a1, 3.1, CEIL1 - 0.06);
  }
  seg(-1.9, z, 1.4, z, 0, CEIL1); seg(2.8, z, 3.1, z, 0, CEIL1); seg(1.4, z, 2.8, z, 3.0, CEIL1);
  planLine('both', 'glass', -1.9, z, 1.4, z); planLine(0, 'door', 1.4, z, 2.8, z); planLine('both', 'glass', 2.8, z, 3.1, z);
  planLine(1, 'glass', 1.4, z, 2.8, z);
}

function stair() {
  const E = MAT;
  // Tramo 1 (macizo blanco, sube hacia el norte) x ∈ [-0.8, 0.3]
  for (let i = 1; i <= 8; i++) {
    const z1 = -1.76 - (i - 1) * RUN, z0 = -1.76 - i * RUN, top = i * RISE;
    const niche = i >= 5 && i <= 7;
    if (niche) { box(-0.8, -0.25, 0, top - 0.03, z0, z1, E.estucoInt); box(-0.25, 0.3, 0.64, top - 0.03, z0, z1, E.estucoInt); }
    else box(-0.8, 0.3, 0, top - 0.03, z0, z1, E.estucoInt);
    box(-0.8, 0.32, top - 0.03, top, z0 - 0.02, z1, E.robleMueble);
    if (i >= 3) glassRail('z', 0.3, z0, z1, top, 1.0);
  }
  // nicho de mascota bajo la escalera, mirando a la entrada
  const nz0 = -1.76 - 7 * RUN, nz1 = -1.76 - 4 * RUN;
  box(-0.27, 0.3, 0, 0.02, nz0, nz1, E.nogal); box(-0.27, 0.3, 0.62, 0.64, nz0, nz1, E.nogal); box(-0.27, -0.25, 0, 0.64, nz0, nz1, E.nogal);
  rbox(0.02, 0.07, (nz0 + nz1) / 2, 0.5, 0.1, 0.7, 0.05, E.cojinMascota);
  cyl(0.55, 0, nz1 + 0.12, 0.09, 0.06, E.inox, 20);
  // descanso macizo
  box(-1.9, 0.3, 0, 1.62, -4.85, -4.0, E.estucoInt);
  box(-1.9, 0.32, 1.62, 1.65, -4.85, -3.98, E.robleMueble);
  glassRail('z', 0.3, -4.85, -4.0, 1.65, 1.0);
  // Tramo 2 (huellas flotantes de roble) x ∈ [-1.9, -0.9]
  for (let j = 1; j <= 8; j++) {
    const z0 = -4.0 + (j - 1) * RUN, z1 = -4.0 + j * RUN, top = 1.65 + j * RISE;
    box(-1.9, -0.9, top - 0.07, top, z0, z1 + 0.02, E.robleMueble);
    box(-0.9, -0.8, 0, top + 0.9, z0, z1, E.concreto);        // espina de concreto entre tramos
  }
  box(-0.9, -0.8, 0, 1.65 + 0.9, -4.85, -4.0, E.concreto);
  box(-1.9, -0.9, 0, 1.4, -4.0, -1.76, E.estucoInt);            // bodega bajo el tramo 2
  // colisiones y rampas caminables
  seg(-0.85, -4.0, -0.85, -1.76, 0, FL1 + 1.0);
  seg(0.3, -4.85, 0.3, -2.32, 0, 2.7);
  rampZ(-0.8, 0.25, -4.0, -1.7, -1.76, 0, -4.0, 1.65);
  flat(-1.9, 0.25, -4.85, -3.98, 1.65);
  rampZ(-1.9, -0.9, -4.0, -1.7, -4.0, 1.65, -1.76, FL1);
  planLine(0, 'stair', -0.8, -1.76, -0.8, -4.0); planLine(0, 'stair', 0.3, -1.76, 0.3, -4.85);
  for (let i = 0; i <= 8; i++) { planLine(0, 'step', -0.8, -1.76 - i * RUN, 0.3, -1.76 - i * RUN); planLine(1, 'step', -1.9, -4.0 + i * RUN, -0.9, -4.0 + i * RUN); }
  planLine(1, 'stair', -0.85, -4.0, -0.85, -1.76);
}

// Puertas animadas: pivotante y garajes
function doorsMain() {
  const E = MAT;
  // Puerta pivotante de teca
  const piv = new THREE.Group(); piv.position.set(1.75, 0, -4.95);
  const leaf = panelMesh(1.4, 3.0, 0.07, E.puertaTeca); leaf.position.set(0.35, 1.5, 0); piv.add(leaf);
  const h1 = panelMesh(0.03, 1.4, 0.03, E.inox); h1.position.set(0.95, 1.3, -0.07); piv.add(h1);
  const h2 = panelMesh(0.03, 1.4, 0.03, E.inox); h2.position.set(0.95, 1.3, 0.07); piv.add(h2);
  DOOR_ROOT.add(piv);
  const closed = { ax: 1.4, az: -4.95, bx: 2.8, bz: -4.95, y0: 0, y1: 3 };
  const open = { ax: 1.75, az: -5.32, bx: 1.75, bz: -3.92, y0: 0, y1: 3 };
  const d = { label: 'puerta principal', obj: piv, t: 1, target: 1, speed: 0.9, center: new THREE.Vector3(2.1, 1.2, -4.95),
    apply(t) { const e = t * t * (3 - 2 * t); piv.rotation.y = -Math.PI / 2 * e; }, segs() { return this.t < 0.5 ? [closed] : [open]; } };
  d.apply(1); DOORS.push(d);
  // Garajes: puertas seccionales que suben al cielo raso
  for (const [x0, x1] of [[-7.2, -4.85], [-4.65, -2.3]]) {
    const g = new THREE.Group(); g.position.set((x0 + x1) / 2, 2.4, -4.86);
    const p = panelMesh(x1 - x0 - 0.02, 2.4, 0.05, E.garajePuerta); p.position.set(0, -1.2, 0); g.add(p);
    DOOR_ROOT.add(g);
    const sc = { ax: x0, az: -4.9, bx: x1, bz: -4.9, y0: 0, y1: 2.4 };
    const gd = { label: 'puerta del garaje', obj: g, t: 0, target: 0, speed: 0.55, center: new THREE.Vector3((x0 + x1) / 2, 1.2, -4.9),
      apply(t) { const e = t * t * (3 - 2 * t); g.rotation.x = -Math.PI / 2 * e; g.position.z = -4.86 + 0.05 * e; }, segs() { return this.t < 0.7 ? [sc] : []; } };
    gd.apply(0); DOORS.push(gd);
    planLine(0, 'door', x0, -4.9, x1, -4.9);
  }
}
