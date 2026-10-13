# Estudio de costos de Casa Brisa

Cuánto costaría construir la casa del recorrido 3D en el norte de Barranquilla,
con precios de octubre de 2026.

Versión publicada: https://claude.ai/artifact/W6TKW7t2v22hYMBXkH6xMh

## Resultado

| | Bajo | Medio | Alto |
|---|---:|---:|---:|
| Costo directo (materiales, mano de obra y equipos) | $1.211 M | $1.666 M | $2.360 M |
| Mano de obra dentro del costo directo | 30 % | 30 % | 29 % |
| Indirectos (diseños, licencia, delineación, interventoría, AIU, IVA de la utilidad, pólizas) | $351 M | $634 M | $1.090 M |
| **Total del proyecto** | **$1.562 M** | **$2.300 M** | **$3.450 M** |
| Total por m² construido (251,4 m²) | $6,21 M | $9,15 M | $13,72 M |

Cifras en millones de pesos, con el IVA de los materiales incluido. No incluye
el lote, muebles sueltos, electrodomésticos ni financiación.

Cronograma: 5 meses de diseño y licencia y 11 de obra. Arranca el 2 de
noviembre de 2026 y entrega el 3 de marzo de 2028.

## Cómo se recalcula

```bash
python3 complemento.py   # investigacion_parcial.json -> investigacion.json (precios con fuentes)
python3 presupuesto.py   # cantidades × precios -> presupuesto.json
python3 cronograma.py    # ruta crítica y flujo de caja -> cronograma.json
python3 pagina.py        # página del estudio -> index.html
python3 excel.py         # libro editable -> presupuesto-casa-brisa.xlsx (necesita openpyxl)
```

## Archivos

| Archivo | Contenido |
|---|---|
| `cantidades.py` | Cantidades de obra medidas sobre la geometría del modelo 3D, cada una con su derivación |
| `investigacion_parcial.json` | Precios investigados en la web el 13 de octubre de 2026, con fuentes |
| `complemento.py` | Completa los precios que la investigación no cubrió; marca cada uno con su confianza |
| `presupuesto.py` | 82 partidas en 18 capítulos, indirectos y resumen en tres escenarios |
| `cronograma.py` | 26 actividades con precedencias, método de la ruta crítica y flujo de caja mensual |
| `plantilla.html`, `pagina.py` | La página del estudio: resumen, capítulos, Gantt, flujo de caja, partidas y fuentes |
| `excel.py` | Libro con fórmulas: cambiar una cantidad, un precio o un porcentaje recalcula el total |

## Método y límites

- **Cantidades.** Se midieron sobre el modelo, no sobre planos de construcción.
  Faltan el diseño estructural y el estudio de suelos, que fijan el acero, la
  cimentación y el muro de contención.
- **Precios.** De 97 precios, 8 tienen confianza alta, 39 media y 50 baja. La
  baja marca ítems sin precio publicado en 2026 o con una sola fuente. Parte de
  la investigación automática no terminó y esos temas se completaron con
  búsquedas directas y estimaciones propias marcadas como tales.
- **Control.** La verificación cruzada independiente no se ejecutó. El
  contraste se hizo contra las referencias de costo por m²: la edificación sola
  (sin piscina, solar ni exteriores) sale en $5,09 millones por m² de costo
  directo en el escenario medio, dentro del rango de vivienda de lujo en la
  Costa (4,0 a 6,0 millones por m²).
- **Mano de obra.** Jornales con el salario mínimo de 2026 ($1.750.905) y
  factor prestacional de 0,50 a 0,80.
- **Indirectos.** Delineación urbana del 3 % sobre el mayor entre el valor de la
  obra y la base mínima por m² de Barranquilla; IVA del 19 % sobre la utilidad
  (supuesta en 30 % del AIU).

Es un presupuesto paramétrico para decidir y negociar, no una cotización. Antes
de contratar conviene cotizar primero ventanería, piscina, estructura y la
cimentación, que suman la mayor parte del costo y concentran la incertidumbre.
