
// =====================================================================
// 12 · Ensamble de mallas (por material y por celda de 8 m)
// =====================================================================
const GROUP_OBJ = {};
const RAY_TARGETS = [];
function finalizeGroups() {
  const _bb = new THREE.Box3(), _ctr = new THREE.Vector3(), _sz = new THREE.Vector3();
  for (const [gname, map] of Object.entries(GROUPS)) {
    const grp = new THREE.Group(); grp.name = gname; scene.add(grp); GROUP_OBJ[gname] = grp;
    for (const [mat, geos] of map) {
      const buckets = new Map();
      for (const g of geos) {
        g.computeBoundingBox(); _bb.copy(g.boundingBox); _bb.getCenter(_ctr); _bb.getSize(_sz);
        const key = Math.max(_sz.x, _sz.z) > 16 ? 'big' : Math.floor(_ctr.x / 8) + ':' + Math.floor(_ctr.z / 8);
        if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push(g);
      }
      for (const list of buckets.values()) {
        const merged = list.length === 1 ? list[0] : mergeGeometries(list, false);
        if (!merged) continue;
        merged.computeBoundingSphere();
        const mesh = new THREE.Mesh(merged, mat);
        mesh.castShadow = !mat.userData.noCast; mesh.receiveShadow = !mat.isMeshBasicMaterial;
        if (mat.transparent) mesh.renderOrder = mat === MAT.sombra ? 1 : 2;
        if (mat.alphaTest > 0 && mat.map) mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: mat.map, alphaTest: mat.alphaTest });
        grp.add(mesh); if (!mat.userData.noRay) RAY_TARGETS.push(mesh);
      }
    }
  }
  DOOR_ROOT.traverse((o) => { if (o.isMesh) RAY_TARGETS.push(o); });
}

