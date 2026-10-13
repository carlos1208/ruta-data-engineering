"""Cronograma (Gantt) y flujo de caja de Casa Brisa.

Cada actividad tiene duración en semanas y predecesoras con desfase:
  "B3"      -> empieza cuando termina B3 (fin a inicio)
  "B3+2"    -> empieza 2 semanas después de que termina B3
  "B3:SS+2" -> empieza 2 semanas después de que EMPIEZA B3 (inicio a inicio)
El cálculo es el método de la ruta crítica: inicio temprano, holgura y ruta crítica.
Cada capítulo del presupuesto se reparte de forma pareja entre las semanas de las actividades
que lo ejecutan; así sale el flujo de caja mensual.
"""
import json, re
from datetime import date, timedelta
from pathlib import Path

AQUI = Path(__file__).parent
INICIO = date(2026, 11, 2)   # lunes: arranque de diseños

FASES = {"pre": "Diseño y licencia", "gris": "Obra gris", "acab": "Acabados e instalaciones", "ext": "Exteriores y entrega"}

ACT = [
    # id, nombre, fase, semanas, predecesoras, capítulos que paga (capítulo: fracción)
    ("A1", "Topografía y estudio de suelos", "pre", 3, [], {}),
    ("A2", "Diseños arquitectónico, estructural y técnicos", "pre", 10, ["A1:SS+1"], {}),
    ("A3", "Licencia de construcción en curaduría", "pre", 12, ["A2"], {}),
    ("A4", "Contratación y pedidos de largo plazo", "pre", 6, ["A2+2"], {}),
    ("B1", "Preliminares, cerramiento y replanteo", "gris", 2, ["A3"], {"Preliminares y obra provisional": 0.25}),
    ("B2", "Excavación y mejoramiento del suelo", "gris", 3, ["B1"], {"Movimiento de tierras y cimentación": 0.45}),
    ("B3", "Cimentación y placa de contrapiso", "gris", 4, ["B2"], {"Movimiento de tierras y cimentación": 0.55}),
    ("B4", "Columnas de PB y losa de entrepiso", "gris", 6, ["B3"], {"Estructura en concreto": 0.45}),
    ("B5", "Columnas de PA y losa de cubierta", "gris", 6, ["B4"], {"Estructura en concreto": 0.40}),
    ("B6", "Muro de contención y vaso de la piscina", "gris", 7, ["B3+1"], {"Estructura en concreto": 0.15, "Piscina y espejos de agua": 0.55}),
    ("B7", "Mampostería", "gris", 7, ["B4+1"], {"Mampostería": 1.0}),
    ("B8", "Redes hidrosanitarias, gas y eléctricas (tubería)", "gris", 9, ["B7:SS+2"],
     {"Instalaciones hidrosanitarias y gas": 0.6, "Instalaciones eléctricas y datos": 0.45}),
    ("B9", "Impermeabilización de cubierta y terrazas", "gris", 2, ["B5+2"], {"Cubiertas, impermeabilización y decks": 0.45}),
    ("C1", "Pañetes y cielos en drywall", "acab", 7, ["B7:SS+4", "B5"], {"Pañetes, estucos y pinturas": 0.55}),
    ("C2", "Ventanería y muro cortina", "acab", 4, ["C1:SS+3", "A4+12"], {"Ventanería, vidrios y barandas": 0.75}),
    ("C3", "Fachada en coralina, concreto visto y listones", "acab", 6, ["C1:SS+2"], {"Fachadas y madera": 0.8}),
    ("C4", "Pisos y enchapes (porcelanato, microcemento)", "acab", 7, ["C1+0"], {"Pisos y enchapes": 0.85}),
    ("C5", "Aire acondicionado y sistema solar", "acab", 3, ["C2"], {"Aire acondicionado": 1.0, "Energía solar": 1.0}),
    ("C6", "Piso de roble y decks de teca", "acab", 3, ["C4+1"], {"Pisos y enchapes": 0.15, "Cubiertas, impermeabilización y decks": 0.45}),
    ("C7", "Carpintería: cocina, closets y puertas", "acab", 4, ["C6:SS+1"], {"Carpintería en madera": 1.0}),
    ("C8", "Estuco, pintura y barandas de vidrio", "acab", 4, ["C7:SS+2"], {"Pañetes, estucos y pinturas": 0.45, "Ventanería, vidrios y barandas": 0.25}),
    ("C9", "Aparatos, griferías, iluminación y domótica", "acab", 3, ["C8:SS+2"],
     {"Aparatos sanitarios y griferías": 1.0, "Instalaciones hidrosanitarias y gas": 0.4, "Instalaciones eléctricas y datos": 0.55}),
    ("D1", "Acabados y equipos de la piscina", "ext", 4, ["B6", "C4:SS+2"], {"Piscina y espejos de agua": 0.45}),
    ("D2", "Exteriores, travertino y paisajismo", "ext", 5, ["C8:SS+1"], {"Exteriores y paisajismo": 1.0, "Cubiertas, impermeabilización y decks": 0.10, "Fachadas y madera": 0.2}),
    ("D3", "Acometidas definitivas, RETIE y pruebas", "ext", 3, ["C9:SS+1"], {"Acometidas y aseo final": 0.7}),
    ("D4", "Aseo, revisión y entrega", "ext", 2, ["D2", "D3", "D1", "C9"], {"Acometidas y aseo final": 0.3, "Preliminares y obra provisional": 0.0}),
]
HITOS = [("M1", "Licencia aprobada", "A3", "Licencia"), ("M2", "Estructura terminada", "B5", "Estructura"), ("M3", "Casa cerrada (ventanería)", "C2", "Casa cerrada"), ("M4", "Entrega", "D4", "Entrega")]

