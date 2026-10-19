#!/usr/bin/env python3
"""
Diez mil bots de trading idénticos en un mercado donde nadie tiene ventaja.

Lección aparte de la ruta (app/bot-de-los-55.html). Reproduce el terminal de un
post que dice haber convertido $55 en $3,155 con seis agentes de IA, y mide lo
que el post no muestra: la multitud de bots iguales que no grabaron su video.

El mercado está construido para que **ninguna operación tenga ventaja**: cada
agente gana poco muchas veces y pierde mucho pocas veces, y el reparto está
calculado para que, antes de costos, el resultado esperado sea exactamente cero.
Después se cobra lo que cobra el mercado de verdad: deslizamiento (slippage) al
entrar y al salir, y comisión en cada lado.

Uso:
    python3 scripts/simular_bots.py                    # la multitud
    python3 scripts/simular_bots.py --mejor            # el bot que graba el video
    python3 scripts/simular_bots.py --sin-costos       # el mismo mercado, sin cobrar
    python3 scripts/simular_bots.py --bots 100 --operaciones 600 --semilla 7

Los números son idénticos a los de la página: misma semilla, mismo generador,
misma aritmética. Si no coinciden, uno de los dos tiene un defecto.

Dinero ficticio. Nada aquí se conecta a una billetera ni a un mercado.
"""
import argparse
import sys
from decimal import ROUND_HALF_UP, Decimal

SALDO_INICIAL = 55.0
FRACCION = 0.25          # parte del saldo que arriesga cada operación
COMISION = 0.0025        # por lado, como un exchange descentralizado típico
SLIP_MIN = 0.008         # deslizamiento entre 0.8 % y 2.2 % por lado,
SLIP_RANGO = 0.014       # el mismo rango que se lee en el registro del post
QUEBRADO = 1.0           # con menos de $1 el bot ya no opera

# nombre, estilo, p_gana, x_gana, p_cohete, x_cohete
# La pérdida se calcula para que el multiplicador esperado sea 1: cero ventaja.
AGENTES = [
    ("NOVA",  "impulso",          0.78, 1.08, 0.02, 2.5),
    ("ORION", "menciones en X",   0.74, 1.12, 0.03, 3.0),
    ("VELA",  "volumen",          0.80, 1.06, 0.01, 2.0),
    ("KADE",  "francotirador",    0.70, 1.15, 0.04, 3.5),
    ("NYX",   "reversión",        0.76, 1.09, 0.02, 2.2),
    ("ZARA",  "caza de cohetes",  0.30, 1.40, 0.05, 6.0),
]
TOKENS = ["$WIFCAT", "$QUOKK", "$ZORP", "$SIGMA", "$NYAN", "$HODLR",
          "$PEPO", "$DOGGO", "$BONKO", "$GLORP", "$MOONY", "$FROGE"]

M32 = 0xFFFFFFFF


def x_pierde(pg: float, xg: float, pc: float, xc: float) -> float:
    return (1 - pg * xg - pc * xc) / (1 - pg - pc)


TABLA = [(pg, xg, pg + pc, xc, x_pierde(pg, xg, pc, xc))
         for _, _, pg, xg, pc, xc in AGENTES]


def mulberry32(semilla: int):
    """Generador de 32 bits. Es el mismo de la página, bit por bit."""
    a = semilla & M32

    def siguiente() -> float:
        nonlocal a
        a = (a + 0x6D2B79F5) & M32
        t = ((a ^ (a >> 15)) * (a | 1)) & M32
        t = ((t + (((t ^ (t >> 7)) * (t | 61)) & M32)) & M32) ^ t
        return ((t ^ (t >> 14)) & M32) / 4294967296
    return siguiente


def semilla_bot(semilla: int, i: int) -> int:
    return (semilla * 1000003 + i) & M32


def correr_bot(semilla: int, operaciones: int, costos: bool, registro=None):
    """Devuelve (saldo final, operaciones ganadas, operaciones hechas)."""
    r = mulberry32(semilla)
    saldo, ganadas, hechas = SALDO_INICIAL, 0, 0
    for j in range(operaciones):
        if saldo < QUEBRADO:
            break
        k = int(r() * 6)
        pg, xg, pgc, xc, xp = TABLA[k]
        u = r()
        x = xg if u < pg else (xc if u < pgc else xp)
        s1 = SLIP_MIN + r() * SLIP_RANGO
        s2 = SLIP_MIN + r() * SLIP_RANGO
        neto = x * (1 - s1) * (1 - s2) * (1 - COMISION) * (1 - COMISION) if costos else x
        posicion = saldo * FRACCION
        pnl = posicion * (neto - 1)
        saldo += pnl
        hechas += 1
        if pnl > 0:
            ganadas += 1
        if registro is not None:
            registro.append((j + 1, k, TOKENS[(j * 5 + k * 7) % len(TOKENS)],
                             posicion, s1, x, s2, pnl, saldo, posicion * (x - neto)))
    return saldo, ganadas, hechas


def fijo(x: float, decimales: int, miles: bool = False) -> str:
    """Redondea como toFixed de JavaScript, para que la página imprima lo mismo."""
    q = Decimal(x).quantize(Decimal(1).scaleb(-decimales), rounding=ROUND_HALF_UP)
    return format(q, ",f" if miles else "f")