// =====================================================================
// 13 · Espacios, áreas y destinos
// =====================================================================
const ROOMS = [
  // nombre, nivel, x0, x1, z0, z1, tipo ('a' computa área, 'b' balcón, '' solo ubicación)
  ['Garaje doble', 0, -7.5, -2.0, -5.0, 0.8, 'a'], ['Vestíbulo de doble altura', 0, -2.0, 3.2, -5.0, -1.7, 'a'], ['Oficina', 0, 3.2, 7.5, -5.0, -1.7, 'a'],
  ['Baño social', 0, -2.0, -0.9, -1.7, 0.8, 'a'], ['Hall', 0, -0.9, 3.2, -1.7, 0.8, 'a'], ['Sala', 0, 3.2, 7.5, -1.7, 4.8, 'a'],
  ['Comedor', 0, 0.0, 3.2, 0.8, 4.8, 'a'], ['Cocina abierta', 0, -3.5, 0.0, 0.8, 4.8, 'a'], ['Área de servicio y lavandería', 0, -7.5, -3.5, 0.8, 4.8, 'a'],
  ['Habitación de servicio', 0, -7.5, -5.1, 4.8, 8.0, 'a'], ['Hall de servicio', 0, -5.1, -3.5, 4.8, 5.93, 'a'], ['Baño de servicio', 0, -5.1, -3.5, 5.93, 8.0, 'a'],
  ['Habitación 2', 1, -7.5, -2.0, -5.0, -1.7, 'a'], ['Habitación 3', 1, 3.2, 7.5, -5.0, -1.7, 'a'], ['Galería y pasillo', 1, -7.5, 7.5, -1.7, -0.5, 'a'],
  ['Baño compartido', 1, -4.3, -2.3, -0.5, 3.0, 'a'], ['Baño principal con bañera', 1, -2.3, 1.2, -0.5, 3.0, 'a'], ['Vestier', 1, 1.2, 3.2, -0.5, 3.0, 'a'],
  ['Habitación principal', 1, 3.2, 7.5, -0.5, 3.0, 'a'],
  ['Balcón · habitación 2', 1, -7.3, -2.2, -6.4, -5.0, 'b'], ['Balcón · habitación 3', 1, 3.4, 7.3, -6.4, -5.0, 'b'],
  ['Balcón · habitación principal', 1, 3.3, 7.45, 3.0, 6.0, 'b'], ['Terraza familiar', 1, -7.5, -4.3, -0.5, 8.0, 'f'],
  ['Terraza cubierta', 0, -7.5, 7.5, 4.8, 8.0, 't'], ['Piscina de borde infinito', 0, -6.2, 9.2, 8.0, 14.5, 'p'],
  ['Patio de mascotas', 0, -11.6, -7.5, 0.5, 4.85, ''], ['Patio de servicio', 0, -11.6, -7.5, 4.85, 8.0, ''], ['Deck de la piscina', 0, -12.2, 12.2, 8.0, 14.5, ''],
  ['Espejo de agua y acceso', 0, -1.8, 7.5, -12, -5, ''], ['Acceso vehicular', 0, -7.5, -2.0, -12, -5, ''],
  ['Jardín lateral', 0, -12.2, 12.2, -5, 8, ''], ['Jardín frontal', 0, -12.2, 12.2, -12, -5, ''], ['Andén', 0, -200, 200, -14.5, -12, ''],
];
const roomArea = (r) => (r[3] - r[2]) * (r[5] - r[4]) - (r[7] || 0);
function whereAmI(x, z, feet) {
  if (x > -2.0 && x < 0.35 && z > -5 && z < -1.7 && feet > 0.15 && feet < 3.15) return ['Escalera', feet > 1.4 ? 1 : 0];
  const lv = feet > 2 ? 1 : 0;
  for (const r of ROOMS) if (r[1] === lv && x >= r[2] && x <= r[3] && z >= r[4] && z <= r[5]) return [r[0], lv];
  if (lv === 1 && x > -2 && x < 3.2 && z > -5 && z < -1.7) return ['Vacío del vestíbulo', 1];
  return ['Exterior', lv];
}
const fmt = (n, d = 1) => n.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
function fillAreas() {
  const t = $('#areas'); let h = '<thead><tr><th>Espacio</th><th class="n">m²</th></tr></thead><tbody>';
  let tot = 0;
  for (const [lv, name] of [[0, 'Planta baja'], [1, 'Planta alta']]) {
    h += `<tr class="sub"><td colspan="2">${name}</td></tr>`; let s = 0;
    for (const r of ROOMS) if (r[1] === lv && r[6] === 'a') { const a = roomArea(r); s += a; h += `<tr><td>${r[0]}</td><td class="n">${fmt(a)}</td></tr>`; }
    h += `<tr class="sum"><td>Subtotal ${name.toLowerCase()}</td><td class="n">${fmt(s)}</td></tr>`; tot += s;
  }
  h += `<tr class="sum"><td>Área construida total</td><td class="n">${fmt(tot)}</td></tr>`;
  h += '<tr class="sub"><td colspan="2">No computable</td></tr>';
  let bal = 0; for (const r of ROOMS) if (r[6] === 'b') bal += roomArea(r);
  const fam = ROOMS.find((r) => r[6] === 'f');
  h += `<tr><td>3 balcones</td><td class="n">${fmt(bal)}</td></tr><tr><td>Terraza familiar (planta alta)</td><td class="n">${fmt(roomArea(fam))}</td></tr><tr><td>Terraza cubierta y pérgola</td><td class="n">${fmt(35.2)}</td></tr><tr><td>Patio de servicio</td><td class="n">${fmt(12.9)}</td></tr><tr><td>Lámina de agua de la piscina</td><td class="n">${fmt(60)}</td></tr>`;
  t.innerHTML = h + '</tbody>';
}
const look = (fx, fz, tx, tz) => Math.atan2(-(tx - fx), -(tz - fz));
const PLACES = [
  ['Fachada norte', 0, 2.1, -13.3, Math.PI, 0.16],
  ['Vestíbulo', 0, 2.5, -2.4, look(2.5, -2.4, -0.6, -4.4), 0.3],
  ['Sala', 0, 4.0, -1.1, look(4.0, -1.1, 6.6, 3.4), -0.08],
  ['Cocina', 0, 0.55, 1.5, look(0.55, 1.5, -2.0, 3.0), -0.12],
  ['Comedor y terraza', 0, 2.0, 1.1, Math.PI, -0.04],
  ['Oficina', 0, 3.9, -2.4, look(3.9, -2.4, 6.2, -4.3), -0.08],
  ['Garaje', 0, -4.75, 0.3, 0, -0.06],
  ['Área de servicio', 0, -3.95, 2.05, Math.PI / 2, -0.12],
  ['Patio de mascotas', 0, -8.4, 4.8, look(-8.4, 4.8, -10.6, 1.8), -0.12],
  ['Terraza', 0, 3.0, 5.5, Math.PI, -0.03],
  ['Piscina · borde infinito', 0, -7.0, 9.0, look(-7.0, 9.0, 6.0, 13.0), -0.06],
  ['Galería', 1, 2.4, -1.15, 0.35, -0.3],
  ['Habitación principal', 1, 3.85, -0.15, look(3.85, -0.15, 6.5, 2.5), -0.1],
  ['Baño con bañera', 1, 0.75, 0.65, look(0.75, 0.65, -0.3, 2.15), -0.25],
  ['Balcón principal', 1, 5.2, 3.4, Math.PI, -0.05],
  ['Habitación 2', 1, -2.9, -2.3, Math.PI / 2, -0.08],
  ['Habitación 3', 1, 3.85, -2.3, -Math.PI / 2, -0.08],
  ['Habitación de servicio', 0, -4.35, 5.35, look(-4.35, 5.35, -7.0, 6.4), -0.1],
  ['Terraza familiar', 1, -6.0, 0.1, Math.PI, -0.05],
];

