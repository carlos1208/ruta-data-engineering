"""Presupuesto de obra de Casa Brisa (Barranquilla, precios de octubre de 2026).

Entrada:  investigacion.json  (precios unitarios investigados + correcciones del verificador)
          cantidades.py       (cantidades medidas sobre el modelo 3D)
Salida:   presupuesto.json    (lo consume la página del estudio)

Cada partida es cantidad × precio unitario. Los precios vienen de la investigación
(con su id: G2, F1, W1…). Cuando no hubo un precio publicado, la partida usa un
supuesto propio, marcado como tal en "base" y con confianza baja.
Tres escenarios: bajo, medio y alto, con los tres valores de cada precio.
"""
import json
from pathlib import Path

from cantidades import Q, AREA_TOTAL

AQUI = Path(__file__).parent
ESC = ("bajo", "medio", "alto")

inv = json.loads((AQUI / "investigacion.json").read_text())
P = {}
for tema in inv["prices"]:
    for it in tema["items"]:
        P[it["id"]] = dict(it, tema=tema["key"])
# correcciones del verificador: reemplazan el valor y suman la fuente
for c in inv["verdict"].get("correcciones", []):
    if c["id"] in P and min(c["bajo"], c["medio"], c["alto"]) > 0:
        p = P[c["id"]]
        p["original"] = {k: p[k] for k in ESC}
        for k in ESC:
            p[k] = c[k]
        p["correccion"] = c["problema"]
        p["fuentes"] = list(p.get("fuentes", [])) + [{"nombre": "Verificación", "url": u, "valor_reportado": ""} for u in c.get("fuentes", [])]
CONFIRMADOS = set(inv["verdict"].get("confirmados", []))

def v(pid, s):
    """precio unitario del id en el escenario s"""
    return float(P[pid][s])

def mo(pid, default):
    x = P.get(pid, {}).get("pct_mano_obra")
    return default if x is None else float(x)

SUPUESTOS = []   # supuestos propios: (clave, texto)
def sup(clave, texto, bajo, medio, alto):
    SUPUESTOS.append({"clave": clave, "texto": texto, "bajo": bajo, "medio": medio, "alto": alto})
    return {"bajo": bajo, "medio": medio, "alto": alto}

# jornal cargado (con prestaciones) promedio de una cuadrilla 1 oficial + 1 ayudante
def cuadrilla(s):
    return (v("L3", s) + v("L4", s)) * (1 + v("L5", s))

PARTIDAS = []
def partida(cap, nombre, qkey_or_num, unidad, precio, pct_mo, base, ids=()):
    """precio: función s -> precio unitario. pct_mo: fracción de mano de obra (número o función s -> número)."""
    cant = Q[qkey_or_num]["cantidad"] if isinstance(qkey_or_num, str) else qkey_or_num
    como = Q[qkey_or_num]["como"] if isinstance(qkey_or_num, str) else ""
    fila = {"capitulo": cap, "partida": nombre, "unidad": unidad, "cantidad": cant, "medicion": como, "base": base, "ids": list(ids)}
    for s in ESC:
        pu = precio(s)
        m = pct_mo(s) if callable(pct_mo) else pct_mo
        fila[f"pu_{s}"] = round(pu)
        fila[f"total_{s}"] = round(pu * cant)
        fila[f"mo_{s}"] = round(pu * cant * m)
    fila["confianza"] = min((P[i]["confianza"] for i in ids if i in P), key=["baja", "media", "alta"].index, default="baja")
    PARTIDAS.append(fila)
    return fila

# =====================================================================
# Costos directos
# =====================================================================
C1, C2, C3, C4, C5, C6, C7, C8, C9, C10 = (
    "Preliminares y obra provisional", "Movimiento de tierras y cimentación", "Estructura en concreto",
    "Mampostería", "Pañetes, estucos y pinturas", "Pisos y enchapes", "Fachadas y madera",
    "Cubiertas, impermeabilización y decks", "Instalaciones hidrosanitarias y gas", "Instalaciones eléctricas y datos")
