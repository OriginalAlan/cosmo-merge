# Cosmo Merge — documento de diseño (v0.5)

## Concepto
Fusionás objetos del espacio para crear un universo, en 20 niveles: ✨ polvo estelar → 🪨 roca → … → 🌌 galaxia → … → 🔮 Origen.
Cada objeto genera monedas solo, incluso con el juego cerrado. Dos iguales se fusionan en el siguiente nivel.

**Objetivo de duración:** completar el universo lleva **semanas**, no horas. Si se termina rápido, nadie paga.

## Tres monedas
| Moneda | Cómo se consigue | Para qué sirve | ¿Se pierde en el Big Bang? |
|---|---|---|---|
| 🪙 Monedas | Producción de los objetos | Comprar objetos y mejoras de la partida | Sí |
| ⚛️ Energía | Big Bang | Laboratorio (mejoras permanentes) | No |
| 💎 Cristales | Gratis de a poco, o con plata | Tienda (robot, espacio, consumibles, estilo) | No |

## Loop
1. **Partida** (minutos/horas): caen objetos, fusionás, comprás con 🪙. Llega un punto en que se estanca.
2. **Big Bang** (desde el nivel 8, 🔴 Gigante roja): reiniciás y ganás ⚛️. La energía se **duplica por cada nivel extra** al que llegues, así que siempre conviene aguantar un poco más.
3. **Laboratorio** con ⚛️: subir el nivel de lo que cae, x2 de ganancias, más horas offline. Cada Big Bang arrancás un escalón más arriba.
4. Volvés a jugar, más rápido y más lejos.

Las mejoras de "Mejor caída" con 🪙 suben como mucho 2 niveles por partida: el salto grande se da en el laboratorio.

## Ritmo medido (simulador)
Jugador real: 4 sesiones por día de 4 a 8 minutos, 1 acción por segundo, 3 a 7 horas entre sesiones. Hace Big Bang cuando la partida se estanca y la energía alcanza para una mejora. Cada perfil se simula 7 veces y se toma la mediana.

| Perfil | 🔮 Universo completo |
|---|---|
| Gratis | **~día 57** |
| Paga USD 0.99 (paquete inicial) | ~día 50 |
| Paga USD 5.98 (inicial + galáctico) | ~día 44 |
| Paga USD 20 (packs + 1200 💎) | **~día 36** |
| Paga USD 50 | ~día 37 |

Pasados los USD 20 ya no se avanza más rápido, a propósito: lo demás va a lo cosmético, que no rompe el balance.

Los primeros 12 niveles salen el primer día (para enganchar) y después cada nivel cuesta más.

## Qué se vende y por qué ayuda de verdad
El progreso está limitado por **cuántas fusiones hacés**, así que lo que más vale es lo que te ahorra fusiones o tiempo:

### Ofertas de una sola vez (la primera compra tiene que ser fácil)
| Paquete | Precio | Trae | Vale por separado |
|---|---|---|---|
| 🚀 Paquete inicial | USD 0.99 | Robot Nv 1, +1 fila, 100 💎 | 💎 350 |
| 🌌 Pack galáctico | USD 4.99 | Robot Nv 2, +2 filas, robot nocturno, 300 💎 | 💎 2450 |

El paquete inicial aparece solo, una vez, al descubrir 🌍 Planeta (nivel 6, unos minutos de juego). Después queda en la tienda hasta que se compra.

El **robot nocturno** es lo que hace rendir el pack de USD 5: con el juego cerrado sigue cayendo 1 objeto cada 10 minutos y el robot los fusiona. Al volver, la pantalla de "mientras no estabas" cuenta cuántas fusiones hizo y qué descubrió. Más rápido que 10 minutos rompe el balance (cada 1 minuto se termina en 2 semanas).