// =====================================================================
// 14 · Control: recorrido en primera persona y vista aérea
// =====================================================================
const EYE = 1.62, R = 0.26;
const P = { x: 2.1, z: -13.3, feet: 0, vy: 0, yaw: Math.PI, pitch: 0.16, camY: EYE };
let MODE = 'aerial';
const keys = {}; const joy = { x: 0, y: 0 };
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(0.5, 2.2, 1.5); orbit.enableDamping = true; orbit.dampingFactor = 0.08;
orbit.minDistance = 5; orbit.maxDistance = 95; orbit.maxPolarAngle = 1.5; orbit.autoRotate = true; orbit.autoRotateSpeed = 0.35;
camera.position.set(24, 17, -27);

function blocked(seg2, feet) { return seg2.y1 > feet + 0.32 && seg2.y0 < feet + 1.75; }
function collide() {
  const segs = COLS.slice(); for (const d of DOORS) for (const s of d.segs()) segs.push(s);
  for (let it = 0; it < 3; it++) {
    for (const s of segs) {
      if (!blocked(s, P.feet)) continue;
      const dx = s.bx - s.ax, dz = s.bz - s.az; const L2 = dx * dx + dz * dz;
      let t = L2 > 0 ? ((P.x - s.ax) * dx + (P.z - s.az) * dz) / L2 : 0; t = clamp(t, 0, 1);
      const cx = s.ax + dx * t, cz = s.az + dz * t; let ox = P.x - cx, oz = P.z - cz; const d = Math.hypot(ox, oz);
      if (d < R) { if (d < 1e-5) { ox = -dz; oz = dx; const l = Math.hypot(ox, oz) || 1; ox /= l; oz /= l; P.x = cx + ox * R; P.z = cz + oz * R; } else { P.x = cx + ox / d * R; P.z = cz + oz / d * R; } }
    }
  }
}
function movePlayer(dt) {
  const fwd = ((keys.KeyW || keys.ArrowUp) ? 1 : 0) - ((keys.KeyS || keys.ArrowDown) ? 1 : 0) - joy.y;
  const str = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + joy.x;
  P.yaw += (((keys.ArrowLeft || keys.KeyQ) ? 1 : 0) - ((keys.ArrowRight || keys.KeyR) ? 1 : 0)) * dt * 1.9;
  const sp = (keys.ShiftLeft || keys.ShiftRight) ? 3.4 : 1.7;
  let mx = 0, mz = 0;
  if (fwd || str) {
    const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), rx = Math.cos(P.yaw), rz = -Math.sin(P.yaw);
    mx = fx * fwd + rx * str; mz = fz * fwd + rz * str; const l = Math.hypot(mx, mz); const k = Math.min(1, l) / (l || 1) * sp * dt; mx *= k; mz *= k;
  }
  const n = Math.max(1, Math.ceil(Math.hypot(mx, mz) / 0.06));
  for (let i = 0; i < n; i++) {
    const ox = P.x, oz = P.z; P.x += mx / n; P.z += mz / n; collide();
    const s = support(P.x, P.z, P.feet);
    if (s === -Infinity) { P.x = ox; P.z = oz; continue; }
    if (s >= P.feet - 0.36) { P.feet = s; P.vy = 0; }
  }
  const s = support(P.x, P.z, P.feet);
  if (s > -Infinity && s < P.feet - 0.001) { P.vy -= 9.8 * dt; P.feet = Math.max(s, P.feet + P.vy * dt); if (P.feet === s) P.vy = 0; }
  P.camY = lerp(P.camY, P.feet + EYE, 1 - Math.exp(-dt * 14));
  camera.position.set(P.x, P.camY, P.z); camera.rotation.set(P.pitch, P.yaw, 0, 'YXZ');
}
function teleport(i) {
  const [, lv, x, z, yaw, pitch] = PLACES[i];
  P.x = x; P.z = z; P.feet = lv ? FL1 : support(x, z, 0.1); P.vy = 0; P.camY = P.feet + EYE; P.yaw = yaw; P.pitch = pitch;
  if (MODE !== 'walk') setMode('walk'); else movePlayer(0);
}
function setCut(c) {
  CUT = c; document.querySelectorAll('#cut button').forEach((b) => b.classList.toggle('on', +b.dataset.cut === c));
  GROUP_OBJ.roof.visible = c === 0; GROUP_OBJ.upper.visible = c < 2;
  for (const d of DOORS) if (d.level === 1) d.obj.visible = c < 2;
}
let CUT = 0;
function setMode(m) {
  MODE = m; document.body.classList.toggle('aerial', m === 'aerial');
  $('#m-walk').classList.toggle('on', m === 'walk'); $('#m-aerial').classList.toggle('on', m === 'aerial');
  orbit.enabled = m === 'aerial';
  $('#cross').hidden = m !== 'walk';
  if (m === 'walk') { setCut(0); setGoto(false); camera.fov = 68; camera.near = 0.05; movePlayer(0); }
  else { if (document.pointerLockElement) document.exitPointerLock(); if (innerWidth >= 760) setGoto(true); camera.fov = 45; orbit.autoRotate = false; camera.position.set(P.x + 18, 16, P.z - 18); orbit.target.set(0.5, 2.2, 1.5); }
  camera.updateProjectionMatrix();
}

