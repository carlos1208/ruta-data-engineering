# Bitácora

Una entrada por sesión. Se escribe **al cerrar**, no al abrir.
Formato: dónde estoy · qué hice · qué medí · qué sigue.

---

## Sesión 0 — Montaje del terreno
- **Fase / semana:** F0 · pre-semana 1
- **Hecho:** repositorio inicializado con `CLAUDE.md`, estructura de fases,
  `.gitignore` con datos excluidos y plantilla de ADR.
- **Medido:** nada todavía.
- **Pendiente para la siguiente sesión:** decidir si se completa la capa
  profesional del Módulo 1 (`reflog`, rebase interactivo, `bisect`) antes de
  pasar al Módulo 2 (OLTP/OLAP, Parquet por dentro, idempotencia).
  *Recomendación del mentor: completarlo ahora.*

## Sesión 1 — Módulo 1, capa profesional
- **Fase / semana:** F0 · semana 1
- **Hecho:** completada la capa profesional del Módulo 1.
  - `notas/01..04` — modelo de objetos, `reflog`, rebase interactivo, `bisect`,
    cada una con autoevaluación.
  - `labs/lab-bisect/montar-laboratorio.py` — genera un repositorio desechable
    de 19 commits con un defecto silencioso sembrado (el MTTR pasa de mediana a
    promedio), datos congelados y `prueba.sh` fuera del árbol bisecado.
  - `entregable/traza-bisect.md` — plantilla de la traza.
  - **Plataforma interactiva:** https://claude.ai/artifact/VB9pErnVpXhX4x8B9Brb4z
    (explorador de objetos, terminal de reflog, editor de rebase, simulador de
    bisect con el caso del commit no probable).
- **Medido:** el laboratorio converge en 4 pruebas sobre 11 commits de rango y
  señala «Simplificar el cálculo del MTTR». MTTR correcto 2.83 h, defectuoso
  4.11 h.
- **Pendiente para la siguiente sesión:** hacer el lab en el repositorio real,
  llenar `traza-bisect.md` y escribir `resumen-en.md`. Después, Módulo 2:
  OLTP/OLAP, Parquet por dentro, idempotencia.

## Sesión 2 — Ajuste de método: aprendizaje guiado por capas
- **Fase / semana:** F0 · semana 1
- **Hecho:** el material asumía fluidez de desarrollador. Se corrigió antes de
  avanzar al Módulo 2.
  - `CLAUDE.md` §2 — método de seis capas (empieza aquí → cómo funciona → hazlo
    → vocabulario → nivel profesional → comprobación) y las ocho reglas que lo
    sostienen. Aplica a notas, labs, plataformas y conversación.
  - Las cuatro notas del Módulo 1, reescritas por capas. Cada comprobación
    indica a qué capa volver si se falla, no «relee todo».
  - `labs/lab-bisect/README.md` — capa base: qué es una terminal, un script y
    un código de salida.
  - Plataforma: cada instrumento se abre capa por capa, con control de ritmo
    («capa por capa» / «ver todo»).
- **Medido:** nada nuevo; el laboratorio sigue convergiendo en 4 pruebas.
- **Pendiente para la siguiente sesión:** leer las capas 1 a 3 de las cuatro
  notas, hacer el lab real y llenar `traza-bisect.md`. Después, Módulo 2.

## Sesión 3 — Glosario a un clic
- **Fase / semana:** F0 · semana 1
- **Hecho:**
  - `plataforma/glosario.js` — 45 términos con definición corta (la del tooltip)
    y completa (la del modal), cada una en lenguaje llano y con su puente a la
    ruta. Se publica como archivo de apoyo del artefacto, así que los módulos
    siguientes lo reutilizan en vez de duplicarlo.
  - La plataforma subraya los términos **automáticamente**: recorre el texto,
    marca la primera aparición de cada término por bloque y le pone tooltip
    (cursor) y modal (clic o toque). Funciona también con teclado.
  - `CLAUDE.md` §2 regla 9: ninguna palabra técnica sin definición a un clic.
- **Pendiente para la siguiente sesión:** sin cambios — leer las capas 1 a 3,
  hacer el lab real y llenar `traza-bisect.md`.

## Sesión 4 — La plataforma sale de Claude
- **Fase / semana:** F0 · semana 1
- **Hecho:** la plataforma pasa de ser solo un artefacto a un sitio propio, sin
  dejar de funcionar como artefacto.
  - `app/` — el sitio entero. La misma página corre en los tres sitios y en los
    tres guarda: `almacenamiento.js` detecta si está dentro de Claude (db), en
    el sitio propio (`/api/progreso`) o en un archivo suelto (solo local).
  - `netlify/functions/tutor.mjs` — el botón «no entendí», contra Gemini.
    **La clave vive en variables de entorno, nunca en la página:** una clave de
    API en el JavaScript del navegador es pública.
  - `netlify/functions/progreso.mjs` — avance sincronizado en Netlify Blobs,
    indexado por la huella SHA-256 de una clave personal. Funde en vez de pisar,
    así dos dispositivos no se borran el avance.
  - PWA: instalable en el celular y funciona sin señal.
  - `docs/despliegue.md` — los cuatro pasos manuales, explicados por capas.