C11, C12, C13, C14, C15, C16, C17, C18 = (
    "Aire acondicionado", "Carpintería en madera", "Ventanería, vidrios y barandas", "Aparatos sanitarios y griferías",
    "Piscina y espejos de agua", "Energía solar", "Exteriores y paisajismo", "Acometidas y aseo final")

# 1 · Preliminares
s_cerr = sup("cerramiento", "Cerramiento provisional con postes y polisombra: material por ml", 18000, 26000, 38000)
partida(C1, "Cerramiento provisional del lote", "cerramiento_provisional", "ml",
        lambda s: s_cerr[s] + 0.1 * cuadrilla(s), lambda s: 0.1 * cuadrilla(s) / (s_cerr[s] + 0.1 * cuadrilla(s)),
        "supuesto de material + 0,1 jornal de cuadrilla por ml (L3, L4, L5)", ["L3", "L4", "L5"])
s_camp = sup("campamento", "Contenedor-bodega y baño portátil: alquiler mensual", 1100000, 1500000, 2100000)
partida(C1, "Campamento, bodega y baño de obra", "meses_obra", "mes", lambda s: s_camp[s], 0.1, "supuesto de alquiler mensual")
s_serv = sup("servicios_prov", "Agua y energía provisionales de obra: consumo mensual", 550000, 850000, 1250000)
partida(C1, "Servicios provisionales de agua y energía", "meses_obra", "mes", lambda s: s_serv[s], 0.0, "supuesto de consumo mensual")
partida(C1, "Vigilancia nocturna", "meses_obra", "mes", lambda s: v("L1", s) * (1 + v("L5", s)) + v("L2", s), 1.0,
        "un vigilante con salario mínimo 2026 y factor prestacional (L1, L2, L5)", ["L1", "L2", "L5"])
partida(C1, "Localización, replanteo y control topográfico", "area_construida", "m²", lambda s: 0.6 * v("S7", s) / AREA_TOTAL, 0.8,
        "60 % de un levantamiento topográfico (S7) repartido por m²", ["S7"])

# 2 · Tierras y cimentación
partida(C2, "Excavación mecánica", "excavacion", "m³", lambda s: v("G9", s), lambda s: mo("G9", 0.25), "G9 (sin retiro)", ["G9"])
s_ret = sup("retiro", "Cargue, transporte y disposición de sobrantes en botadero autorizado, por m³ suelto", 28000, 38000, 55000)
partida(C2, "Retiro de sobrantes a botadero (80 % de lo excavado, con 25 % de esponjamiento)", round(Q["excavacion"]["cantidad"] * 0.8 * 1.25, 1), "m³", lambda s: s_ret[s], 0.2, "supuesto")
partida(C2, "Relleno con material seleccionado compactado (mejoramiento de suelo expansivo)", "relleno_seleccionado", "m³",
        lambda s: v("G10", s), lambda s: mo("G10", 0.3), "G10", ["G10"])
s_form = sup("formaleta", "Formaleta (alquiler + armado y desarme) por m² de contacto", 28000, 38000, 52000)
def concreto(gid, kg_m3, form_m2_m3):
    # G3 ya es acero suministrado, figurado e instalado (25 % de mano de obra)
    def f(s):
        return v(gid, s) + v("L14", s) + kg_m3 * v("G3", s) + form_m2_m3 * s_form[s]
    def m(s):
        return (v("L14", s) + kg_m3 * v("G3", s) * mo("G3", 0.25) + form_m2_m3 * s_form[s] * 0.6) / f(s)
    return f, m
f, m = concreto("G2", 90, 4.4)
partida(C2, "Zapatas y vigas de cimentación, concreto 28 MPa con acero", "concreto_cimentacion", "m³", f, m,
        "concreto G2 + vaciado L14 + 90 kg/m³ de acero instalado G3 + 4,4 m² de formaleta por m³", ["G2", "L14", "G3"])
partida(C2, "Placa de contrapiso de 10 cm con malla", "placa_contrapiso", "m²",
        lambda s: 0.105 * (v("G1", s) + v("L14", s)) + 3.2 * v("G3", s) + 0.04 * cuadrilla(s),
        lambda s: (0.105 * v("L14", s) + 3.2 * v("G3", s) * 0.25 + 0.04 * cuadrilla(s)) / (0.105 * (v("G1", s) + v("L14", s)) + 3.2 * v("G3", s) + 0.04 * cuadrilla(s)),
        "0,105 m³ de concreto G1 + 3,2 kg de malla instalada (G3) + afinado", ["G1", "L14", "G3"])

