# Casa Brisa · Barranquilla

Recorrido 3D en el navegador de una casa moderna de 249,8 m² construidos,
con fachada principal al norte, en Barranquilla (10°58′ N, 74°48′ O).

Versión publicada: https://claude.ai/artifact/MHdBPHMvqj7Y7iE5Sbv9so

## Cómo verla

Abre `index.html` en Chrome, Edge o Safari. Necesita internet para cargar
Three.js desde jsDelivr. Todas las texturas se generan en el navegador; no hay
imágenes externas.

## Programa

| Planta | Espacios |
|---|---|
| Baja (147,0 m²) | Garaje doble con dos puertas, vestíbulo de doble altura con escalera en U, oficina, baño social, sala, comedor, cocina abierta con isla, área de servicio y lavandería con ducha para mascotas |
| Alta (102,8 m²) | Habitación principal con vestier y baño con bañera exenta, habitaciones 2 y 3, habitación y baño de servicio, baño compartido, galería sobre el vestíbulo |
| Exterior | Piscina de borde infinito de 15 × 4 m, terraza con pérgola, espejo de agua en la entrada, patio de mascotas con casa de dos niveles y rampa, cubierta verde, 18 paneles solares (9,9 kWp) |

Las cuatro habitaciones tienen balcón y televisor.

## Controles

- `W A S D` caminar, `Shift` correr, ratón para mirar (clic para fijar el puntero).
- `E` abre y cierra la puerta pivotante, los garajes y los ventanales.
- `1 2 3` cambian a día, tarde y noche. El deslizador recorre la hora; la
  posición del sol se calcula con el algoritmo de la NOAA para Barranquilla.
- `V` alterna entre recorrido y vista aérea. La vista aérea permite quitar la
  cubierta o la planta alta.
- En celular: joystick a la izquierda y arrastre a la derecha para mirar.

## Verificación de circulación

Se comprobó por búsqueda en cuadrícula de 5 cm, sobre las mismas colisiones del
recorrido, que los 25 puntos de destino (todos los espacios y los cuatro
balcones) son alcanzables desde la calle con un paso libre de al menos 0,66 m,
incluida la subida y bajada por la escalera.

## Código

`src/` contiene las piezas; `build.sh` las une en `index.html`.

| Archivo | Contenido |
|---|---|
| `shell.html` | Interfaz y estilos |
| `01-core.js` | Render y texturas procedurales |
| `02-materials.js` | Materiales con su ficha |
| `03-builder.js` | Geometría, colisiones, muros y puertas |
| `04-house.js` | Arquitectura |
| `05-furniture.js` | Mobiliario |
| `06-exterior.js` | Piscina, jardín, mascotas y entorno |
| `07-env.js` | Sol, cielo y luces |
| `08-app.js` | Controles, plano y bucle |
