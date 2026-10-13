"""Cantidades de obra de Casa Brisa, medidas sobre la geometría del modelo 3D.

Cada cantidad lleva su derivación. Las coordenadas son las del modelo:
x = oriente, z = sur, en metros. Planta baja de 0 a 3,0 m; planta alta de 3,3 a 6,1 m.
"""

# ---------------------------------------------------------------- áreas
AREA_PB = 15.0 * 9.8 + 4.0 * 3.2          # volumen principal + ampliación de servicio
AREA_PA = 15.0 * 8.0 - 5.2 * 3.3 - 3.2 * 3.5  # caja superior - vacío del vestíbulo - terraza familiar
AREA_TOTAL = AREA_PB + AREA_PA
HUELLA = AREA_PB

def r(x, n=1):
    return round(x, n)

Q = {}
def q(key, cantidad, unidad, como):
    Q[key] = {"cantidad": r(cantidad, 2), "unidad": unidad, "como": como}

# ---------------------------------------------------------------- preliminares
q("area_construida", AREA_TOTAL, "m²", f"PB {AREA_PB:.1f} + PA {AREA_PA:.2f}")
q("cerramiento_provisional", 2 * (24.4 + 26.3), "ml", "perímetro del lote 24,4 × 26,3 m")
q("meses_obra", 12, "mes", "duración de obra física del cronograma")

# ---------------------------------------------------------------- tierras y cimentación
excav_mejora = (HUELLA + 10) * 0.6
excav_zapatas = 26 * (1.6 * 1.6 * 0.9)
excav_piscina = 15.3 * 4.3 * 1.75 + 15.3 * 0.65 * 0.9
excav_muro = 24.4 * 2.0 * 1.0
q("excavacion", excav_mejora + excav_zapatas + excav_piscina + excav_muro, "m³",
  "mejoramiento 0,6 m bajo huella+10 m² + 26 zapatas 1,6×1,6×0,9 + vaso de piscina y canal + zanja del muro de contención")
q("relleno_seleccionado", (HUELLA + 10) * 0.6, "m³", "reemplazo de 0,6 m de arcilla expansiva por material granular compactado")
q("concreto_cimentacion", 26 * 1.4 * 1.4 * 0.4 + 105 * 0.3 * 0.45, "m³", "26 zapatas 1,4×1,4×0,4 + 105 ml de vigas de cimentación 0,30×0,45")
q("placa_contrapiso", HUELLA, "m²", "placa de 10 cm con malla electrosoldada bajo toda la planta baja")

# ---------------------------------------------------------------- estructura
q("concreto_columnas", 26 * 0.35 * 0.35 * 3.3 + 20 * 0.35 * 0.35 * 2.8 + 4 * 0.35 * 0.35 * 3.1, "m³",
  "26 columnas de 0,35×0,35 en PB, 20 en PA y 4 prolongadas en la doble altura")
losa_entrepiso = 15 * 7.7 + 5.5 * 3.3 + 4.3 * 3.3 + (5.1 + 3.9) * 1.4 + 4.0 * 2.0
q("losa_entrepiso", losa_entrepiso, "m²", "losa sobre PB con alero sur de 1,2 m, losas de habitaciones 2 y 3, balcones norte en voladizo y techo de la ampliación")
losa_cubierta = 3.2 * 6.7 + 11.8 * 10.8
q("losa_cubierta", losa_cubierta, "m²", "cubierta en L: 3,2×6,7 + 11,8×10,8 (con pórtico norte y alero sur)")
q("escalera", 1, "global", "tramo macizo de 8 huellas, descanso y tramo flotante con espina de concreto (≈3,5 m³)")
q("muro_contencion", 24.4 * 3.0, "m²", "muro en voladizo de 3 m de altura bajo el borde infinito, 24,4 m")
q("concreto_visto", 52 * 0.3 + 10, "m²", "cantos de losa vistos (52 ml × 0,3 m) + espina de la escalera")

# ---------------------------------------------------------------- mampostería y revoques
mamp_pb_ext = (5.6 * 3 - 2 * 2.35 * 2.4) + (4.4 * 3 - 3.3 * 1.8) + (13 * 3 - 1.82 - 4.32 - 1.96 - 2.03) + (9.8 * 3 - 3.96) + (4 * 3 - 1.51) + 3.2 * 3
mamp_pb_int = 16.5 + 7.2 + 12 + 3.2 + 5.7 + 13.6 + 3.2 + 9.2 + 9.7 + 7.1 + 2.3
mamp_pa_ext = 3.7 + 3.8 + 4.5 + 10.3 + 19.7 + 9.6
mamp_pa_int = 19.2 + 21.8 + 28.5 + 9.1 + 7.3 + 7.4
q("mamposteria", mamp_pb_ext + mamp_pb_int + mamp_pa_ext + mamp_pa_int + 21, "m²",
  f"muros exteriores PB {mamp_pb_ext:.0f} + interiores PB {mamp_pb_int:.0f} + exteriores PA {mamp_pa_ext:.0f} + interiores PA {mamp_pa_int:.0f} + antepechos de cubierta 21 (vanos descontados)")
q("panete", 2 * (mamp_pb_int + mamp_pa_int) + 2 * (mamp_pb_ext + mamp_pa_ext) + 30, "m²", "ambas caras de todos los muros + antepechos")
q("estuco_pintura_int", 2 * (mamp_pb_int + mamp_pa_int) + (mamp_pb_ext + mamp_pa_ext) - 82, "m²", "caras interiores menos 82 m² de muros de baño en microcemento")
q("drywall_cielo", 101 + 101, "m²", "cielos de PB (sin la zona de listones) y de PA incluido el vacío")
q("pintura_fachada", mamp_pa_ext + 20 + 39 + 56, "m²", "muros de la caja superior + aletas del pórtico + antepechos y cantos + aleros")

