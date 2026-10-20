# ¿Se puede construir el sistema del post?

Investigación del 20 de octubre de 2026. La pregunta de Carlos: un post de
Threads dice que «Grok Bot» construyó un sistema de seis agentes de IA que
convirtió $55 en $3,155 operando memecoins en Solana. ¿Se puede construir ese
sistema?

**Respuesta: el sistema se puede construir. Lo que el post promete, no.**
Un programa que compra y vende memecoins solo, con varios agentes de IA y su
tablero, está al alcance de cualquier desarrollador con las piezas públicas de
hoy. Lo que no existe es evidencia de que gane dinero, y dos piezas del propio
registro del post no pueden funcionar como se muestran.

## Cómo se investigó

Cuatro frentes en paralelo (ejecución en Solana, capa de agentes de IA,
economía del mercado, riesgos), cada uno con un verificador independiente que
intentó refutar sus diez datos más importantes.

**Limitación:** los verificadores no pudieron abrir varias fuentes primarias,
porque la descarga de páginas falló y se agotó el cupo de búsquedas. Por eso cada
dato lleva su estado. *Verificado* significa que el dato coincide entre varias
fuentes o fue reconfirmado en la fuente oficial. *Sin verificar* significa que
viene de resúmenes de búsqueda; no se debe citar como cifra exacta sin abrir la
fuente.

## 1. Lo que sí se puede construir

| Pieza | Para qué sirve | Con qué | Costo | Estado |
|---|---|---|---|---|
| Conexión a la red (nodo RPC) | Enterarse de cada lanzamiento y enviar órdenes | Helius, QuickNode, Triton | Plan gratis para empezar. El flujo rápido (gRPC) en la red real exige el plan Business o el Professional ($999/mes) | Verificado en la documentación de Helius |
| Ejecución de la compra | Cambiar SOL por el token y de vuelta | API de Jupiter o el programa de pump.fun | Comisión del launchpad + comisión de prioridad + slippage | Verificado como mecanismo; tarifas exactas de 2026 sin verificar |
| Billetera que firma | Autorizar cada operación | La clave privada guardada en el servidor | — | Es el riesgo principal (sección 4) |
| «Agentes» de IA | Decidir qué comprar | Un LLM por API, con kits como Solana Agent Kit o ElizaOS | Por consulta | Verificado: los kits existen y traen compra vía Jupiter |
| Señal de menciones en X | Medir el ruido social de un token | API de X, pago por uso | $0.005 por post leído (tabla de la sección 2) | Verificado en guías que citan docs.x.com |
| Tablero | Ver saldo, curva y registro | Cualquier página web | 0 | Hecho en `app/bot-de-los-55.html` |

Un asistente como Grok o Claude puede escribir casi todo ese código. Lo que no
puede generar es la **ventaja**: una esperanza matemática positiva después de
costos, medida fuera de muestra.

## 2. Lo que no funciona como lo pinta el post

### El «mempool» no existe en Solana

El registro dice `[SCAN] mempool: 1560 txns, 3 snipes ahead`. Un mempool es una
sala de espera pública donde se ven las órdenes antes de ejecutarse; Ethereum
la tiene. Solana no: cada orden va directo al validador que arma el bloque.
Jito ofrecía un pseudo-mempool y lo apagó el 8 de marzo de 2024 por los ataques
sándwich. Lo que se vende hoy como visibilidad temprana (fragmentos de bloque,
preconfirmaciones) muestra órdenes **ya ordenadas por el validador**, no una
cola donde contar cuántos van delante. «3 snipes ahead» no es observable con
datos públicos. **Estado: verificado.**

### La IA no puede decidir en el instante del lanzamiento

| Qué | Tiempo |
|---|---|
| Un bloque de Solana | ≈400 ms (la red lo viene acortando en 2026; cifra exacta sin verificar) |
| Un LLM sin razonamiento, hasta la primera palabra | ≈0.7–1 s |
| Un LLM con razonamiento | ≈20–40 s |

El disparo de un snipe lo hace código fijo, preparado de antemano. Un LLM puede
estar en la estrategia, no en la ruta crítica. **Estado: el orden de magnitud
está verificado; las latencias exactas por modelo, no.**

### Leer menciones en X cuesta más que el capital

Precio de lectura en pago por uso: $0.005 por post. Tope de 2 a 3 millones de
lecturas al mes; las fuentes se contradicen, incluida la propia documentación
de X.

| Lecturas al mes | Costo |
|---|---|
| 100,000 | $500 |
| 1,000,000 | $5,000 |
| 2–3 millones (tope) | $10,000–15,000 |

Ejemplo: seguir 100 tokens, consultar cada 15 minutos y recibir unos 10 posts
nuevos por consulta da ≈2.9 millones de lecturas al mes, o ≈$14,400. Ese
volumen ya está en el tope, y el capital de partida del post era de $55.
**Estado: precio verificado; tope en disputa.**

## 3. Lo que dicen los números del mercado