# 3 · Estructura
f, m = concreto("G2", 160, 11.4)
partida(C3, "Columnas en concreto 28 MPa", "concreto_columnas", "m³", f, m, "G2 + L14 + 160 kg/m³ de acero instalado (G3) + 11,4 m² de formaleta por m³", ["G2", "L14", "G3"])
partida(C3, "Losa de entrepiso de 30 cm con vigas, voladizos y balcones", "losa_entrepiso", "m²", lambda s: v("G7", s), lambda s: mo("G7", 0.3), "G7", ["G7"])
partida(C3, "Losa de cubierta con pórtico norte y aleros", "losa_cubierta", "m²", lambda s: v("G7", s), lambda s: mo("G7", 0.3), "G7", ["G7"])
f, m = concreto("G2", 110, 7.0)
partida(C3, "Escalera en U: tramo macizo, descanso y espina de concreto", 3.5, "m³", f, m, "3,5 m³ con 110 kg/m³ de acero y 7 m² de formaleta por m³", ["G2", "L14", "G3"])
f, m = concreto("G1", 110, 4.2)
partida(C3, "Muro de contención de 3 m bajo el borde infinito", 39.6, "m³", f, m,
        "73 m² de muro de 30 cm + zapata de 24,4 × 1,8 × 0,4 m = 39,6 m³ de concreto G1 con 110 kg/m³ de acero", ["G1", "L14", "G3"])
partida(C3, "Sobrecosto de concreto a la vista con formaleta de tabla", "concreto_visto", "m²", lambda s: v("G13", s), lambda s: mo("G13", 0.5), "G13", ["G13"])

# 4 · Mampostería
def mamp(s):
    mortero = 0.02 * (8.5 * v("G5", s) + 1.1 * v("G6", s))
    return (v("G4", s) + mortero + v("L10", s)) * 1.12
partida(C4, "Muros en bloque con mortero, dovelas y vigas de amarre", "mamposteria", "m²", mamp,
        lambda s: v("L10", s) * 1.12 / mamp(s), "bloque G4 + 0,02 m³ de mortero (G5, G6) + mano de obra L10, +12 % por refuerzo y amarres", ["G4", "G5", "G6", "L10"])

# 5 · Pañetes, estucos y pinturas
partida(C5, "Pañete de muros", "panete", "m²", lambda s: v("F11", s), lambda s: mo("F11", 0.55), "F11", ["F11"])
partida(C5, "Estuco y pintura interior", "estuco_pintura_int", "m²", lambda s: v("F5", s), lambda s: mo("F5", 0.55), "F5", ["F5"])
partida(C5, "Cielo raso en drywall con pintura", "drywall_cielo", "m²", lambda s: v("F7", s), lambda s: mo("F7", 0.4), "F7", ["F7"])
partida(C5, "Pintura elastomérica de fachada y aleros", "pintura_fachada", "m²", lambda s: v("F6", s), lambda s: mo("F6", 0.5), "F6", ["F6"])

# 6 · Pisos y enchapes
s_alis = sup("alistado", "Alistado de piso en mortero de nivelación (material + mano de obra)", 24000, 32000, 42000)
partida(C6, "Alistado de pisos bajo porcelanato, madera y microcemento", 89.65 + 66.1 + 45, "m²", lambda s: s_alis[s], 0.55, "supuesto")
s_pega = sup("pegante_gf", "Pegante flexible y sistema de nivelación para gran formato, por m²", 14000, 19000, 26000)
def porc(s):
    return 1.08 * v("F1", s) + v("L13", s) + s_pega[s]
partida(C6, "Porcelanato símil mármol 120×120 instalado (8 % de desperdicio)", "porcelanato", "m²", porc, lambda s: v("L13", s) / porc(s),
        "material F1 × 1,08 + instalación L13 + pegante y niveladores (supuesto)", ["F1", "L13"])