# ---------------------------------------------------------------- pisos y enchapes
q("porcelanato", 28.5 + 20.35 + 40.8, "m²", "vestíbulo y oficina 9,2×3,1 + hall 8,14×2,5 + cocina, comedor y sala 10,74×3,8")
q("concreto_pulido", 5.2 * 5.525, "m²", "garaje")
q("microcemento", 2.2 + 13.9 + 10.8 + 18.2 + 82, "m²", "pisos: baño social, servicio, suite de servicio y baños de PA (45 m²) + muros de los 4 baños (82 m²)")
q("roble", 16.1 + 12.4 + 17.5 + 20.1, "m²", "habitaciones 2 y 3, pasillo y galería, vestier y habitación principal")
q("deck_teca", 35.2 + 7.14 + 5.46 + 12.45 + 25.9 + 6.2, "m²", "terraza 11×3,2 + 2 balcones norte + balcón principal + terraza familiar + patio de servicio")
q("travertino", 32.9 + 30.0 + 15.1 + 3.5, "m²", "deck norte, oeste y este de la piscina + remates del vaso")

# ---------------------------------------------------------------- fachadas y madera
q("coralina", 87.5 + 73.2 + 10 + 7, "m²", "muros exteriores de PB + cara del muro de contención + jardineras y muro bajo frontal")
q("listones_madera", 46 + 7.7 + 12.6 + 18.6, "m²", "cielo de sala y comedor + celosías oriente/occidente + pérgola + muro de TV")

# ---------------------------------------------------------------- cubiertas
q("impermeabilizacion", losa_cubierta + 23 + 12.45 + 25.9 + 12.6 + 6, "m²", "cubierta + cubierta verde + terrazas y balcones sobre losa")
q("cubierta_verde", 21.8 + 1.3, "m²", "franja sobre la sala y techo de la ampliación")
q("gravilla", 145, "m²", "cubierta superior")

# ---------------------------------------------------------------- ventanería y vidrio
vent = 32.2 + 4.3 + 1.8 + 2.0 + 1.5 + 5.9 + 4.0 + 14.6 + 11.2 + 11.3 + 1.7 + 6.0 + 1.3 + 8.2 + 2.3 + 2.75
q("ventaneria", vent, "m²", "ventanales corredizos de piso a techo y ventanas fijas de ambas plantas")
q("muro_cortina", 5.0 * 6.1 - 1.4 * 3.0, "m²", "doble altura del vestíbulo 5,0×6,1 menos la puerta pivotante")
q("baranda_vidrio", 3.9 + 2.5 + 11.7 + 10.05 + 16.5 + 7.9, "ml", "galería, escalera, balcones, terraza familiar y deck de la piscina")
q("divisiones_bano", 5.2, "m²", "vidrio templado de duchas")
q("espejos", 6, "m²", "baños y vestier")

# ---------------------------------------------------------------- puertas y carpintería
q("puertas_interiores", 14, "und", "8 en PB (oficina, baños, servicio, suite, patio) + 6 en PA")
q("puerta_pivotante", 1, "und", "1,40 × 3,00 m en teca")
q("puertas_garaje", 2, "und", "seccionales motorizadas 2,35 × 2,40")
q("cocina", 6.3, "ml", "mueble posterior 2,5 ml + torre de 1,2 ml + isla 2,6 ml")
q("muebles_servicio", 4.0, "ml", "lavandería y despensa")
q("closets", 7.6, "ml", "habitaciones 2, 3, servicio y vestier")
q("muebles_bano", 4, "und", "vanity doble del principal, compartido, social y servicio")
q("mesones", 7.7, "ml", "cocina (isla y posterior) y lavandería")

# ---------------------------------------------------------------- aparatos
q("sanitarios", 4, "und", "4 baños")
q("lavamanos", 5, "und", "2 en el principal + compartido + social + servicio")
q("duchas", 3, "und", "principal, compartido y servicio")
q("banera", 1, "und", "exenta 1,70 m con grifería de piso")

# ---------------------------------------------------------------- equipos
q("aa_12k", 5, "und", "habitaciones 2, 3, principal, servicio y oficina")
q("aa_24k", 2, "und", "sala-comedor-cocina abierta (≈70 m² ligados a la doble altura)")
q("solar_kwp", 9.9, "kWp", "18 paneles de 550 W")
q("bateria_kwh", 10, "kWh", "respaldo de nevera, internet y luces")

# ---------------------------------------------------------------- piscina y exteriores
q("piscina_m2", 60, "m²", "lámina de agua 15 × 4 m, profundidad 1,40 m, borde infinito al sur")
q("espejo_agua", 30.8, "m²", "dos espejos de agua de la entrada")
q("grama", 210, "m²", "lote 641,7 m² menos huella, decks, piscina, accesos, espejos de agua y jardineras")
q("palmas", 8, "und", "")
q("arboles", 2, "und", "guayacanes amarillos dentro del lote")
q("setos", 67, "ml", "linderos laterales y frente")
q("losetas", 38.5, "m²", "acceso vehicular 5,5 × 7 m")
q("sendero", 10.5, "m²", "sendero peatonal flotante sobre el espejo de agua")
q("cerramiento_frontal", 16.7, "ml", "muro bajo en coralina, h = 0,45 m")

if __name__ == "__main__":
    import json
    print(json.dumps(Q, ensure_ascii=False, indent=1))
    print(f"\nÁrea construida: PB {AREA_PB:.2f} + PA {AREA_PA:.2f} = {AREA_TOTAL:.2f} m²")