def cpm():
    by = {a[0]: {"id": a[0], "nombre": a[1], "fase": a[2], "dur": a[3], "pred": a[4], "caps": a[5]} for a in ACT}
    order = [a[0] for a in ACT]
    for k in order:
        a = by[k]; es = 0
        for p in a["pred"]:
            m = re.match(r"^([A-Z]\d+)(?::(SS))?([+-]\d+)?$", p)
            pid, ss, lag = m.group(1), m.group(2), int(m.group(3) or 0)
            b = by[pid]
            es = max(es, (b["es"] if ss else b["es"] + b["dur"]) + lag)
        a["es"] = es; a["ef"] = es + a["dur"]
    fin = max(a["ef"] for a in by.values())
    # holgura: pasada hacia atrás
    for a in by.values():
        a["ls"] = fin - a["dur"]
    for k in reversed(order):
        a = by[k]
        for p in a["pred"]:
            m = re.match(r"^([A-Z]\d+)(?::(SS))?([+-]\d+)?$", p)
            pid, ss, lag = m.group(1), m.group(2), int(m.group(3) or 0)
            b = by[pid]
            lim = a["ls"] - lag if ss else a["ls"] - lag - b["dur"]
            b["ls"] = min(b["ls"], lim)
    for a in by.values():
        a["holgura"] = a["ls"] - a["es"]; a["critica"] = a["holgura"] == 0
        a["inicio"] = (INICIO + timedelta(weeks=a["es"])).isoformat()
        a["fin"] = (INICIO + timedelta(weeks=a["ef"]) - timedelta(days=3)).isoformat()
    return by, order, fin

def flujo(by, presu, esc="medio"):
    caps = {c["capitulo"]: c[f"total_{esc}"] for c in presu["capitulos"]}
    semanas = max(a["ef"] for a in by.values())
    sem = [0.0] * semanas
    asignado = {k: 0.0 for k in caps}
    for a in by.values():
        for cap, frac in a["caps"].items():
            monto = caps[cap] * frac; asignado[cap] += frac
            for w in range(a["es"], a["ef"]):
                sem[w] += monto / a["dur"]
    falt = {k: round(1 - v_, 3) for k, v_ in asignado.items() if abs(1 - v_) > 0.001}
    # lo no asignado de un capítulo (gastos mensuales de obra) se reparte parejo en toda la obra física
    obra0 = range(by["B1"]["es"], by["D4"]["ef"])
    for k, fr in falt.items():
        for w in obra0: sem[w] += caps[k] * fr / len(obra0)
    falt = {}
    # indirectos: diseños, estudios, licencia e impuesto al comienzo; AIU, interventoría y pólizas parejos en la obra
    ind = {i["concepto"]: i["valor"] for i in presu["resumen"][esc]["indirectos"]}
    pre = [k for k in ind if any(t in k for t in ("Diseño", "Estudio", "Levantamiento", "Expensas", "delineación"))]
    by_ = by
    a2, a3 = by_["A2"], by_["A3"]
    for k in pre:
        rng = range(a2["es"], a2["ef"]) if ("Diseño" in k or "Estudio" in k or "Levantamiento" in k) else range(a3["ef"] - 1, a3["ef"])
        for w in rng: sem[w] += ind[k] / len(rng)
    obra = range(by_["B1"]["es"], by_["D4"]["ef"])
    for k in ind:
        if k not in pre:
            for w in obra: sem[w] += ind[k] / len(obra)
    # a meses calendario
    meses = {}
    for w, val in enumerate(sem):
        d = INICIO + timedelta(weeks=w)
        key = f"{d.year}-{d.month:02d}"
        meses[key] = meses.get(key, 0) + val
    return [{"mes": k, "valor": round(v_)} for k, v_ in sorted(meses.items())], falt

if __name__ == "__main__":
    presu = json.loads((AQUI / "presupuesto.json").read_text())
    by, order, fin = cpm()
    out = {"inicio": INICIO.isoformat(), "semanas": fin, "fases": FASES,
           "actividades": [{k: by[i][k] for k in ("id", "nombre", "fase", "dur", "es", "ef", "inicio", "fin", "holgura", "critica", "pred")} for i in order],
           "hitos": [{"id": h[0], "nombre": h[1], "corto": h[3], "semana": by[h[2]]["ef"], "fecha": by[h[2]]["fin"]} for h in HITOS]}
    for esc in ("bajo", "medio", "alto"):
        f, falt = flujo(by, presu, esc)
        out[f"flujo_{esc}"] = f
        if falt: print("capítulos sin repartir del todo:", esc, falt)
    (AQUI / "cronograma.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    for i in order:
        a = by[i]
        print(f"{i:3s} {a['nombre'][:44]:44s} sem {a['es']:3d}-{a['ef']:3d}  {a['inicio']} → {a['fin']}  holgura {a['holgura']:2d} {'CRÍTICA' if a['critica'] else ''}")
    print("Total semanas:", fin, "≈", round(fin / 4.345, 1), "meses; obra física:", by["D4"]["ef"] - by["B1"]["es"], "semanas")