### Tienda
| Ítem | Precio | Qué hace |
|---|---|---|
| 🛰️ Robot nocturno | 1000 💎 | Lo mismo que trae el pack galáctico (necesita el robot) |
| 🤖 Robot de fusión (4 niveles) | 100 / 300 / 800 / 2000 💎 | Fusiona solo cada 6 s → 0.7 s mientras jugás |
| 🔓 Más espacio (2 filas) | 150 / 600 💎 | Empezás con 20 casilleros, hasta 30 |
| ⏩ Salto temporal | 30 💎 | 2 h de producción al instante |
| ⚛️ Doble energía | 50 💎 | x2 energía en el próximo Big Bang |
| 🚀 Turbo robot | 40 💎 (máx. 3 por día) | Fusiona cada 0.3 s durante 5 min. Funciona sin tener robot: es una muestra gratis de lo que vale |
| 🌧️ Lluvia de objetos | 25 💎 | Llena todos los casilleros vacíos |
| 👑 VIP | USD 2.99 | Todas las recompensas de video sin ver el video |
| 💎 Paquetes | USD 0.99 / 4.99 / 9.99 | 100 / 550 / 1200 cristales |

### Estilo (solo visual, para siempre)
Es lo que compra el que ya tiene todo. Cada ítem se puede **probar 4 segundos** antes de comprarlo.

| Tipo | Opciones (💎) |
|---|---|
| Tablero | Clásico (gratis) · Nebulosa rosa 200 · Aurora boreal 300 · Vacío 400 · Dorado 800 · Arcoíris animado 1500 |
| Objetos | Clásicos (gratis) · Neón 250 · Cristal 400 · Caramelo 400 · Oro macizo 1000 |
| Efecto de fusión | Chispas (gratis) · Estrellitas 150 · Corazones 200 · Confeti 300 · Fuegos artificiales 600 |

Todo el estilo junto cuesta 💎 6000 (unos USD 50).

**💎 gratis:** 10 por día (regalo diario), 5 por video (hasta 5 por día) y 10 por cada nivel nuevo descubierto. Todo lo que se vende se puede conseguir gratis, pero lento: alguien que mira videos junta el robot nivel 1 en 3 días.

## Videos con premio
| Lugar | Premio |
|---|---|
| Botón superior | x2 ganancias por 3 min |
| Al volver | x3 de lo ganado offline |
| Big Bang | x2 energía |
| Tienda | +5 💎 (hasta 5 por día) |

No hay publicidad que interrumpa. Todo está simulado: en la app se reemplaza por AdMob o AppLovin MAX, y las compras por RevenueCat.

## Ganchos para volver
- Ganancias offline (2 h, ampliables a 8 h en el laboratorio).
- Regalo diario de 💎.
- Colección de 20 niveles con ❓ y botón de compartir en cada descubrimiento.

## Métricas para saber si funciona
- Retención: día 1 > 35%, día 7 > 12%, día 30 > 4%.
- Sesiones por día > 4.
- % que ve al menos 1 video por día > 30%.
- % que paga > 2%, con ingreso promedio por pagador > USD 5.

## Balance
Todos los números están en `CFG` al principio de `www/game.js`. Para medir un cambio:

```
node tools/simular.js
CFG='{"buyGrowth":1.3}' node tools/simular.js
```

Lecciones del balance:
- Con x3 de producción por nivel la economía explotaba: se terminaba en minutos. Ahora es x2.
- Si la energía del Big Bang depende de las monedas ganadas, se retroalimenta y crece sin control. Ahora depende del nivel alcanzado.
- Un multiplicador de ganancias casi no acelera, porque el límite son las fusiones. Lo que acelera es subir el nivel de lo que cae (laboratorio) y fusionar solo (robot).
- El resultado depende mucho de cuándo se hace el Big Bang. Con una estrategia torpe (reiniciar apenas se estanca) se tardaba 55 días; con una buena, 20. El balance actual está calibrado para la estrategia buena, porque los jugadores aprenden y se pasan guías.
- Una sola simulación es caótica (un Big Bang un poco antes cambia todo). Por eso se toma la mediana de 7.

**Pendiente:** probar con jugadores reales. El simulador mide el ritmo, no si es divertido.