// --- entrada
const cv = renderer.domElement;
addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  keys[e.code] = true;
  if (e.code === 'KeyE') toggleDoor();
  if (e.code === 'Digit1') setPreset(0); if (e.code === 'Digit2') setPreset(1); if (e.code === 'Digit3') setPreset(2);
  if (e.code === 'KeyV') setMode(MODE === 'walk' ? 'aerial' : 'walk');
  if (MODE === 'walk' && e.code.startsWith('Arrow')) e.preventDefault();
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
let dragging = false, lastX = 0, lastY = 0, lookId = null;
cv.addEventListener('pointerdown', (e) => {
  hideIntro();
  if (MODE !== 'walk') return;
  if (e.pointerType === 'mouse' && !document.pointerLockElement) { try { const p = cv.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (_) {} }
  dragging = true; lookId = e.pointerId; lastX = e.clientX; lastY = e.clientY;
});
addEventListener('pointerup', (e) => { if (e.pointerId === lookId) { dragging = false; lookId = null; } });
addEventListener('pointermove', (e) => {
  if (MODE !== 'walk') return;
  if (document.pointerLockElement === cv) { P.yaw -= e.movementX * 0.0022; P.pitch -= e.movementY * 0.0022; }
  else if (dragging && e.pointerId === lookId) { const k = e.pointerType === 'mouse' ? 0.0045 : 0.006; P.yaw -= (e.clientX - lastX) * k; P.pitch -= (e.clientY - lastY) * k; lastX = e.clientX; lastY = e.clientY; }
  P.pitch = clamp(P.pitch, -1.3, 1.3);
});
// joystick táctil
{
  const el = $('#joy'), knob = $('#joy-knob'); let id = null, cx = 0, cy = 0;
  el.addEventListener('pointerdown', (e) => { id = e.pointerId; el.setPointerCapture(id); const r = el.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; e.stopPropagation(); hideIntro(); });
  el.addEventListener('pointermove', (e) => { if (e.pointerId !== id) return; let dx = (e.clientX - cx) / 50, dy = (e.clientY - cy) / 50; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } joy.x = dx; joy.y = dy; knob.style.transform = `translate(${dx * 38}px,${dy * 38}px)`; });
  const end = (e) => { if (e.pointerId !== id) return; id = null; joy.x = joy.y = 0; knob.style.transform = ''; };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
}