def dinero(x: float) -> str:
    return "$" + fijo(x, 2, True)


def con_signo(x: float, fmt=dinero) -> str:
    return ("+" if x >= 0 else "-") + fmt(abs(x))


def mediana(ordenados: list) -> float:
    n = len(ordenados)
    m = n // 2
    return ordenados[m] if n % 2 else (ordenados[m - 1] + ordenados[m]) / 2


# Tramos del histograma, en múltiplos del saldo inicial
TRAMOS = [("quebrado (< $1)",          0.0,  1.0),
          ("perdió más del 80 %",      1.0,  11.0),
          ("perdió algo",              11.0, 55.0),
          ("ganó, hasta 10 veces",     55.0, 550.0),
          ("ganó más de 10 veces",     550.0, float("inf"))]


def multitud(args) -> int:
    finales, total_g, total_h = [], 0, 0
    for i in range(args.bots):
        s, g, h = correr_bot(semilla_bot(args.semilla, i), args.operaciones, not args.sin_costos)
        finales.append(s)
        total_g += g
        total_h += h

    suma = 0.0
    for s in finales:        # suma en orden, igual que la página
        suma += s
    mejor = max(range(args.bots), key=lambda i: (finales[i], -i))
    peor = min(range(args.bots), key=lambda i: (finales[i], i))
    ordenados = sorted(finales)
    ganaron = sum(1 for s in finales if s > SALDO_INICIAL)

    print(f"{args.bots} bots · {args.operaciones} operaciones cada uno · semilla {args.semilla}"
          f" · {'sin costos' if args.sin_costos else 'con costos'}")
    print()
    print(f"  tasa de acierto     {fijo(100 * total_g / max(total_h, 1), 1)} %")
    print(f"  terminaron ganando  {ganaron} de {args.bots} ({fijo(100 * ganaron / args.bots, 1)} %)")
    print(f"  mediana             {dinero(mediana(ordenados))}")
    print(f"  promedio            {dinero(suma / args.bots)}")
    print(f"  mejor               {dinero(finales[mejor])}  (bot #{mejor + 1})")
    print(f"  peor                {dinero(finales[peor])}  (bot #{peor + 1})")
    print()
    print("  saldo final                      bots")
    for nombre, lo, hi in TRAMOS:
        n = sum(1 for s in finales if lo <= s < hi)
        barra = "#" * int(40 * n / args.bots + 0.5)
        print(f"  {nombre:<26} {n:>7}  {barra}")
    return 0


def el_mejor(args) -> int:
    costos = not args.sin_costos
    finales = [correr_bot(semilla_bot(args.semilla, i), args.operaciones, costos)[0]
               for i in range(args.bots)]
    mejor = max(range(args.bots), key=lambda i: (finales[i], -i))
    registro = []
    s, g, h = correr_bot(semilla_bot(args.semilla, mejor), args.operaciones, costos, registro)

    print(f"bot #{mejor + 1} · el mejor de {args.bots} · semilla {args.semilla}"
          f" · {'sin costos' if args.sin_costos else 'con costos'}")
    print()
    print(f"  saldo        {dinero(SALDO_INICIAL)} -> {dinero(s)}")
    pagado = 0.0
    for fila in registro:
        pagado += fila[9]
    print(f"  resultado    {con_signo(s - SALDO_INICIAL)}"
          f" ({con_signo(100 * (s / SALDO_INICIAL - 1), lambda v: fijo(v, 1, True))} %)")
    print(f"  aciertos     {g} de {h} ({fijo(100 * g / max(h, 1), 1)} %)")
    print(f"  costos       {dinero(pagado)} en deslizamiento y comisión")
    print()
    print("  últimas 15 operaciones")
    print("   op  agente token     entra con  slip  sale ×  slip    resultado        saldo")
    for j, k, tok, pos, s1, x, s2, pnl, saldo, _ in registro[-15:]:
        print(f"  {j:>3}  {AGENTES[k][0]:<6} {tok:<8} {dinero(pos):>10}  {fijo(100 * s1, 1)}%"
              f"  {fijo(x, 2):>6}  {fijo(100 * s2, 1)}%  {con_signo(pnl):>11}  {dinero(saldo):>11}")
    return 0


def main() -> int:
    p = argparse.ArgumentParser(
        description="Bots idénticos en un mercado sin ventaja. Dinero ficticio.")
    p.add_argument("--bots", type=int, default=10000, help="cuántos bots iguales correr (1–100000)")
    p.add_argument("--operaciones", type=int, default=200, help="operaciones por bot (1–5000)")
    p.add_argument("--semilla", type=int, default=1, help="punto de partida del azar (0–999999)")
    p.add_argument("--mejor", action="store_true", help="mostrar solo el mejor bot, como el post")
    p.add_argument("--sin-costos", action="store_true", help="no cobrar deslizamiento ni comisión")
    args = p.parse_args()

    if not 1 <= args.bots <= 100000:
        p.error("--bots va de 1 a 100000")
    if not 1 <= args.operaciones <= 5000:
        p.error("--operaciones va de 1 a 5000")
    if not 0 <= args.semilla <= 999999:
        p.error("--semilla va de 0 a 999999")
    return el_mejor(args) if args.mejor else multitud(args)


if __name__ == "__main__":
    sys.exit(main())