partida(C6, "Piso de roble de ingeniería instalado", "roble", "m²", lambda s: v("F2", s), lambda s: mo("F2", 0.2), "F2", ["F2"])
partida(C6, "Microcemento en pisos y muros de baño", "microcemento", "m²", lambda s: v("F3", s), lambda s: mo("F3", 0.45), "F3", ["F3"])
s_cpul = sup("concreto_pulido", "Endurecedor, pulido y sellado de placa de garaje", 45000, 65000, 90000)
partida(C6, "Concreto pulido y sellado en garaje", "concreto_pulido", "m²", lambda s: s_cpul[s], 0.5, "supuesto")

# 7 · Fachadas y madera
partida(C7, "Enchape de piedra coralina (fachadas, muro de contención y jardineras)", "coralina", "m²", lambda s: v("F4", s), lambda s: mo("F4", 0.35), "F4", ["F4"])
partida(C7, "Listones de madera: cielo de sala, celosías, pérgola y muro de TV", "listones_madera", "m²", lambda s: v("F10", s), lambda s: mo("F10", 0.35), "F10", ["F10"])
s_perg = sup("pergola_metal", "Estructura metálica de pérgola y celosías (≈350 kg) suministrada, pintada e instalada", 7000000, 9500000, 13000000)
partida(C7, "Estructura metálica de pérgola y celosías", 1, "global", lambda s: s_perg[s], 0.4, "supuesto")

# 8 · Cubiertas, impermeabilización y decks
partida(C8, "Impermeabilización de cubierta, terrazas y balcones", "impermeabilizacion", "m²", lambda s: v("G12", s), lambda s: mo("G12", 0.35), "G12", ["G12"])
partida(C8, "Cubierta verde extensiva", "cubierta_verde", "m²", lambda s: v("F12", s), lambda s: mo("F12", 0.35), "F12", ["F12"])
s_grav = sup("gravilla", "Gravilla blanca de 3 cm sobre cubierta, por m²", 12000, 18000, 26000)
partida(C8, "Gravilla de protección en cubierta", "gravilla", "m²", lambda s: s_grav[s], 0.4, "supuesto")
partida(C8, "Deck de teca en terraza, balcones y patio de servicio", "deck_teca", "m²", lambda s: v("F8", s), lambda s: mo("F8", 0.3), "F8", ["F8"])

# 9 · Hidrosanitarias y gas
partida(C9, "Red hidrosanitaria completa (fría, caliente, desagües y aguas lluvias)", "area_construida", "m²", lambda s: v("M3", s), lambda s: mo("M3", 0.45), "M3", ["M3"])
partida(C9, "Red interna de gas natural", 1, "global", lambda s: v("M4", s), lambda s: mo("M4", 0.5), "M4", ["M4"])
partida(C9, "Calentador de agua", 1, "und", lambda s: v("W15", s), lambda s: mo("W15", 0.1), "W15", ["W15"])

# 10 · Eléctricas
partida(C10, "Instalación eléctrica con tableros y certificación RETIE", "area_construida", "m²", lambda s: v("M1", s), lambda s: mo("M1", 0.45), "M1", ["M1"])
partida(C10, "Iluminación LED interior y exterior", "area_construida", "m²", lambda s: v("M2", s), lambda s: mo("M2", 0.2), "M2", ["M2"])
partida(C10, "Domótica básica de iluminación y escenas", 1, "global", lambda s: v("M15", s), lambda s: mo("M15", 0.3), "M15", ["M15"])
partida(C10, "Red de datos, CCTV y citofonía", 1, "global", lambda s: v("M16", s), lambda s: mo("M16", 0.3), "M16", ["M16"])

# 11 · Aire acondicionado
partida(C11, "Mini split inverter de 12.000 BTU instalado", "aa_12k", "und", lambda s: v("M5", s), lambda s: mo("M5", 0.2), "M5", ["M5"])
partida(C11, "Mini split inverter de 24.000 BTU instalado", "aa_24k", "und", lambda s: v("M7", s), lambda s: mo("M7", 0.2), "M7", ["M7"])