| Dato | Cifra | Fuente | Estado |
|---|---|---|---|
| Billeteras de pump.fun con más de $10k de ganancia realizada (ene-2025) | ≈0.4 % de ≈13.5 M | Panel de Dune, vía Decrypt | Coincide en varias fuentes |
| Tokens de pump.fun que no sostuvieron $1,000 de liquidez (ene-2024 a mar-2025) | 98.6 %, clasificados como rug pull o pump-and-dump | Solidus Labs | Verificado. La cifra sale de un umbral de liquidez e incluye tokens que murieron sin fraude |
| LLMs con dinero real: Alpha Arena, temporada 1 (oct–nov 2025, $10k cada uno) | 4 de 6 perdieron. Qwen3 Max ganó ≈+22 %; Grok 4 perdió ≈−45 % | Nof1, vía SCMP y Forklog | Verificado |
| Comisión de los bots comerciales (Photon, Trojan, BonkBot, Axiom) | ≈1 % en la compra y otro ≈1 % en la venta, gane o pierda el usuario | Reseñas y datos de ingresos | Consistente; tarifas exactas sin verificar |
| Snipers que ganan de forma sistemática | Billeteras financiadas por el creador del token: 87 % de snipes rentables, ≈1 SOL por lanzamiento | Pine Analytics, jun-2025 | Sin verificar. El estudio solo mide insiders, no compara con bots externos |
| Ataques sándwich (oct-2025 a oct-2026) | ≈6.85 M ataques, 96 % en pump.fun y PumpSwap, 39 % extraído a otros bots | Bitquery, vía CryptoSlate | Sin verificar |

El patrón común: ganan quienes cobran comisión, quienes crean los tokens y
quienes tienen infraestructura junto a los validadores. El bot del minorista
paga a los tres.

## 4. El riesgo que el post no menciona: la clave de la billetera

Un bot propio necesita la clave privada en el servidor para firmar. Quien la
obtiene vacía la billetera, y la operación no se puede revertir.

| Caso | Fecha | Qué pasó | Estado |
|---|---|---|---|
| `@solana/web3.js` 1.95.6 y 1.95.7 | dic-2024 | La librería oficial de Solana, comprometida, robaba claves privadas; los bots eran los más expuestos | Verificado |
| Bot de pump.fun escrito con ChatGPT | nov-2024 | El código usaba una API fraudulenta que envió la clave; ≈$2,500 perdidos en unos 30 minutos | Verificado |
| Repositorio «solana-pumpfun-bot» en GitHub | 2025 | Una dependencia maliciosa exfiltraba la clave; tenía estrellas y forks inflados | Verificado |
| Bots comerciales drenados | 2023–2024 | Maestro y Unibot (fallas de contrato), Banana Gun, DEXX | Verificado como serie; montos con variaciones |
| Advertencia de la CFTC, «AI Won't Turn Trading Bots into Money Machines» | ene-2024 | El regulador advierte contra bots de IA que prometen rentabilidades extremas | Verificado |

Lo legal y lo fiscal dependen del país. Operar tu propio dinero con un bot no es
ilegal en general. El límite está en vender señales o bots con promesas de
rentabilidad y en manejar dinero de terceros. En lo fiscal, cada swap suele ser
un hecho imponible, y un bot genera cientos.

## 5. Si se construye, la versión profesional

El orden que usaría un ingeniero:

1. **Datos de mercado reales, sin dinero.** Leer lanzamientos y precios en vivo
   y registrar qué habría hecho cada estrategia (paper trading).
2. **Medir la esperanza después de costos**, con slippage y comisiones reales,
   sobre datos que no se usaron para diseñar la estrategia.
3. **Dinero solo si el paso 2 da positivo**, con una billetera dedicada, un
   monto que se pueda perder entero y dependencias revisadas.

Los pasos 1 y 2 son la Fase 4 de la ruta: streaming, marcas de agua e
idempotencia (una orden reintentada no puede comprar dos veces). El monitoreo es
la Fase 5. Es un proyecto de portafolio legítimo; la decisión de si se hace, y
cuándo, está pendiente en `BITACORA.md`.

## Fuentes principales

- Jito suspende su mempool: https://www.theblock.co/news/ecosystems/2024-03-09-solana-client-jito-labs-axes-mempool-function-following-increase-in-mev-attacks-281504
- Precios de Helius: https://www.helius.dev/docs/billing/plans
- Precios de la API de X: https://docs.x.com/x-api/getting-started/pricing · https://bundle.social/blog/x-api-pricing-2026-costs-limits · https://opentweet.io/x-api-pricing
- Alpha Arena T1: https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/ · https://www.gncrypto.news/news/qwen-wins-alpha-arena-season-1-with-22-percent-returns/
- pump.fun, billeteras rentables: https://decrypt.co/300403/pump-fun-traders-millionaires
- Solidus Labs: https://www.soliduslabs.com/reports/solana-rug-pulls-pump-dumps-crypto-compliance
- Pine Analytics: https://pineanalytics.substack.com/p/exit-liquidity-machines
- Bitquery, sándwiches: https://cryptoslate.com/solana-sandwich-bots-took-29-7-million-before-costs-bitquery-estimates/
- `@solana/web3.js`: https://decrypt.co/294742/solana-web3-js-library-compromised-in-targeted-supply-chain-attack
- ChatGPT y la API fraudulenta: https://cryptoslate.com/blockchain-security-firm-warns-of-ai-code-poisoning-risk-after-openais-chatgpt-recommends-scam-api/
- Bot falso en GitHub: https://cointelegraph.com/news/solana-trading-bot-github-malware-scam
- CFTC: https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/AITradingBots.html
