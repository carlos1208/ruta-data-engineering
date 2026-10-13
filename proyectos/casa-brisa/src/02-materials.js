
// =====================================================================
// 3 · Materiales (cada uno con su ficha para el recorrido)
// =====================================================================
const MAT = {};
const ALL_MATS = [];
const NIGHT_EMISSIVE = []; // [material, intensidad de noche]
let TIME_UNIFORM = { value: 0 };
let CAUSTIC_UNIFORM = { value: 1 };

function std(key, p, n, d) {
  const m = new THREE.MeshStandardMaterial(p); m.name = key;
  if (n) m.userData.info = { n, d };
  MAT[key] = m; ALL_MATS.push(m); return m;
}
function withTex(tex, tile, extra = {}) {
  const r = (t) => { if (!t) return undefined; const c = t.clone(); c.repeat.set(1 / tile, 1 / tile); c.needsUpdate = true; return c; };
  const o = { map: r(tex.map), ...extra };
  if (tex.normal) o.normalMap = r(tex.normal);
  if (tex.rough) o.roughnessMap = r(tex.rough);
  return o;
}
// alfa por Fresnel + brillo del reflejo: el vidrio se ve transparente de frente y espejado en rasante
function fresnelAlpha(m, base, gain) {
  m.customProgramCacheKey = () => 'fresnel' + base + '_' + gain;
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `
      float frs = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 4.0);
      float lum = dot(outgoingLight, vec3(0.299,0.587,0.114));
      gl_FragColor = vec4(outgoingLight, clamp(${base.toFixed(3)} + frs*0.65 + lum*${gain.toFixed(3)}, 0.0, 0.97));`);
  };
}