# 12 · Carpintería
partida(C12, "Cocina integral de alta gama con isla", "cocina", "ml", lambda s: v("W6", s), lambda s: mo("W6", 0.25), "W6", ["W6"])
partida(C12, "Muebles de lavandería y despensa", "muebles_servicio", "ml", lambda s: 0.45 * v("W6", s), lambda s: mo("W6", 0.25), "45 % del ml de cocina W6 (carpintería estándar)", ["W6"])
partida(C12, "Closets y vestier", "closets", "ml", lambda s: v("W7", s), lambda s: mo("W7", 0.25), "W7", ["W7"])
partida(C12, "Puertas interiores con marco y herrajes", "puertas_interiores", "und", lambda s: v("W8", s), lambda s: mo("W8", 0.2), "W8", ["W8"])
partida(C12, "Puerta principal pivotante en teca de 1,40 × 3,00 m", "puerta_pivotante", "und", lambda s: v("W4", s), lambda s: mo("W4", 0.15), "W4", ["W4"])
partida(C12, "Muebles de baño flotantes", "muebles_bano", "und", lambda s: v("W14", s), lambda s: mo("W14", 0.15), "W14", ["W14"])
partida(C12, "Mesones en porcelánico o cuarzo", "mesones", "ml", lambda s: v("W16", s), lambda s: mo("W16", 0.2), "W16", ["W16"])

# 13 · Ventanería, vidrios y barandas
partida(C13, "Ventanería de aluminio negro con vidrio de control solar", "ventaneria", "m²", lambda s: v("W1", s), lambda s: mo("W1", 0.2), "W1", ["W1"])
partida(C13, "Muro cortina de doble altura en el vestíbulo", "muro_cortina", "m²", lambda s: v("W2", s), lambda s: mo("W2", 0.2), "W2", ["W2"])
partida(C13, "Barandas de vidrio laminado templado", "baranda_vidrio", "ml", lambda s: v("W3", s), lambda s: mo("W3", 0.2), "W3", ["W3"])
s_div = sup("division_bano", "Vidrio templado de 10 mm para ducha con herrajes, por m²", 380000, 520000, 750000)
partida(C13, "Divisiones de ducha en vidrio templado", "divisiones_bano", "m²", lambda s: s_div[s], 0.2, "supuesto")
s_esp = sup("espejo", "Espejo plata de 6 mm instalado, por m²", 160000, 230000, 340000)
partida(C13, "Espejos", "espejos", "m²", lambda s: s_esp[s], 0.25, "supuesto")
partida(C13, "Puertas de garaje seccionales motorizadas", "puertas_garaje", "und", lambda s: v("W5", s), lambda s: mo("W5", 0.15), "W5", ["W5"])

# 14 · Aparatos
partida(C14, "Sanitarios suspendidos con tanque empotrado", "sanitarios", "und", lambda s: v("W9", s), lambda s: mo("W9", 0.15), "W9", ["W9"])
partida(C14, "Lavamanos de sobreponer", "lavamanos", "und", lambda s: v("W13", s), lambda s: mo("W13", 0.1), "W13", ["W13"])
partida(C14, "Griferías de lavamanos", "lavamanos", "und", lambda s: v("W10", s), lambda s: mo("W10", 0.1), "W10", ["W10"])
partida(C14, "Duchas completas con regadera tipo lluvia", "duchas", "und", lambda s: v("W11", s), lambda s: mo("W11", 0.1), "W11", ["W11"])
partida(C14, "Bañera exenta con grifería de piso", "banera", "und", lambda s: v("W12", s) + 2.5 * v("W10", s), lambda s: mo("W12", 0.08), "W12 + grifería de piso (2,5 × W10)", ["W12", "W10"])
s_lav = sup("lavaplatos", "Lavaplatos de submontar, grifería de cocina, lavadero y ducha de mascotas", 2200000, 3600000, 6000000)
partida(C14, "Lavaplatos, lavadero y ducha de mascotas con griferías", 1, "global", lambda s: s_lav[s], 0.1, "supuesto")
s_acc = sup("accesorios", "Accesorios de baño (toallero, papelera, ganchos) por baño", 450000, 800000, 1400000)
partida(C14, "Accesorios de baño", 4, "baño", lambda s: s_acc[s], 0.1, "supuesto")