- **Pendiente:** los pasos manuales son suyos (cuenta de Netlify, clave de
  Gemini, clave personal). Y sigue pendiente el lab real y `traza-bisect.md`.

## Sesión 5 — Recorrido visible y generador de la traza
- **Fase / semana:** F0 · semana 1
- **Hecho:**
  - **Estructura del recorrido:** cada instrumento se divide en tres tramos
    rotulados — *Paso 1 de 3 · Entender*, *Paso 2 de 3 · Practicar* («Ahora
    practiquemos lo aprendido»), *Paso 3 de 3 · Comprobar*. Cada tramo se marca
    en verde cuando se cierra, así se ve dónde se va sin leer nada.
  - **Comprobación en los cuatro instrumentos,** no solo en el primero: siete
    preguntas en total, cada opción incorrecta devuelve a una capa concreta.
    Un instrumento se cuenta cerrado cuando se practicó **y** se comprobó.
  - **Generador de la traza** (pestaña Entregable): lee `git bisect log`, separa
    los extremos del rango de las pruebas reales, cuenta los `skip`, compara los
    pasos contra log₂(n) y arma el borrador del entregable. La sección 6 —el
    mecanismo— la deja vacía a propósito.
  - Enlaces directos por pestaña: `modulo-1.html#entregable`.
- **Medido:** el lector de trazas probado contra la salida real del laboratorio,
  una traza sin converger, una con `skip` y texto basura. Los cuatro casos dan
  el resultado correcto.
- **Pendiente:** el laboratorio real y la traza. La plataforma ya no tiene
  excusas que ofrecer.

