"""Arma la página del estudio de costos: incrusta presupuesto.json y cronograma.json en la plantilla.

Salidas:
  estudio-costos.html  cuerpo de la página (se publica como artefacto)
  index.html           la misma página con <!doctype html>, para abrirla localmente o servirla como sitio
"""
import json
from pathlib import Path

AQUI = Path(__file__).parent
P = json.loads((AQUI / "presupuesto.json").read_text())
C = json.loads((AQUI / "cronograma.json").read_text())

conf = {k: sum(1 for p in P["precios"].values() if p["confianza"] == k) for k in ("alta", "media", "baja")}
R = P["resumen"]["medio"]
edif = R["costo_directo"] - sum(c["total_medio"] for c in P["capitulos"]
                                if c["capitulo"] in ("Piscina y espejos de agua", "Exteriores y paisajismo", "Energía solar"))

area_txt = f"{P['area']:.1f}".replace(".", ",")
edif_m2 = f"{edif / P['area'] / 1e6:.2f}".replace(".", ",")

RIESGOS = [
    "Suelo: al occidente y suroccidente de Barranquilla hay arcillas expansivas. Si el estudio de suelos pide pilotes o una losa de cimentación, la cimentación puede costar el doble.",
    "Ladera: el muro de 3 m bajo el borde infinito supone un lote en pendiente. El Decreto 0893 de 2024 (mapa U-10) marca zonas de remoción en masa donde la curaduría exige estudios y obras de mitigación.",
    "Ventanería y piscina suman casi el 30 % del costo directo y son precios con pocas fuentes públicas: son las primeras partidas que hay que cotizar.",
    "Inflación de obra: el ICOCED anual va en 6,6 %. Lo que se pague en 2028 costará entre 5 y 7 % más que hoy.",
    "Mano de obra: el salario mínimo de 2026 subió 23 % y la jornada baja a 42 horas en julio de 2026; el ajuste de 2027 todavía no se conoce.",
    "Dólar: paneles, inversor, batería, aire acondicionado y griferías importadas se mueven con la tasa de cambio.",
]
METODO = (
    f"Método. Las cantidades se midieron sobre la geometría del modelo 3D ({area_txt} m² construidos) y se multiplicaron "
    f"por precios unitarios en tres escenarios. De los {len(P['precios'])} precios, {conf['alta']} tienen confianza alta, {conf['media']} media "
    f"y {conf['baja']} baja. La investigación se hizo con búsquedas web el 13 de octubre de 2026; cinco de los agentes de investigación no "
    "terminaron, y esos temas se completaron con búsquedas directas y estimaciones propias marcadas como tales. La verificación cruzada "
    "independiente no se ejecutó: el control se hizo contra las referencias de costo por m². La edificación sola, sin piscina, solar ni "
    f"exteriores, sale en {edif_m2} millones por m² de costo directo en el escenario medio, dentro del rango de vivienda de lujo "
    "en la Costa (4,0 a 6,0 millones por m², referencia B2)."
)

data = {"presupuesto": P, "cronograma": C, "riesgos": RIESGOS, "metodo": METODO}
js = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
html = (AQUI / "plantilla.html").read_text().replace("__DATA__", js)
(AQUI / "estudio-costos.html").write_text(html)
(AQUI / "index.html").write_text('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                                 + html.replace("<div class=\"wrap\">", "</head>\n<body>\n<div class=\"wrap\">", 1) + "\n</body>\n</html>\n")
print("ok", len(html) // 1024, "KB · edificación", round(edif / P["area"] / 1e6, 2), "M/m²", conf)