// --- puertas
let nearDoor = null;
function findDoor() {
  nearDoor = null; if (MODE !== 'walk') return;
  let best = 2.6; const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw);
  for (const d of DOORS) {
    const dx = d.center.x - P.x, dz = d.center.z - P.z, dist = Math.hypot(dx, dz);
    if (Math.abs(d.center.y - (P.feet + 1.2)) > 1.4 || dist > best) continue;
    if (dist > 0.6 && (dx * fx + dz * fz) / dist < 0.25) continue;
    best = dist; nearDoor = d;
  }
  const h = $('#hint');
  if (nearDoor) { h.hidden = false; h.innerHTML = `<kbd>E</kbd>${nearDoor.target > 0.5 ? 'cerrar' : 'abrir'} ${nearDoor.label}`; } else h.hidden = true;
  $('#act').disabled = !nearDoor;
}
function toggleDoor() { if (nearDoor) { nearDoor.target = nearDoor.target > 0.5 ? 0 : 1; findDoor(); } }
$('#act').addEventListener('click', toggleDoor);

// --- materiales a la vista
const ray = new THREE.Raycaster(); ray.far = 14; const _center = new THREE.Vector2(0, 0);
let lastMat = null;
function probeMaterial() {
  if (MODE !== 'walk') return;
  ray.setFromCamera(_center, camera);
  const hits = ray.intersectObjects(RAY_TARGETS, false);
  let info = null;
  for (const h of hits) { const m = h.object.material; if (m.userData.glass && h.distance > 1.3) continue; if (m.userData.noRay) continue; info = m.userData.info || null; if (info) { lastMat = m; } break; }
  const card = $('#matcard');
  if (!info || !info.n) { card.hidden = true; return; }
  card.hidden = false; $('#matname').textContent = info.n; $('#matdesc').textContent = info.d || '';
}

