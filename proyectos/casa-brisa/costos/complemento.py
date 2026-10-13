"""Precios que la investigación automática no alcanzó a traer (5 agentes se detuvieron por el
límite de la sesión). Se completan con búsquedas directas del 13-oct-2026 y, donde no hay
precio publicado, con una estimación propia razonada (confianza baja).

Cada ítem: id, concepto, unidad, bajo, medio, alto, alcance, pct_mano_obra, confianza, nota, fuentes.
"""
import json
from pathlib import Path

AQUI = Path(__file__).parent
PROPIA = {"nombre": "Estimación propia (sin precio publicado encontrado)", "url": "", "valor_reportado": "ver nota"}

def F(nombre, url, valor):
    return {"nombre": nombre, "url": url, "valor_reportado": valor}

VENT = [
    F("Diseños y Estructuras JH, lista 2026 (Bogotá)", "https://disenosyestructurasjh.com/producto/ventana-corrediza/", "corrediza instalada desde $270.000/m² (Serie 33), $315.000 (7-44), $490.000 (80-25), termoacústica desde $800.000/m², más IVA"),
    F("Vidrios x Metro", "https://vidriosxmetro.com/preguntas-frecuentes/cuanto-vale-el-vidrio-templado-por-m%C2%B2/", "vidrio templado $150.000-350.000/m² (2025) sin instalación"),
]
SOLAR = [
    F("OPS Colombia, guía 2026", "https://www.opscolombia.com/blog/cuanto-cuesta-realmente-un-sistema-solar-en-colombia", "$3,5-5 millones por kWp instalado, conectado a red sin baterías"),
    F("Voltiva, precios 2026", "https://www.voltiva.com.co/blog/cuanto-cuesta-instalar-paneles-solares-colombia", "10 kWp: $32-45 millones; 5 kWp: $18-25 millones"),
    F("Solartech, precios 2026", "https://solartech.com.co/precios-paneles-solares-colombia/", "8-10 kWp: $30-42 millones"),
]
PISC = [
    F("Constructora J. Hernández, cotizador 2026", "https://cotizar2026.constructorajhdez.com/", "piscina en concreto tradicional $60-120 millones"),
    F("Piscinas Bluespace", "https://piscinasbluespace.com/cuanto-cuesta-una-piscina-en-colombia/", "7 × 4 m: $50-80 millones (Medellín)"),
    F("Mantenimiento de Albercas", "https://mantenimientoalbercas.com/cuanto-vale-la-construccion-de-una-piscina-en-colombia/", "promedio $30-80 millones"),
]
COCINA = [
    F("Roomix, renovar cocina 2026", "https://roomix.ai/blog/cuanto-cuesta-renovar-cocina-2026", "muebles por ml sin mesón: melamina premium $400-600 mil, laqueado $600-900 mil, madera maciza $0,8-1,2 millones"),
    F("Cuánto me cuesta, cocina integral (abr-2026)", "https://cuantomecuesta.com/co/cocina-integral/", "cocina mediana $25-35 millones con mano de obra; premium importada hasta $120 millones o más"),
]
AA = [F("Cuánto me cuesta, aire acondicionado (abr-2026)", "https://cuantomecuesta.com/co/aire-acondicionado/", "mini split inverter 12.000-24.000 BTU ≈ $5 millones instalado (rango $3-15 millones); instalación $0,3-4 millones")]
ELEC = [F("OneEstimate, APU instalaciones eléctricas", "https://oneestimate.ai/blog/apu-instalaciones-electricas-construccion", "salida de iluminación $84.252 con AIU 18 %; eléctricas 5-8 % e hidrosanitarias 6-10 % del costo directo")]
EXP = [
    F("Curaduría 1 de Medellín, fórmula de expensas", "https://curaduria1medellin.com/descargas/expensas.pdf", "Cf = 10,01 UVT; estrato 6: i = 2,5; m = 0,938"),
    F("Curaduría 1, tabla de expensas 2026 (Decreto 1890 de 2021)", "https://curaduria1.com.co/wp-content/uploads/2026/01/TABLA%20EXPENSAS%202026%20v2%20DECRETO%201890.pdf", "UVT 2026 = $52.374; Cv estrato 6 ≈ $2.621.319"),
]

def item(id_, concepto, unidad, b, m, a, alcance, mo, conf, nota, fuentes):
    return {"id": id_, "concepto": concepto, "unidad": unidad, "bajo": b, "medio": m, "alto": a, "alcance": alcance,
            "pct_mano_obra": mo, "confianza": conf, "nota": nota, "fuentes": fuentes}