# 15 · Piscina
partida(C15, "Piscina de borde infinito: vaso, impermeabilización, mosaico y canal de rebose", "piscina_m2", "m²", lambda s: v("P1", s), lambda s: mo("P1", 0.35), "P1", ["P1"])
partida(C15, "Equipo de filtración y bombeo", 1, "global", lambda s: v("P2", s), lambda s: mo("P2", 0.15), "P2", ["P2"])
partida(C15, "Iluminación LED subacuática", 1, "global", lambda s: v("P3", s), lambda s: mo("P3", 0.15), "P3", ["P3"])
partida(C15, "Espejos de agua de la entrada", "espejo_agua", "m²", lambda s: v("P5", s), lambda s: mo("P5", 0.35), "P5", ["P5"])

# 16 · Energía solar
partida(C16, "Sistema fotovoltaico de 9,9 kWp conectado a red", "solar_kwp", "kWp", lambda s: v("M9", s), lambda s: mo("M9", 0.15), "M9", ["M9"])
partida(C16, "Batería de litio de respaldo", "bateria_kwh", "kWh", lambda s: v("M10", s), lambda s: mo("M10", 0.05), "M10", ["M10"])
partida(C16, "Mayor valor del inversor híbrido frente al de red", 1, "und", lambda s: 0.5 * v("M11", s), lambda s: mo("M11", 0.05), "50 % de M11", ["M11"])

# 17 · Exteriores
partida(C17, "Travertino en el deck de la piscina", "travertino", "m²", lambda s: v("F9", s), lambda s: mo("F9", 0.3), "F9", ["F9"])
partida(C17, "Losetas de concreto con junta verde en el acceso vehicular", "losetas", "m²", lambda s: v("P10", s), lambda s: mo("P10", 0.35), "P10", ["P10"])
partida(C17, "Sendero flotante en concreto con LED", "sendero", "m²",
        lambda s: 0.15 * (v("G1", s) + v("L14", s)) + 12 * v("G3", s) + 2 * s_form[s] + 60000,
        0.35, "0,15 m³ de concreto G1 + 12 kg de acero instalado + formaleta + $60.000 de LED por m² (supuesto)", ["G1", "L14", "G3"])
partida(C17, "Grama", "grama", "m²", lambda s: v("P6", s), lambda s: mo("P6", 0.4), "P6", ["P6"])
partida(C17, "Palmas sembradas de 6 a 7 m", "palmas", "und", lambda s: v("P7", s), lambda s: mo("P7", 0.3), "P7", ["P7"])
partida(C17, "Guayacanes sembrados", "arboles", "und", lambda s: v("P8", s), lambda s: mo("P8", 0.3), "P8", ["P8"])
partida(C17, "Setos de lindero", "setos", "ml", lambda s: v("P9", s), lambda s: mo("P9", 0.3), "P9", ["P9"])
partida(C17, "Muro bajo frontal en coralina", "cerramiento_frontal", "ml", lambda s: 2 * 0.45 * v("F4", s) + 0.45 * mamp(s), 0.4,
        "dos caras de 0,45 m de coralina (F4) sobre núcleo de bloque", ["F4", "G4"])
s_masc = sup("mascotas", "Casa de mascotas de dos niveles en teca, rampa, cerca de 15 ml y bebederos", 6500000, 9500000, 14000000)
partida(C17, "Patio de mascotas: casa de dos niveles, rampa y cerca", 1, "global", lambda s: s_masc[s], 0.45, "supuesto")
s_bar_ext = sup("muebles_fijos_ext", "Barandas y portones de los patios de servicio y mascotas", 1800000, 2800000, 4200000)
partida(C17, "Portones de los patios", 1, "global", lambda s: s_bar_ext[s], 0.3, "supuesto")

# 18 · Acometidas y aseo
partida(C18, "Acometida y conexión eléctrica con Air-e", 1, "global", lambda s: v("M13", s), lambda s: mo("M13", 0.4), "M13", ["M13"])
partida(C18, "Acometida de acueducto y alcantarillado con Triple A", 1, "global", lambda s: v("M14", s), lambda s: mo("M14", 0.4), "M14", ["M14"])
partida(C18, "Aseo final y entrega", "area_construida", "m²", lambda s: 0.015 * cuadrilla(s) * 2, 0.9, "0,03 jornales de cuadrilla por m² (L3, L4, L5)", ["L3", "L4", "L5"])