async function makeMaterials() {
  const steps = [
    ['marmol', 1024, 1.2], ['roble', 1024, 2.5], ['concreto', 1024, 3], ['coralina', 1024, 3.5],
    ['teca', 512, 2.5], ['nogal', 512, 1.5], ['travertino', 512, 2.5], ['mosaico', 512, 2], ['grama', 512, 2.5],
    ['estuco', 256, 0.8], ['microcemento', 512, 1], ['tela', 256, 1.5], ['adoquin', 512, 2.5], ['asfalto', 256, 1.5],
    ['follaje', 256, 4], ['corteza', 256, 3], ['tapete', 256, 2],
  ];
  const T = {};
  for (let i = 0; i < steps.length; i++) {
    const [k, n, nk] = steps[i];
    await progress(0.1 + 0.55 * (i / steps.length), 'Generando material: ' + k);
    T[k] = buildTex(n, PX[k](), nk, k === 'roble');
  }
  await progress(0.68, 'Componiendo materiales…');

  // --- Pisos ---
  std('marmol', withTex(T.marmol, 2.4, { roughness: 0.16, metalness: 0 }), 'Porcelanato símil mármol Calacatta', '120 × 120 cm, acabado satinado. Continuo en toda la zona social de planta baja.');
  std('roble', withTex(T.roble, 2.4, { roughness: 1, metalness: 0 }), 'Piso de roble europeo', 'Tablas de 20 cm × 1,2 m, acabado aceite natural mate. Habitaciones, vestier y pasillo.');
  std('concretoPulido', withTex(T.microcemento, 3, { color: 0x9a9894, roughness: 0.34 }), 'Concreto pulido con sellador', 'Piso de garaje: resistente a llantas y aceite, se limpia con agua.');
  std('microcemento', withTex(T.microcemento, 2, { roughness: 0.55, normalScale: new THREE.Vector2(0.3, 0.3) }), 'Microcemento sellado', 'Pisos y muros de baños sin juntas; acabado poliuretano antideslizante.');
  // --- Muros ---
  std('concreto', withTex(T.concreto, 2.4, { roughness: 0.86 }), 'Concreto a la vista', 'Formaleta de tabla de 15 cm, pasadores cada 60 cm, hidrofugante mate.');
  std('coralina', withTex(T.coralina, 2.4, { roughness: 0.93 }), 'Piedra coralina del Caribe', 'Sillares de 60 × 30 cm con junta rehundida. Porosa y fresca: piedra local de la costa.');
  std('estucoExt', withTex(T.estuco, 2, { color: 0xf6f5f2, roughness: 0.9, normalScale: new THREE.Vector2(0.25, 0.25) }), 'Estuco blanco con pintura elastomérica', 'Refleja cerca del 80 % de la radiación solar y baja la carga térmica de la caja superior.');
  std('estucoInt', withTex(T.estuco, 2, { color: 0xf3efe8, roughness: 0.92, normalScale: new THREE.Vector2(0.2, 0.2) }), 'Pañete liso pintado, blanco cálido', 'Pintura lavable mate en muros y cielos rasos.');
  std('techoMadera', withTex(T.teca, 2.4, { color: 0xe6c9a6, roughness: 0.7 }), 'Cielo raso en listones de madera', 'Listones de pino tratado con tinte natural sobre la sala y el comedor; mejora la acústica.');
  // --- Madera ---
  std('teca', withTex(T.teca, 2.4, { roughness: 0.72 }), 'Deck de teca inmunizada', 'Listones de 14,5 × 2,5 cm con junta de 5 mm. Terraza y balcones.');
  std('tecaLamas', withTex(T.teca, 2.4, { roughness: 0.68 }), 'Celosía de lamas de teca', 'Lamas verticales de 4 × 12 cm: filtran el sol bajo del oriente y del poniente y dejan pasar la brisa.');
  std('nogal', withTex(T.nogal, 2.4, { roughness: 0.48 }), 'Enchape de nogal americano', 'Carpintería de cocina, muro de TV, biblioteca y closets.');
  std('robleMueble', withTex(T.roble, 2.4, { roughness: 0.55, color: 0xf2e6d6 }), 'Roble macizo', 'Mesas, escritorio y huellas de escalera, acabado aceite-cera.');
  std('encimera', withTex(T.marmol, 1.2, { roughness: 0.1 }), 'Encimera en porcelánico Calacatta', 'Lámina de 12 mm; la isla cae en cascada hasta el piso por ambos extremos.');
  std('inversor', { color: 0xe6e6e3, roughness: 0.4 }, 'Inversor híbrido de 10 kW y batería de 10 kWh', 'Recibe la energía de los paneles y respalda nevera, internet y luces durante cortes.');
  std('garajePuerta', withTex(T.teca, 2.4, { roughness: 0.6, color: 0xd2a77e }), 'Puerta seccional de aluminio símil madera', 'Motorizada y aislada; dos accesos independientes de 2,35 m.');
  std('puertaTeca', withTex(T.nogal, 2.4, { roughness: 0.5, color: 0xd9a77a }), 'Puerta pivotante en teca maciza', '1,40 × 3,00 m sobre pivote descentrado: deja 1,00 m de paso libre.');
  // --- Exterior ---
  std('travertino', withTex(T.travertino, 2.4, { roughness: 0.78 }), 'Travertino romano apomazado', 'Placas de 60 × 60 cm. Antideslizante y no se calienta al sol: deck de la piscina.');
  std('grama', withTex(T.grama, 3, { roughness: 0.96 }), 'Césped bermuda', 'Resiste sol pleno y sequía; riego por goteo con agua lluvia.');
  std('adoquin', withTex(T.adoquin, 2.72, { roughness: 0.9 }), 'Losetas de concreto con junta verde', '60 × 60 cm con 8 cm de grama: el agua lluvia se infiltra en el lote.');
  std('asfalto', withTex(T.asfalto, 4, { roughness: 0.95 }), 'Vía de acceso', '');
  std('acera', withTex(T.concreto, 3, { roughness: 0.9, color: 0xd8d6d0 }), 'Andén en concreto', '');
  std('techoVerde', withTex(T.follaje, 1.2, { color: 0x9fb07a, roughness: 0.95 }), 'Cubierta verde extensiva', 'Sedum y maní forrajero sobre membrana: aísla la planta baja y retiene agua lluvia.');
  std('gravilla', withTex(T.travertino, 1, { color: 0xb9b6ae, roughness: 1 }), 'Gravilla blanca sobre impermeabilización', 'Protege la membrana y refleja el sol en la cubierta.');
  std('follaje', withTex(T.follaje, 1.5, { roughness: 0.85 }), 'Vegetación nativa', 'Especies de bosque seco tropical: poco riego y sombra densa.');
  std('follajeAmarillo', { normalMap: withTex(T.follaje, 1.5).normalMap, color: 0xc9a23c, roughness: 0.8 }, 'Guayacán amarillo', 'Árbol nativo; florece en amarillo intenso en temporada seca.');
  std('seto', withTex(T.follaje, 1.2, { color: 0xb7d39a, roughness: 0.9 }), 'Seto de swinglea', 'Cerramiento vivo de 1,80 m en los linderos.');
  std('corteza', withTex(T.corteza, 1, { roughness: 0.95 }), 'Palma real', 'Tronco anillado de palma; da sombra alta sin cerrar la brisa.');
  const fronda = texFronda();
  std('fronda', { map: fronda, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.75, color: 0xdfe8c9 }, 'Hojas de palma', '');
  MAT.fronda.userData.noRay = true;
  std('hojas', { map: fronda, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.7, color: 0xcfe0b4 }, 'Plantas en matera', 'Ave del paraíso y palma areca: toleran sol filtrado y piden poco riego.');
  std('tierra', { color: 0x3a2c22, roughness: 1 }, null);
  std('maceta', withTex(T.concreto, 1.2, { color: 0xbab6ad, roughness: 0.9 }), 'Matera en concreto', '');
  // --- Agua ---
  const ondas = texOndas();
  const agua = std('agua', { color: 0x1b6f78, roughness: 0.04, metalness: 0.05, normalMap: ondas, normalScale: new THREE.Vector2(0.35, 0.35), transparent: true, depthWrite: false, envMapIntensity: 1.3 }, 'Agua · piscina de borde infinito', '15 × 4 m, 1,40 m de profundidad. Rebosa por el borde sur hacia un canal oculto.');
  agua.userData.noCast = true;
  ondas.repeat.set(1 / 3, 1 / 3);
  agua.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = TIME_UNIFORM;
    sh.fragmentShader = 'uniform float uTime;\n' + sh.fragmentShader
      .replace('#include <normal_fragment_maps>', THREE.ShaderChunk.normal_fragment_maps.replace(
        'vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;',
        `vec3 n1 = texture2D( normalMap, vNormalMapUv + vec2(uTime*0.013, uTime*0.009) ).xyz * 2.0 - 1.0;
         vec3 n2 = texture2D( normalMap, vNormalMapUv*1.73 + vec2(-uTime*0.011, uTime*0.016) ).xyz * 2.0 - 1.0;
         vec3 mapN = normalize(vec3(n1.xy + n2.xy, n1.z * n2.z));`))
      .replace('#include <opaque_fragment>', `
        float frs = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 3.0);
        float lum = dot(outgoingLight, vec3(0.299,0.587,0.114));
        gl_FragColor = vec4(outgoingLight, clamp(0.58 + frs*0.4 + lum*0.25, 0.0, 0.96));`);
  };
  const espejoAgua = std('espejoAgua', { color: 0x0e1c1e, roughness: 0.02, metalness: 0.1, normalMap: ondas, normalScale: new THREE.Vector2(0.12, 0.12), envMapIntensity: 1.6 }, 'Espejo de agua', 'Lámina de 20 cm sobre fondo de piedra negra: duplica la fachada y refresca la entrada.');
  espejoAgua.userData.noCast = true;
  const mosaico = std('mosaico', withTex(T.mosaico, 1, { roughness: 0.22, emissive: 0x2fd6ff, emissiveIntensity: 0 }), 'Mosaico vítreo turquesa', 'Teselas de 2,5 × 2,5 cm en el vaso de la piscina.');
  NIGHT_EMISSIVE.push([mosaico, 1.0]);
  mosaico.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = TIME_UNIFORM; sh.uniforms.uCaustic = CAUSTIC_UNIFORM;
    sh.vertexShader = 'varying vec3 vWPos;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vWPos = (modelMatrix * vec4(transformed,1.0)).xyz;');
    sh.fragmentShader = 'uniform float uTime; uniform float uCaustic; varying vec3 vWPos;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      { vec2 q = vWPos.xz * 1.7; float c = 0.0;
        for (int i = 0; i < 3; i++) { q += vec2(sin(q.y*1.3 + uTime*0.8 + float(i)*1.7), cos(q.x*1.1 - uTime*0.6 + float(i)*2.3))*0.45; c += abs(sin(q.x + q.y)); }
        float cau = pow(clamp(1.0 - c/3.0, 0.0, 1.0), 3.0);
        totalEmissiveRadiance += vec3(0.85,1.0,0.95) * cau * uCaustic; }`);
  };
  const cascada = texCascada(); cascada.repeat.set(30, 1);
  std('cascada', { map: cascada, alphaMap: cascada, transparent: true, color: 0xcfeff0, roughness: 0.1, depthWrite: false, side: THREE.DoubleSide }, 'Rebose del borde infinito', 'Lámina de agua de 60 cm hacia el canal de recolección.');
  MAT.cascada.userData.noCast = true;
  // --- Vidrio y metal ---
  const vidrio = std('vidrio', { color: 0xb9d3cf, roughness: 0.03, metalness: 0.2, transparent: true, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.4 }, 'Vidrio laminado de control solar', 'Doble vidrio bajo emisivo 6+12+6 mm: deja pasar la luz y bloquea cerca del 60 % del calor.');
  vidrio.userData.noCast = true; vidrio.userData.glass = true; fresnelAlpha(vidrio, 0.07, 0.5);
  const baranda = std('vidrioBaranda', { color: 0xcfe0dc, roughness: 0.04, metalness: 0.1, transparent: true, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.2 }, 'Baranda de vidrio templado', 'Vidrio laminado 10+10 mm empotrado en perfil de piso, altura 1,05 m.');
  baranda.userData.noCast = true; baranda.userData.glass = true; fresnelAlpha(baranda, 0.1, 0.45);
  std('alNegro', { color: 0x1d1e20, roughness: 0.38, metalness: 0.6 }, 'Aluminio anodizado negro', 'Ventanería de piso a techo con corte térmico y sistema corredizo empotrado.');
  std('aceroNegro', { color: 0x252526, roughness: 0.5, metalness: 0.55 }, 'Acero negro microtexturizado', 'Estructura de muebles, pérgola y barandas.');
  std('inox', { color: 0xb5b9bd, roughness: 0.3, metalness: 1 }, 'Acero inoxidable cepillado', 'Electrodomésticos y griferías.');
  std('cromo', { color: 0xdedede, roughness: 0.08, metalness: 1 }, 'Grifería cromada', '');
  std('laton', { color: 0xc6a15b, roughness: 0.28, metalness: 1 }, 'Latón cepillado', 'Lámparas y detalles.');
  std('porcelana', { color: 0xf4f4f1, roughness: 0.12 }, 'Porcelana sanitaria', 'Sanitarios suspendidos y lavamanos de sobreponer.');
  std('banera', { color: 0xf1f0ec, roughness: 0.28 }, 'Bañera exenta en solid surface', '170 × 80 cm, blanco mate, grifería de piso.');
  std('espejo', { color: 0xf2f2f2, roughness: 0.02, metalness: 1, envMapIntensity: 1 }, 'Espejo plata 6 mm', 'Con iluminación LED perimetral.');
  std('vidrioNegro', { color: 0x060607, roughness: 0.06, metalness: 0.3 }, 'Vidrio cerámico negro', 'Estufa de inducción.');
  std('cuero', { color: 0x8a4a25, roughness: 0.52 }, 'Cuero curtido, color coñac', '');
  // --- Textiles ---
  std('telaSofa', withTex(T.tela, 0.6, { color: 0xd7cdbd, roughness: 0.95 }), 'Sofá en lino lavado', 'Color arena; tela de alto tráfico, lavable.');
  std('telaCama', withTex(T.tela, 0.6, { color: 0xf6f3ee, roughness: 0.95 }), 'Ropa de cama en algodón percal', '');
  std('telaGris', withTex(T.tela, 0.6, { color: 0x8a8d8c, roughness: 0.95 }), 'Tapizado en lana gris', '');
  std('telaTeal', withTex(T.tela, 0.6, { color: 0x2e7c78, roughness: 0.95 }), 'Cojín en lino verde agua', '');
  std('telaOcre', withTex(T.tela, 0.6, { color: 0xc98a3b, roughness: 0.95 }), 'Cojín en lino ocre', '');
  std('telaExt', withTex(T.tela, 0.6, { color: 0xe9e4da, roughness: 0.95 }), 'Tela acrílica para exterior', 'Resiste sol, lluvia y cloro.');
  std('tapete', withTex(T.tapete, 1, { roughness: 1 }), 'Tapete en lana y yute', '');
  // --- Equipos ---
  const panel = texPanelSolar();
  std('panelSolar', { map: panel, roughness: 0.18, metalness: 0.4, envMapIntensity: 1.2 }, 'Panel solar monocristalino de 550 W', '18 paneles = 9,9 kWp, a 10° hacia el sur. Producción estimada ≈ 1.250 kWh al mes.');
  std('libros', { map: texLibros(), roughness: 0.8 }, 'Biblioteca', '');
  for (let i = 0; i < 3; i++) {
    const m = std('tv' + i, { color: 0x050505, roughness: 0.08, emissiveMap: texTV(i), emissive: 0xffffff, emissiveIntensity: 0.9 }, 'Televisor OLED', 'Montado a muro, frente a la cama o al sofá; distancia de visión de 2,5 a 3,5 m.');
    m.userData.noCast = true;
  }
  std('arteObregon', { map: texArteObregon(), roughness: 0.8 }, 'Óleo abstracto sobre lienzo', 'Obra de gran formato inspirada en Alejandro Obregón, pintor de Barranquilla.');
  std('arteRayo', { map: texArteRayo(), roughness: 0.7 }, 'Obra op-art en blanco y negro', 'Homenaje a Omar Rayo y al arte geométrico colombiano.');
  std('led', { color: 0xfff1dc, emissive: 0xffd9a8, emissiveIntensity: 0, roughness: 0.4 }, 'Luminaria LED empotrada', '2.700 K, cálida, con atenuador.');
  NIGHT_EMISSIVE.push([MAT.led, 2.4]);
  std('opal', { color: 0xf5f0e6, emissive: 0xffd2a0, emissiveIntensity: 0, roughness: 0.25 }, 'Lámpara de vidrio opalino', '');
  NIGHT_EMISSIVE.push([MAT.opal, 1.6]);
  std('ventanaVecina', { color: 0x2a3036, emissive: 0xffc68a, emissiveIntensity: 0, roughness: 0.2 }, null);
  NIGHT_EMISSIVE.push([MAT.ventanaVecina, 0.9]);
  std('casaVecina', { color: 0xe9e6df, roughness: 0.9 }, null);
  std('cerroLejano', { color: 0x46604d, roughness: 1, fog: false }, null);
  std('carroBlanco', { color: 0xe9eae8, roughness: 0.22, metalness: 0.35 }, 'Vehículo eléctrico', 'Garaje con cargador de 7 kW alimentado por los paneles.');
  std('carroGrafito', { color: 0x3a3d42, roughness: 0.25, metalness: 0.55 }, 'Vehículo', '');
  std('llanta', { color: 0x121212, roughness: 0.9 }, null);
  std('vidrioCarro', { color: 0x0b0e12, roughness: 0.05, metalness: 0.5 }, null);
  std('plantaInt', withTex(T.follaje, 0.8, { color: 0xa9c08a, roughness: 0.8 }), 'Planta de interior', 'Monstera y ave del paraíso en matera de concreto.');
  std('pantalla', { color: 0x0b0b0c, roughness: 0.15, emissive: 0x9ec3ff, emissiveIntensity: 0.35 }, 'Monitor', '');
  std('cojinMascota', withTex(T.tela, 0.6, { color: 0xb5643a, roughness: 0.95 }), 'Cama para mascota', 'Nicho bajo la escalera, a la vista desde la entrada.');
  // sombra de contacto
  const sombra = new THREE.MeshBasicMaterial({ map: texSombra(), transparent: true, depthWrite: false, color: 0x000000, opacity: 0.6 });
  sombra.userData.noCast = true; sombra.userData.noRay = true; MAT.sombra = sombra;
  sombra.polygonOffset = true; sombra.polygonOffsetFactor = -2;

  for (const m of ALL_MATS) { if (m.map && m.map.anisotropy !== undefined) m.map.anisotropy = maxAniso; }
}