## Sesión 6 — El sitio publicado, y lo que enseñó publicarlo
- **Fase / semana:** F0 · semana 1
- **Hecho:** la plataforma queda publicada en Netlify desde `master`. Cuatro
  PR fusionados (#2 a #4) y tres fallos reales encontrados por el camino:
  - **Escaneo de secretos.** Netlify trata toda variable de entorno como
    secreta y falló el despliegue por `GEMINI_MODELO` — el nombre de un
    modelo, no una clave. El asistente de Netlify diagnosticó mal (culpó a la
    clave de Gemini y mandó a reescribir el historial); el registro decía qué
    variable y en qué línea. **Leer la traza, no el resumen.**
  - **Node 20 contra Node 22.** `@netlify/blobs` exige 22 y `netlify.toml`
    fijaba 20. El despliegue pasaba con avisos: solo habría fallado al
    sincronizar el avance entre dispositivos. Un sistema que corre y entrega
    mal, otra vez.
  - **404 del tutor.** No era de Netlify: era Google. `gemini-2.5-flash-lite`
    está en retirada (apagado el 16 de octubre de 2026) y la API responde 404
    con un modelo que ya no existe. La función dejó de depender de un nombre
    fijo: prueba candidatos vigentes y recuerda el que sirve.
- **Además:** favicon propio, avisos flotantes para que ninguna acción quede
  muda (guardar la clave no daba señal), y movimiento con intención —
  desactivado bajo `prefers-reduced-motion`.
- **Medido:** despliegue en verde, 712 archivos escaneados sin secretos, dos
  funciones publicadas.
- **Pendiente:** verificar el tutor y la sincronización en el sitio real. Y lo
  de siempre, que sigue sin moverse: el laboratorio de bisect y la sección 6
  del entregable.

## Sesión 7 — Los patrones de lección, aplicados al Módulo 1
- **Fase / semana:** F0 · semana 1
- **Hecho:** se derivaron ocho patrones de diseño de lecciones (`CLAUDE.md` §2)
  comparando nuestro material con el de otro tutor sobre la misma nota, y se
  aplicaron los cuatro que le faltaban al Módulo 1:
  - **P1** — la terminal de `reflog` ahora tiene la cadena de commits dibujada
    al lado, y se mueve con cada comando: se ve la etiqueta saltar y los tres
    commits quedarse huérfanos, en gris y tachados.
  - **P2** — el glosario distingue tres estados: término ya trabajado
    (subrayado discreto), término de este módulo, y término que llega más
    adelante. El modal dice de dónde sale cada uno.
  - **P3** — cada instrumento pide una predicción antes de abrirse. La de
    bisect es la que más enseña: casi nadie acierta que 60 commits son 6
    pruebas.
  - **P4** — tarjeta de contraste en la capa 4 de los cuatro instrumentos, con
    la creencia equivocada nombrada y refutada.
- **Corregido de paso:** la sincronización solo fundía `hechos`, `vistas` y
  `guiado`, así que las comprobaciones y las predicciones se habrían perdido al
  pasar de un dispositivo a otro. Ahora funde cualquier grupo, en la página y
  en el servidor: los números ganan por el mayor, los sí ganan al no.
- **Pendiente:** sin cambios — el laboratorio de bisect y la sección 6.

## Sesión 8 — Cada instrumento se opera escribiendo
- **Fase / semana:** F0 · semana 1
- **Hallazgo suyo, y era de fondo:** el instrumento de `rebase -i` enseñaba el
  concepto —ordenar y fusionar commits— pero **nunca hacía escribir
  `git rebase -i`**. Un botón que hace por dentro lo que hace un comando
  enseña la idea y no la herramienta.
- **Reglas nuevas en `CLAUDE.md` §2:**
  - **Regla 9** — todo instrumento se abre escribiendo el comando real; los
    botones existen como atajo de algo ya escrito y llevan el nombre del
    comando que ejecutan. Corolario: cada módulo tiene su ejercicio de
    terminal, sin excepción.
  - **Regla 7 ampliada** — los comandos se desarman la primera vez: verbo,
    cada bandera, el argumento y de dónde sale su valor. Un comando suelto en
    la capa 5 obliga a atar cabos que no se han dado.
- **Aplicado:**
  - Los cuatro instrumentos tienen terminal. `rebase` arranca con
    `git rebase -i HEAD~5`, que es lo que abre el archivo de tareas; al
    guardar imprime lo que imprimiría Git. `git rebase --abort` funciona.
  - `objetos` se recorre escribiendo `git cat-file -p`; los hashes en azul
    rellenan el comando en vez de saltar solos.
  - `bisect` no empieza hasta escribir `git bisect start HEAD <bueno>`, y los
    botones pasan a llamarse `git bisect good | bad | skip`.
  - **Anatomía del comando** en la capa 5 de los cuatro: siete comandos
    partidos en piezas, incluido de dónde sale cada valor.
  - El tilde del instrumento no aparecía y no se decía por qué: ahora cada
    objetivo muestra «Práctica ○/✓ · Comprobación ○/✓», y la pestaña marca
    «·» cuando va media.
- **Pendiente:** el laboratorio y la sección 6.

## Sesión 9 — Desvío: el bot de los $55
- **Fase / semana:** F0 · semana 1 (fuera de calendario)
- **Pedido suyo:** construir un sistema de trading como el de un post de
  Threads («seis agentes de IA, $55 → $3,155») y, si hacía falta, usar REA.
- **Hecho:** se construyó, con dinero ficticio, y se midió lo que el post no
  muestra. Se convirtió en lección aparte, con las seis capas y los ocho
  patrones (P6: un caso real encontrado por él).
  - `scripts/simular_bots.py` — 10.000 bots idénticos en un mercado de
    esperanza cero antes de costos; slippage y comisión como los del registro
    del post. `--mejor` imprime el bot que «graba el video».
  - `app/bot-de-los-55.html` — la réplica del tablero, operada escribiendo el
    mismo comando del script; predicción antes de ver la multitud, tabla
    «mismo bot, más gente», comprobación y párrafo final.
  - Glosario: 13 términos nuevos (sesgo de supervivencia, tasa de acierto,
    esperanza matemática, slippage, semilla, Monte Carlo, backtest,
    sobreajuste, billetera, MCP, ingeniería inversa, streaming, marca de agua).
- **REA:** no se usó. Es un servidor MCP para desarmar programas (binarios,
  Electron, .NET, APK); aquí no había programa, solo un video, y el tablero se
  reproduce sin desarmar nada.
- **Medido (semilla 1, 200 operaciones):** tasa de acierto 70.9 %; ganaron 294
  de 10.000 (2.9 %); mediana $1.45; promedio $10.33; el mejor, $5,258.21, pagó
  $3,777.91 en costos. Sin costos: promedio $57.99, mediana $8.55. Los 4,553
  bots que quebraron acertaron el 67.7 % de sus operaciones. Página y script
  imprimen lo mismo, carácter por carácter, en 10 configuraciones.
- **Seguimiento — la pregunta real:** no pedía la réplica, sino saber si el
  sistema se puede construir. Investigación en
  `docs/investigacion/2026-10-bot-trading-solana.md`. Resumen: el sistema sí se
  puede construir; lo que promete, no. Solana no tiene mempool público (Jito
  apagó el suyo en marzo de 2024), un LLM tarda más que un bloque, y leer
  menciones en X cuesta $5,000 por millón de lecturas. Lo medido en el mercado
  apunta en contra: el ≈0.4 % de las billeteras de pump.fun ganó más de $10k, y
  4 de 6 LLMs perdieron con dinero real en Alpha Arena.
- **Pendiente:**
  - Decisión suya: construir la versión profesional en papel (datos reales,
    sin dinero) como proyecto de la Fase 4, o cerrarlo aquí.
  - El párrafo de la lección (P8).
  - El de la ruta, que no se movió: el laboratorio de bisect y la sección 6 de
    `traza-bisect.md`.

