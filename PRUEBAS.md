# Prueba con jugadores reales — Cosmo Merge 0.6

Objetivo: saber en **2 semanas** si el juego engancha (la gente vuelve), si se entiende y qué comprarían.
Con 20–50 personas alcanza para la primera ronda.

## 1. Publicar el link (una vez)

**Opción A — GitHub Pages (recomendada, se actualiza sola).** El repositorio tiene que ser público en una cuenta gratis.
El archivo `.github/workflows/pages.yml` ya publica la carpeta `www/` cada vez que subís un cambio.
Publicado en **https://originalalan.github.io/cosmo-merge/** (repositorio: github.com/OriginalAlan/cosmo-merge).

**Opción B — Netlify Drop (sin repositorio, 1 minuto).** Entrás a app.netlify.com/drop, arrastrás la carpeta `www/` y te da un link.
Para actualizar, volvés a arrastrarla.

## 2. Activar la medición (una vez, 10 minutos)
1. Creá una cuenta gratis en posthog.com (elegí la región US).
2. Creá un proyecto y copiá la **Project API key** (empieza con `phc_`).
3. Pegala en `www/game.js`, en `CFG.analytics.posthogKey`, y publicá de nuevo.

Sin la clave el juego anda igual, pero no te enterás de nada.

## 3. Mensaje para mandar a los testers
> ¡Hola! Estoy haciendo un juego para celular y necesito gente que lo pruebe. Es gratis y dura lo que quieras.
> 👉 https://originalalan.github.io/cosmo-merge/
> Ideal: abrilo desde el celu y agregalo a la pantalla de inicio (en iPhone: Compartir → Agregar a inicio).
> Jugá como jugarías cualquier juego, sin forzarte. Si un día no tenés ganas de abrirlo, ¡eso también me sirve!
> Las compras **no cobran nada**: tocá las que comprarías de verdad, así sé qué vale la pena.
> Al rato te va a pedir tu opinión (o en ⚙️ → Dar mi opinión). ¡Gracias!

Conviene mandarlo a gente que **no** sea muy cercana: los amigos dicen que todo está bárbaro.

## 4. Qué mirar en PostHog
| Pregunta | Dónde | Bueno si… |
|---|---|---|
| ¿Vuelven? | Retention, evento `session_start` | Día 1 > 35%, día 7 > 12% |
| ¿Cuánto juegan? | Trends de `progress`, propiedad `play_minutes` | > 15 min el primer día |
| ¿Dónde se aburren? | Trends de `discover` por `level` | Que la caída sea suave, sin un nivel donde abandonen todos |
| ¿Entienden el Big Bang? | `big_bang` | > 50% de los que llegan al nivel 8 lo hacen |
| ¿Miran videos? | `ad_complete` por `placement` | > 30% de los jugadores por día |
| ¿Qué comprarían? | `purchase` y `shop` (por `item`/`name`) | > 5% toca el paquete inicial cuando se le ofrece (`offer_shown`) |
| ¿Qué opinan? | `feedback` (estrellas y texto) | Promedio > 3.5 y comentarios concretos |

Ojo: las compras son simuladas, así que la gente "compra" más que en la realidad. Sirven para comparar qué ítem atrae más, no para estimar plata.

## 5. Después de 1 semana
- Si la retención del día 1 es < 25%: el problema está en los primeros 5 minutos (se entiende, engancha). Mirar dónde abandonan.
- Si el día 1 está bien pero el día 7 se cae: falta motivo para volver (misiones diarias, eventos).
- Leer **todos** los comentarios. Si 3 personas dicen lo mismo, es verdad.

## 6. Publicar una versión nueva
1. Cambiar `CFG.version` en `www/game.js` (por ejemplo `0.6.1`): eso también renueva la copia offline de los testers.
2. Subir el cambio (opción A) o volver a arrastrar la carpeta (opción B).
3. Los eventos traen la versión, así se pueden comparar los resultados antes y después.

## Antes de las tiendas (iOS / Android)
- Empaquetar `www/` con Capacitor.
- Cambiar los videos simulados por AdMob o AppLovin MAX, y las compras por RevenueCat.
- Ícono y capturas finales. El ícono actual es original (no usa dibujos de emoji de Apple, que no se pueden usar en una app publicada).
- Política de privacidad (las tiendas la piden; PostHog guarda datos anónimos).