// =====================================================================
// 15 · Plano con posición
// =====================================================================
const map = $('#map'); const mctx = map.getContext('2d'); const MAPB = { x0: -12.6, x1: 12.6, z0: -14.6, z1: 15.0 };
let mapLayers = {}, mapW = 0, mapH = 0, mapS = 1, mapOX = 0, mapOY = 0;
function mapSetup() {
  const r = map.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
  mapW = Math.max(60, r.width); mapH = Math.max(60, r.height); map.width = mapW * dpr; map.height = mapH * dpr;
  mapS = Math.min(mapW / (MAPB.x1 - MAPB.x0), mapH / (MAPB.z1 - MAPB.z0));
  mapOX = (mapW - (MAPB.x1 - MAPB.x0) * mapS) / 2; mapOY = (mapH - (MAPB.z1 - MAPB.z0) * mapS) / 2;
  for (const lv of [0, 1]) {
    const c = document.createElement('canvas'); c.width = map.width; c.height = map.height; const g = c.getContext('2d'); g.scale(dpr, dpr);
    const X = (x) => mapOX + (x - MAPB.x0) * mapS, Z = (z) => mapOY + (z - MAPB.z0) * mapS;
    const rect = (x0, x1, z0, z1, col) => { g.fillStyle = col; g.fillRect(X(x0), Z(z0), (x1 - x0) * mapS, (z1 - z0) * mapS); };
    rect(-12.2, 12.2, -12, 14.5, 'rgba(110,140,90,.32)');
    rect(-12.6, 12.6, -14.6, -12, 'rgba(200,200,195,.18)');
    rect(-7.5, 7.5, 4.8, 8, 'rgba(190,130,80,.35)'); rect(-12.2, 12.2, 8, 14.3, 'rgba(225,210,180,.28)');
    rect(-6, 9, 9.5, 13.6, 'rgba(90,200,210,.55)'); rect(-1.6, 1.15, -11, -6.6, 'rgba(70,110,130,.6)'); rect(3.05, 7.3, -11, -6.6, 'rgba(70,110,130,.6)');
    rect(-7.5, -2, -12, -5, 'rgba(210,210,205,.22)');
    rect(-7.5, 7.5, -5, lv ? 3.0 : 4.8, 'rgba(242,238,230,.16)'); if (!lv) rect(-7.5, -3.5, 4.8, 8.0, 'rgba(242,238,230,.16)');
    if (lv) { rect(-7.5, 7.5, 3.0, 6.0, 'rgba(160,180,120,.25)'); rect(-7.3, -2.2, -6.4, -5, 'rgba(190,130,80,.35)'); rect(3.4, 7.3, -6.4, -5, 'rgba(190,130,80,.35)'); rect(3.3, 7.45, 3, 6, 'rgba(190,130,80,.4)'); rect(-7.45, -4.36, -0.44, 7.95, 'rgba(190,130,80,.45)'); rect(-2, 3.2, -5, -1.7, 'rgba(0,0,0,.35)'); }
    for (const p of PLAN[lv]) {
      g.beginPath(); g.moveTo(X(p.ax), Z(p.az)); g.lineTo(X(p.bx), Z(p.bz));
      if (p.kind === 'wall') { g.strokeStyle = '#f2eee6'; g.lineWidth = 2.2; }
      else if (p.kind === 'glass') { g.strokeStyle = '#8fd8e6'; g.lineWidth = 1.4; }
      else if (p.kind === 'door') { g.strokeStyle = 'rgba(216,161,106,.9)'; g.lineWidth = 1; }
      else if (p.kind === 'rail') { g.strokeStyle = 'rgba(143,216,230,.7)'; g.lineWidth = 1; }
      else if (p.kind === 'water') { g.strokeStyle = 'rgba(120,210,220,.9)'; g.lineWidth = 1; }
      else if (p.kind === 'fence') { g.strokeStyle = 'rgba(216,161,106,.8)'; g.lineWidth = 1; }
      else { g.strokeStyle = 'rgba(242,238,230,.45)'; g.lineWidth = 0.7; }
      g.stroke();
    }
    g.fillStyle = 'rgba(242,238,230,.7)'; g.font = '600 9px Archivo, Arial'; g.textAlign = 'center';
    g.fillText('N', X(-11.2), Z(-13.1)); g.beginPath(); g.moveTo(X(-11.2), Z(-14.4)); g.lineTo(X(-11.6), Z(-13.7)); g.lineTo(X(-10.8), Z(-13.7)); g.fill();
    mapLayers[lv] = c;
  }
}
function drawMap() {
  const dpr = map.width / mapW; mctx.setTransform(1, 0, 0, 1, 0, 0); mctx.clearRect(0, 0, map.width, map.height);
  const lv = (MODE === 'walk' ? P.feet : 0) > 2 ? 1 : 0; mctx.drawImage(mapLayers[lv], 0, 0); mctx.scale(dpr, dpr);
  const px = MODE === 'walk' ? P.x : camera.position.x, pz = MODE === 'walk' ? P.z : camera.position.z;
  const X = mapOX + (px - MAPB.x0) * mapS, Z = mapOY + (pz - MAPB.z0) * mapS;
  const yaw = MODE === 'walk' ? P.yaw : Math.atan2(-(orbit.target.x - camera.position.x), -(orbit.target.z - camera.position.z));
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
  if (MODE === 'walk') {
    const g = mctx.createRadialGradient(X, Z, 2, X, Z, 34); g.addColorStop(0, 'rgba(216,161,106,.55)'); g.addColorStop(1, 'rgba(216,161,106,0)');
    mctx.fillStyle = g; mctx.beginPath(); mctx.moveTo(X, Z); const a = Math.atan2(fz, fx); mctx.arc(X, Z, 34, a - 0.55, a + 0.55); mctx.closePath(); mctx.fill();
    mctx.fillStyle = '#d8a16a'; mctx.beginPath(); mctx.arc(X, Z, 4, 0, Math.PI * 2); mctx.fill(); mctx.strokeStyle = '#121414'; mctx.lineWidth = 1.5; mctx.stroke();
  } else { mctx.fillStyle = '#d8a16a'; mctx.beginPath(); mctx.arc(clamp(X, 6, mapW - 6), clamp(Z, 6, mapH - 6), 4, 0, Math.PI * 2); mctx.fill(); }
}
map.addEventListener('click', (e) => {
  const r = map.getBoundingClientRect(); const x = MAPB.x0 + (e.clientX - r.left - mapOX) / mapS, z = MAPB.z0 + (e.clientY - r.top - mapOY) / mapS;
  const lv = (MODE === 'walk' ? P.feet : 0) > 2 ? 1 : 0; const y = lv ? FL1 : 0; const s = support(x, z, y + 0.05, 0.1);
  if (s === -Infinity || Math.abs(s - y) > 0.3) return;
  const keep = P.yaw; P.x = x; P.z = z; P.feet = s; P.camY = s + EYE; P.yaw = keep; collide(); hideIntro(); if (MODE !== 'walk') setMode('walk');
});