# =====================================================================
# Totales
# =====================================================================
CAPS = []
for cap in dict.fromkeys(p["capitulo"] for p in PARTIDAS):
    filas = [p for p in PARTIDAS if p["capitulo"] == cap]
    c = {"capitulo": cap}
    for s in ESC:
        c[f"total_{s}"] = sum(f[f"total_{s}"] for f in filas)
        c[f"mo_{s}"] = sum(f[f"mo_{s}"] for f in filas)
    CAPS.append(c)

def indirectos(s, CD):
    out = []
    def add(nombre, valor, base, ids=()):
        out.append({"concepto": nombre, "valor": round(valor), "base": base, "ids": list(ids)})
    # diseños
    s2 = v("S2", s); s2u = P["S2"]["unidad"]
    dis_arq = s2 / 100 * CD if "%" in s2u else s2 * AREA_TOTAL
    add("Diseño arquitectónico", dis_arq, f"S2 ({s2u})", ["S2"])
    add("Diseño estructural NSR-10", v("S3", s) * AREA_TOTAL, "S3 × m²", ["S3"])
    add("Diseños eléctrico RETIE e hidrosanitario", v("S4", s), "S4", ["S4"])
    add("Estudio de suelos", v("S1", s), "S1", ["S1"])
    add("Levantamiento topográfico", v("S7", s), "S7", ["S7"])
    add("Expensas de licencia de construcción (curaduría)", v("S5", s), "S5", ["S5"])
    aiu = v("B4", s) / 100
    contrato = CD * (1 + aiu)
    base_deli = max(contrato, v("B7", s) * AREA_TOTAL)
    add("Impuesto de delineación urbana (3 %)", v("B6", s) / 100 * base_deli, "B6 sobre el mayor entre el valor de la obra y el mínimo B7 × m²", ["B6", "B7"])
    add("Interventoría o supervisión técnica", v("S6", s) / 100 * CD, "S6 × costo directo", ["S6"])
    add("AIU del constructor (administración, imprevistos y utilidad)", aiu * CD, "B4 × costo directo", ["B4"])
    util = 0.30 * aiu * CD   # supuesto: la utilidad es cerca del 30 % del AIU
    add("IVA del 19 % sobre la utilidad", v("B8", s) / 100 * util, "B8 × utilidad (≈30 % del AIU)", ["B8"])
    add("Pólizas de cumplimiento y responsabilidad civil", v("S8", s) / 100 * contrato, "S8 × valor del contrato", ["S8"])
    return out

RES = {}
for s in ESC:
    CD = sum(p[f"total_{s}"] for p in PARTIDAS)
    MO = sum(p[f"mo_{s}"] for p in PARTIDAS)
    ind = indirectos(s, CD)
    TOT = CD + sum(i["valor"] for i in ind)
    RES[s] = {"costo_directo": CD, "mano_obra": MO, "materiales": CD - MO, "indirectos": ind, "total": TOT,
              "por_m2_directo": CD / AREA_TOTAL, "por_m2_total": TOT / AREA_TOTAL}

if __name__ == "__main__":
    out = {"area": AREA_TOTAL, "partidas": PARTIDAS, "capitulos": CAPS, "resumen": RES, "supuestos": SUPUESTOS,
           "precios": P, "confirmados": sorted(CONFIRMADOS)}
    (AQUI / "presupuesto.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    M = 1e6
    for c in CAPS:
        print(f"{c['capitulo'][:46]:46s} {c['total_bajo']/M:8.1f} {c['total_medio']/M:8.1f} {c['total_alto']/M:8.1f}")
    for s in ESC:
        r = RES[s]
        print(f"\n{s.upper()}: directo {r['costo_directo']/M:,.0f} M  ({r['por_m2_directo']/M:.2f} M/m²)  MO {r['mano_obra']/r['costo_directo']:.0%}  total {r['total']/M:,.0f} M ({r['por_m2_total']/M:.2f} M/m²)")
        for i in r["indirectos"]:
            print(f"   {i['concepto'][:55]:55s} {i['valor']/M:8.1f}")