carp = [
    item("W1", "Ventanería de aluminio negro con vidrio laminado de control solar, corrediza de piso a techo, s&i", "COP/m²", 650000, 900000, 1300000, "suministro_e_instalacion", 0.2, "media",
         "Las series básicas instaladas en Bogotá arrancan en $270.000/m² y la termoacústica en $800.000/m² más IVA. Esta casa usa hojas grandes de piso a techo, perfil pesado anodizado negro y vidrio laminado de control solar, por eso el rango arranca por encima de la serie 80-25 con IVA. Barranquilla tiene fabricantes de primer nivel (Tecnoglass), lo que ayuda a conseguir el valor bajo.", VENT),
    item("W2", "Muro cortina / fachada flotante de doble altura", "COP/m²", 900000, 1250000, 1800000, "suministro_e_instalacion", 0.2, "baja",
         "Sin precio publicado. Se estima un 35-40 % por encima de W1 por la perfilería estructural de 6 m, el anclaje a losa y el vidrio laminado de mayor espesor.", [PROPIA] + VENT[:1]),
    item("W3", "Baranda de vidrio laminado templado 10+10 con perfil de piso", "COP/ml", 900000, 1300000, 1900000, "suministro_e_instalacion", 0.2, "baja",
         "Sin precio publicado de 2026. 1,05 m² de vidrio laminado templado por ml (≈$400-600 mil) + perfil de aluminio empotrado + pasamanos de acero + instalación.", [PROPIA] + VENT[1:]),
    item("W4", "Puerta principal pivotante en teca maciza 1,40 × 3,00 m con pivote", "COP/und", 9000000, 14000000, 22000000, "suministro_e_instalacion", 0.15, "baja",
         "Sin precio publicado. 4,2 m² de hoja maciza en teca con alma estructural, pivote de piso de alta carga y cerradura de seguridad.", [PROPIA]),
    item("W5", "Puerta de garaje seccional motorizada 2,35 × 2,40", "COP/und", 7000000, 9500000, 13000000, "suministro_e_instalacion", 0.15, "baja",
         "Sin precio publicado de 2026. Panel aislado de aluminio con acabado madera, motor con control y sensores.", [PROPIA]),
    item("W6", "Cocina integral de alta gama (muebles, herrajes, sin mesón ni electrodomésticos)", "COP/ml", 2200000, 3200000, 5000000, "suministro_e_instalacion", 0.25, "baja",
         "Las guías de 2026 dan $0,8-1,2 millones por ml en madera maciza sin mesón; una cocina con torres de piso a techo, enchape de nogal, herrajes de cierre suave e isla con caídas suma bajo y alto por ml lineal de planta, así que se toma 2,5-4 veces ese valor.", COCINA),
    item("W7", "Closet o vestier de piso a techo en madera", "COP/ml", 1100000, 1600000, 2400000, "suministro_e_instalacion", 0.25, "baja",
         "Se toma 50 % del valor por ml de la cocina: misma carpintería, sin isla ni torres de electrodomésticos.", [PROPIA] + COCINA[:1]),
    item("W8", "Puerta interior maciza con marco y herrajes, s&i", "COP/und", 900000, 1300000, 2000000, "suministro_e_instalacion", 0.2, "baja", "Sin precio publicado de 2026.", [PROPIA]),
    item("W9", "Sanitario suspendido con tanque empotrado", "COP/und", 1600000, 2400000, 3600000, "material", 0.15, "baja", "Sin precio publicado. Incluye estructura empotrada y pulsador.", [PROPIA]),
    item("W10", "Grifería de lavamanos de alta gama", "COP/und", 400000, 750000, 1400000, "material", 0.1, "baja", "Sin precio publicado.", [PROPIA]),
    item("W11", "Ducha completa con mezclador empotrado y regadera tipo lluvia", "COP/und", 1200000, 2000000, 3500000, "material", 0.1, "baja", "Sin precio publicado.", [PROPIA]),
    item("W12", "Bañera exenta de 1,70 m en solid surface", "COP/und", 4500000, 7000000, 12000000, "material", 0.08, "baja", "Sin precio publicado.", [PROPIA]),
    item("W13", "Lavamanos de sobreponer", "COP/und", 350000, 600000, 1100000, "material", 0.1, "baja", "Sin precio publicado.", [PROPIA]),
    item("W14", "Mueble de baño flotante", "COP/und", 1400000, 2200000, 3500000, "suministro_e_instalacion", 0.15, "baja", "Promedio de un vanity doble y tres sencillos.", [PROPIA]),
    item("W15", "Calentador de agua de paso a gas de alta capacidad", "COP/und", 2500000, 4000000, 7000000, "suministro_e_instalacion", 0.1, "baja", "El valor alto corresponde a bomba de calor.", [PROPIA]),
    item("W16", "Mesón en porcelánico Calacatta de 12 mm", "COP/ml", 900000, 1300000, 2000000, "suministro_e_instalacion", 0.2, "baja", "Sin precio publicado; incluye corte, cantos y caídas en cascada de la isla.", [PROPIA]),
]
inst = [
    item("M1", "Instalación eléctrica completa con tableros y RETIE", "COP/m²", 170000, 230000, 320000, "suministro_e_instalacion", 0.45, "baja",
         "Las guías ubican las eléctricas en 5-8 % del costo directo; con un costo directo de $4-4,5 millones/m² eso da $200-360 mil/m². Coherente con unas 160 salidas a ~$84.000 más tableros, acometida interna y puesta a tierra.", ELEC),
    item("M2", "Iluminación LED interior y exterior (luminarias)", "COP/m²", 60000, 95000, 150000, "material", 0.2, "baja", "Sin precio publicado.", [PROPIA]),
    item("M3", "Red hidrosanitaria completa (fría, caliente, desagües, aguas lluvias)", "COP/m²", 150000, 210000, 290000, "suministro_e_instalacion", 0.45, "baja",
         "Las guías ubican las hidrosanitarias en 6-10 % del costo directo; con 4 baños, cocina, lavandería y aguas lluvias de cubierta se toma la parte baja de ese rango.", ELEC),
    item("M4", "Red interna de gas natural", "COP/global", 2500000, 3500000, 5000000, "suministro_e_instalacion", 0.5, "baja", "Sin precio publicado.", [PROPIA]),
    item("M5", "Mini split inverter de 12.000 BTU instalado", "COP/und", 2800000, 3600000, 4800000, "suministro_e_instalacion", 0.2, "media",
         "Una calculadora colombiana de 2026 da unos $5 millones para equipos de 12.000-24.000 BTU instalados; para 12.000 BTU se toma la parte baja.", AA),
    item("M7", "Mini split inverter de 24.000 BTU instalado", "COP/und", 4600000, 6000000, 8000000, "suministro_e_instalacion", 0.2, "media", "Misma fuente que M5, parte alta del rango.", AA),
    item("M9", "Sistema solar fotovoltaico conectado a red, instalado y legalizado", "COP/kWp", 3400000, 4000000, 4700000, "suministro_e_instalacion", 0.15, "media",
         "Varias guías de 2026 coinciden en $3,5-5 millones por kWp con RETIE y trámites ante el operador de red. La exclusión de IVA de la Ley 1715 ya se refleja en esos precios de mercado.", SOLAR),
    item("M10", "Batería de litio (LFP) para respaldo", "COP/kWh", 1600000, 2200000, 3000000, "suministro_e_instalacion", 0.05, "baja", "Sin precio publicado de 2026 en pesos.", [PROPIA]),
    item("M11", "Inversor híbrido de 10 kW", "COP/und", 9000000, 12000000, 16000000, "material", 0.05, "baja", "Sin precio publicado; en el presupuesto solo entra el 50 % como mayor valor frente al inversor de red.", [PROPIA]),
    item("M13", "Acometida y conexión eléctrica con Air-e", "COP/global", 4000000, 6000000, 9000000, "suministro_e_instalacion", 0.4, "baja", "Sin precio publicado; incluye medidor bidireccional para el sistema solar.", [PROPIA]),
    item("M14", "Acometida de acueducto y alcantarillado con Triple A", "COP/global", 2500000, 4000000, 6000000, "suministro_e_instalacion", 0.4, "baja", "Sin precio publicado.", [PROPIA]),
    item("M15", "Domótica básica (iluminación y escenas)", "COP/global", 6000000, 12000000, 25000000, "suministro_e_instalacion", 0.3, "baja", "Sin precio publicado.", [PROPIA]),
    item("M16", "Red de datos, CCTV y citofonía", "COP/global", 4000000, 7000000, 12000000, "suministro_e_instalacion", 0.3, "baja", "Sin precio publicado.", [PROPIA]),
]
pisc = [
    item("P1", "Piscina de borde infinito en concreto: vaso, impermeabilización, mosaico vítreo y canal de rebose", "COP/m²", 2200000, 3000000, 4200000, "suministro_e_instalacion", 0.35, "media",
         "Las piscinas de concreto tradicionales cuestan $60-120 millones; una de 7 × 4 m, $50-80 millones, es decir $1,8-2,9 millones por m². El borde infinito agrega el canal de rebose, el tanque de compensación y un muro con tolerancia milimétrica, por eso el rango sube.", PISC),
    item("P2", "Equipo de filtración, bombeo y tanque de compensación", "COP/global", 12000000, 18000000, 28000000, "suministro_e_instalacion", 0.15, "baja", "Sin precio publicado.", [PROPIA]),
    item("P3", "Iluminación LED subacuática", "COP/global", 3000000, 5000000, 8000000, "suministro_e_instalacion", 0.15, "baja", "Sin precio publicado.", [PROPIA]),
    item("P5", "Espejo de agua de 20 cm con fondo de piedra y recirculación", "COP/m²", 900000, 1300000, 1900000, "suministro_e_instalacion", 0.35, "baja", "Sin precio publicado.", [PROPIA]),
    item("P6", "Grama bermuda instalada", "COP/m²", 20000, 28000, 40000, "suministro_e_instalacion", 0.4, "baja", "Sin precio publicado.", [PROPIA]),
    item("P7", "Palma de 6 a 7 m sembrada", "COP/und", 1200000, 2000000, 3500000, "suministro_e_instalacion", 0.3, "baja", "Sin precio publicado.", [PROPIA]),
    item("P8", "Guayacán grande sembrado", "COP/und", 800000, 1500000, 2500000, "suministro_e_instalacion", 0.3, "baja", "Sin precio publicado.", [PROPIA]),
    item("P9", "Seto de swinglea sembrado", "COP/ml", 35000, 55000, 80000, "suministro_e_instalacion", 0.3, "baja", "Sin precio publicado.", [PROPIA]),
    item("P10", "Losetas de concreto con junta verde sobre base granular", "COP/m²", 60000, 85000, 120000, "suministro_e_instalacion", 0.35, "baja", "Sin precio publicado.", [PROPIA]),
    item("S1", "Estudio de suelos con ensayos de expansión", "COP/global", 3000000, 4500000, 7000000, "otro", None, "baja", "Sin precio publicado.", [PROPIA]),
    item("S2", "Diseño arquitectónico completo (anteproyecto, proyecto y planos de construcción)", "COP/m²", 45000, 70000, 110000, "otro", None, "baja",
         "Sin tarifa publicada de 2026; el reglamento de honorarios (Decreto 2090 de 1989) cobra un porcentaje del costo de obra. $70.000/m² equivale a cerca del 1,5-2 % del costo directo.", [PROPIA]),
    item("S3", "Diseño estructural NSR-10", "COP/m²", 12000, 18000, 28000, "otro", None, "baja", "Sin precio publicado.", [PROPIA]),
    item("S4", "Diseños eléctrico RETIE, hidrosanitario y de gas", "COP/global", 5000000, 8000000, 12000000, "otro", None, "baja", "Sin precio publicado.", [PROPIA]),
    item("S5", "Expensas de licencia de construcción en curaduría (251 m², estrato 6)", "COP/global", 9000000, 9900000, 11000000, "otro", None, "media",
         "Fórmula del Decreto 1077 de 2015: E = Cf·i·m + Cv·i·j·m, con Cf = 10,01 UVT ($524.264 en 2026), Cv ≈ $2.621.319, i = 2,5 (estrato 6), m ≈ 0,938 y j = 3,8/(0,12 + 800/251) = 1,15. Da $8,3 millones + IVA = $9,9 millones. El factor m de Barranquilla debe confirmarse con la curaduría.", EXP),
    item("S6", "Interventoría o supervisión técnica", "% del costo directo", 3, 4, 6, "porcentaje", None, "baja", "Sin tarifa publicada; práctica de mercado.", [PROPIA]),
    item("S7", "Levantamiento topográfico", "COP/global", 1200000, 1800000, 2800000, "otro", None, "baja", "Sin precio publicado.", [PROPIA]),
    item("S8", "Pólizas de cumplimiento y responsabilidad civil", "% del contrato", 0.6, 0.9, 1.3, "porcentaje", None, "baja", "Sin tarifa publicada.", [PROPIA]),
]

parcial = json.loads((AQUI / "investigacion_parcial.json").read_text())
temas = [t for t in parcial["prices"]]
temas += [{"key": "carpinteria_ventanas", "items": carp, "hallazgos": []},
          {"key": "instalaciones", "items": inst, "hallazgos": [
              "Ley 1715 de 2014 y Ley 2099 de 2021: paneles, inversores y baterías con certificación UPME están excluidos de IVA, y la inversión se puede deducir de la renta (50 %) durante 15 años, si se declara renta (hallazgo del agente de referencias)."]},
          {"key": "piscina_tramites", "items": pisc, "hallazgos": []}]
out = {"prices": temas, "sched": None,
       "verdict": {"correcciones": [], "confirmados": [], "observaciones": [
           "El paso de verificación cruzada no se ejecutó: el agente verificador se detuvo por el límite de la sesión. El contraste se hace contra las referencias por m² (B1, B2)."]}}
(AQUI / "investigacion.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
print(sum(len(t["items"]) for t in temas), "precios en", len(temas), "temas")