// =====================================================================
// 16 · Interfaz
// =====================================================================
function hhmm(h) { const H = Math.floor(h), M = Math.round((h - H) * 60); return `${String(H + (M === 60 ? 1 : 0)).padStart(2, '0')}:${String(M % 60).padStart(2, '0')}`; }
function refreshTimeUI() {
  $('#clock').textContent = hhmm(TOD.hour); $('#hour').value = TOD.hour;
  $('#sunread').textContent = TOD.alt > 0 ? `Sol ${Math.round(TOD.alt)}° · ${Math.round(TOD.az)}° ${cardinal(TOD.az)}` : `Sol bajo el horizonte`;
  const pres = [10.5, 17.08, 19.75]; document.querySelectorAll('#tod button').forEach((b, i) => b.classList.toggle('on', Math.abs(pres[i] - TOD.hour) < 0.05));
  $('#lights').textContent = 'Luces: ' + ({ auto: 'automáticas', on: 'encendidas', off: 'apagadas' })[TOD.lights];
}
function setHour(h) { TOD.hour = h; updateSky(); refreshTimeUI(); }
function setPreset(i) { setHour([10.5, 17.08, 19.75][i]); }
document.querySelectorAll('#tod button').forEach((b, i) => b.addEventListener('click', () => setPreset(i)));
$('#hour').addEventListener('input', (e) => setHour(+e.target.value));
$('#date').addEventListener('change', (e) => { const [m, d] = e.target.value.split('-').map(Number); TOD.m = m; TOD.d = d; updateSky(); refreshTimeUI(); });
$('#lights').addEventListener('click', () => { TOD.lights = { auto: 'on', on: 'off', off: 'auto' }[TOD.lights]; updateSky(); refreshTimeUI(); });
$('#quality').addEventListener('click', () => {
  QUALITY = QUALITY === 'alta' ? 'media' : 'alta'; applyPixelRatio(); renderer.setSize(innerWidth, innerHeight);
  const n = QUALITY === 'alta' ? 4096 : 2048; sun.shadow.mapSize.set(n, n); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
  $('#quality').textContent = 'Calidad: ' + QUALITY;
});
$('#m-walk').addEventListener('click', () => { hideIntro(); if (MODE !== 'walk') { if (P.z < -12.5 && P.feet === 0 && P.x === 2.1) teleport(0); else setMode('walk'); } });
$('#m-aerial').addEventListener('click', () => { hideIntro(); setMode('aerial'); });
document.querySelectorAll('#cut button').forEach((b) => b.addEventListener('click', () => setCut(+b.dataset.cut)));
$('#go-walk').addEventListener('click', () => { hideIntro(); teleport(0); });
$('#go-aerial').addEventListener('click', () => { hideIntro(); setMode('aerial'); });
$('#memo-btn').addEventListener('click', () => { $('#memo').hidden = false; });
$('#memo-close').addEventListener('click', () => { $('#memo').hidden = true; });
$('#memo').addEventListener('click', (e) => { if (e.target.id === 'memo') $('#memo').hidden = true; });
$('#goto-toggle').addEventListener('click', () => setGoto($('#goto').classList.contains('closed')));
function buildPlaces() {
  const el = $('#places'); let h = '';
  for (const lv of [0, 1]) {
    h += `<span class="eyebrow lvl">${lv ? 'Planta alta' : 'Planta baja y exterior'}</span>`;
    PLACES.forEach((p, i) => { if (p[1] === lv) h += `<button type="button" class="chip" data-i="${i}">${p[0]}</button>`; });
  }
  el.innerHTML = h;
  el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { hideIntro(); teleport(+b.dataset.i); if (innerWidth < 1100) setGoto(false); }));
  if (innerWidth < 760) setGoto(false);
}
function setGoto(open) { $('#goto').classList.toggle('closed', !open); $('#goto-toggle').textContent = open ? 'Ocultar' : 'Mostrar'; }
function hideIntro() { if (!document.body.classList.contains('intro')) return; document.body.classList.remove('intro'); $('#intro').hidden = true; orbit.autoRotate = false; }
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); mapSetup(); });

// =====================================================================
// 17 · Bucle
// =====================================================================
const clock = new THREE.Clock(); let hudT = 0, rayT = 0, lastRoom = '';
function frame() {
  const dt = Math.min(0.05, clock.getDelta()); const t = clock.elapsedTime;
  TIME_UNIFORM.value = t; if (MAT.cascada.map) MAT.cascada.map.offset.y = (t * 0.9) % 1;
  for (const d of DOORS) if (d.t !== d.target) { const s = Math.sign(d.target - d.t); d.t = clamp(d.t + s * dt * d.speed, 0, 1); if ((s > 0 && d.t > d.target) || (s < 0 && d.t < d.target)) d.t = d.target; d.apply(d.t); }
  if (MODE === 'walk') movePlayer(dt); else orbit.update();
  hudT += dt; rayT += dt;
  if (hudT > 0.1) {
    hudT = 0; drawMap(); findDoor();
    const [name, lv] = MODE === 'walk' ? whereAmI(P.x, P.z, P.feet) : ['Vista aérea', 0];
    if (name !== lastRoom) { $('#room').textContent = name; lastRoom = name; }
    $('#lvl').textContent = MODE === 'walk' ? (lv ? 'Planta alta' : 'Planta baja') : 'Toda la casa';
  }
  if (rayT > 0.15) { rayT = 0; probeMaterial(); }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

// =====================================================================
// 18 · Arranque
// =====================================================================
async function init() {
  document.body.classList.add('intro', 'aerial');
  await progress(0.05, 'Generando texturas de materiales…');
  await makeMaterials();
  await progress(0.72, 'Levantando muros y losas…');
  buildHouse();
  await progress(0.8, 'Amoblando…');
  buildFurniture();
  await progress(0.86, 'Paisajismo y piscina…');
  buildExterior(); buildVegetation();
  for (const d of DOORS) d.level = d.center.y > 2.5 ? 1 : 0;
  await progress(0.92, 'Uniendo geometría…');
  finalizeGroups();
  fillAreas(); buildPlaces(); mapSetup(); $('#quality').textContent = 'Calidad: ' + QUALITY; if (QUALITY !== 'alta') sun.shadow.mapSize.set(2048, 2048);
  updateSky(); updateEnv(); refreshTimeUI();
  setMode('aerial'); orbit.autoRotate = true; camera.position.set(24, 17, -27); camera.lookAt(orbit.target);
  await progress(1, 'Listo');
  renderer.compile(scene, camera);
  frame();
  const L = $('#loading'); L.style.opacity = 0; setTimeout(() => L.remove(), 650);
  window.__casa = { keys, P, PLACES, teleport, setHour, setMode, setCut, COLS, SURF, support, DOORS, renderer, scene, camera, ROOMS, whereAmI, TOD, collide, movePlayer, orbit };
}
init().catch((err) => { console.error(err); const e = $('#err'); e.hidden = false; e.textContent = 'No se pudo iniciar el modelo 3D: ' + err.message + '. Prueba en Chrome, Edge o Safari recientes.'; });
