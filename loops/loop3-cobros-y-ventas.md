# Loop 3 — Setup de cobros (Bolivia) + publicación + plan de primeras ventas

Fecha: 2026-07-03 · Estado: Completado

---

## 1. Setup de cobros para Bolivia — paso a paso

### Realidad confirmada (Loop 1)
PayPal funciona en Bolivia para RECIBIR dinero, pero **no permite retiro directo a bancos bolivianos**. Gumroad no tiene payout bancario para Bolivia, así que paga vía PayPal. La ruta completa del dinero:

```
Cliente paga en Gumroad (tarjeta/PayPal)
        → Gumroad payout semanal a tu PayPal (USD)
        → Puente: Takenos / Airtm / Binance P2P
        → Tu banco boliviano (BNB / BCP / Banco Unión) en Bs
```

Alternativa paralela para clientes directos B2B: **Payoneer** (sí retira directo a bancos bolivianos) — envías "payment request" por email al cliente y paga con tarjeta o transferencia. Y para clientes bolivianos: QR / transferencia local (0% comisión), con factura.

### Paso A — PayPal (hoy, 15 min)
1. Ve a paypal.com/bo → Crear cuenta → **Personal** (suficiente para recibir payouts de Gumroad; la Business puedes activarla después sin costo).
2. Regístrate con tu correo (felixber@…) y tu Carnet de Identidad. Confirma email y teléfono.
3. NO intentes vincular tu banco boliviano para retiros — no está soportado. Si tienes una tarjeta de débito/crédito internacional, vincúlala solo para verificar la cuenta (sube límites).

### Paso B — Gumroad (hoy, 30 min)
1. Crea cuenta en gumroad.com → completa perfil (nombre comercial, foto, bio de 2 líneas).
2. Settings → Payments → como Bolivia no aparece en payout bancario, selecciona **PayPal** e ingresa el MISMO email de tu cuenta PayPal. Completa nombre, dirección y teléfono (no piden documentos para payout por PayPal).
3. Publica los 4 productos con los textos de `assets/gumroad-productos.md`.
4. Comisión Gumroad: ~10% + fee de procesamiento por venta. Payouts: semanales (viernes), con mínimo ~$10 acumulado.

### Paso C — Puente PayPal → banco boliviano (esta semana, elegir UNO para empezar)
- **Takenos** (recomendado para empezar): crea cuenta con tu CI en takenos.com → verifica identidad → transfieres desde PayPal a tu cuenta Takenos → retiras a tu cuenta bancaria boliviana en ~24h. Comisión típica: ~2–4% (verifica la tarifa vigente en la app antes del primer retiro).
- **Airtm**: cuenta en airtm.com → depositas saldo PayPal → vendes USD a tasa paralela → retiras en Bs a banco local. Comisión variable según oferta P2P; suele compensar por la tasa de cambio.
- **Binance P2P** (para montos mayores, requiere más cuidado): PayPal→USDT vía Airtm u otro, vender USDT por Bs con contraparte verificada de alta reputación, transferencia directa a tu banco.
- ⚠️ Haz una primera transferencia de PRUEBA con $20–30 antes de mover cobros grandes.

### Paso D — Payoneer (en paralelo, verificación tarda 1–3 días — inícialo YA)
1. payoneer.com → Regístrate como individuo con tu CI y tu cuenta bancaria boliviana (BNB/BCP/Unión — en Bs o USD según tu cuenta).
2. Una vez verificado: para clientes directos (Estándar/Premium cerrados por WhatsApp), envía "Request a Payment" al email del cliente — paga con tarjeta y tú retiras directo a tu banco. Comisión ~3% tarjeta + fee de retiro (~$1.50–3).

### Paso E — Facturación con NIT (persona natural) — ⚠️ verificar con contador
- Si ya tienes NIT: emite facturas por "servicios de consultoría/investigación" desde el SIAT (siat.impuestos.gob.bo) — facturación en línea para persona natural del régimen general. Los cobros del exterior igualmente se declaran (IVA/IT/IUE según régimen).
- Si no tienes NIT: se tramita gratis en impuestos.gob.bo (Padrón Biométrico Digital) con CI, croquis de domicilio y actividad económica ("servicios de estudios de mercado" / "consultoría"). Tarda ~1–3 días.
- **No soy asesor fiscal**: valida con un contador local (una consulta cuesta ~Bs 100–200) cómo declarar ingresos del exterior. Hazlo esta semana, no antes de vender — no bloquees el lanzamiento por esto.

### Costos totales del stack
Carrd gratis (o $19/año) + Gumroad 10%/venta + puente 2–4% + Payoneer 3%. **Inversión fija: $0–19 → dentro del límite de $50.** Sobre un paquete de $350 cobrado por Gumroad+Takenos te quedan ~$300 netos.

---

## 2. Plan de outreach — primeras ventas en 7 días

### La matemática (sé honesto contigo mismo)
- Meta mínima $800 netos ≈ **2 Estándar + 1 Básico**, o **1 Premium + 4 Mini**.
- Conversión realista en frío: 1–3% de DMs → venta. **50 DMs/día × 7 días = 350 contactos → 4–10 ventas posibles** si el mensaje es bueno y respondes rápido.
- Los posts en grupos traen leads tibios; los DMs traen ventas. Haz ambos, prioriza DMs.

### Cómo armar tu lista de 50 tiendas objetivo (día 1, 60–90 min)
1. **Instagram** (30 tiendas): busca hashtags #emprendimientobolivia #tiendaonlinebolivia #hechoenbolivia #emprendedoresperu #tiendaonlineperu y las cuentas que Instagram sugiere al seguirlas. Filtra: tiendas con 1k–50k seguidores, activas (post <7 días), que venden producto físico. Esas tienen dinero para invertir y dolores reales.
2. **Facebook Marketplace + grupos** (10 tiendas): vendedores recurrentes (varios productos publicados) en La Paz, Santa Cruz, Cochabamba.
3. **Mercado Libre Perú/Ecuador/Paraguay** (10 tiendas): vendedores medianos (100–1000 ventas) de categorías competidas (hogar, deporte, belleza) — les duele el pricing y la competencia.
4. Regístralas en una copia del tracker (`assets/plantillas/tracker-competidores.csv` sirve de base: nombre, canal, nicho, fecha de contacto, respuesta).

### Guiones de DM — secuencia de 3 toques

**Toque 1 (día 0) — valor primero, sin vender:**
> Hola [nombre] 👋 Encontré tu tienda de [producto] y me gustó [detalle real y específico]. Hago investigación de mercado para e-commerce en Latam y, mirando tu nicho, noté algo: [1 observación útil y real, ej: "hay 2 competidores tuyos vendiendo lo mismo 20% más caro con más ventas"]. Si te interesa, te mando 1 página gratis con lo que vi — sin costo ni compromiso. ¿Te la paso?

**Toque 2 (día 2, si no respondió):**
> Hola [nombre], te dejo igual el dato por si te sirve: [la observación]. Si algún día quieres el análisis completo de tu competencia (precios, canales y qué hacer con eso), es lo que hago: reportes exprés en 3–5 días. Aquí puedes ver un ejemplo: [link al PDF demo].

**Toque 3 (día 5, último):**
> [Nombre], cierro cupos de esta semana (tomo máx. 4 investigaciones). Si tu duda de mercado sigue ahí — precio, competencia o en qué canal vender — la Mini-Auditoría de $79 la responde en 48h: [link Gumroad]. Si no es el momento, ¡éxitos con la tienda! 🚀

**Al que responde con interés**: mándale el PDF demo + pregúntale su duda #1 → propuesta comercial personalizada (`assets/propuesta-comercial.md`) → link de pago. Responde en <1 hora mientras estés despierto: la velocidad de respuesta es tu mayor arma esta semana.

### Metas diarias (días 1–7)

| Día | Acciones | Meta acumulada |
|---|---|---|
| 1 | Lista de 50 + 25 DMs toque 1 + publicar productos Gumroad | 2–5 conversaciones |
| 2 | 25 DMs nuevos + entregar mini-auditorías gratis del Loop 1 | 1ª venta Mini probable |
| 3 | 25 DMs + toque 2 a los del día 1 + pedir testimonios de las gratis | $79–259 |
| 4 | 25 DMs + repost en 2 grupos nuevos + propuestas a calientes | 1ª venta Básico/Estándar |
| 5 | 25 DMs + toque 3 (cierre de semana) | $400–900 |
| 6 | Entregar reportes vendidos + upsell Mini→Estándar | $600–1400 |
| 7 | Últimos cierres + pedir referidos a cada cliente ("¿conoces 2 tiendas que necesiten esto?") | $800–2000 |

⚠️ **Regla anti-baneo**: máx. 25–30 DMs/día por cuenta de Instagram y personaliza SIEMPRE la primera línea — mensajes idénticos en masa te silencian la cuenta en 48h.

---

## 3. ACCIONES EXACTAS PARA TI (en orden)

1. **(15 min)** Crear cuenta PayPal personal en paypal.com/bo (Paso A).
2. **(30 min)** Crear cuenta Gumroad, configurar payout por PayPal y publicar los 4 productos con `assets/gumroad-productos.md` (Paso B). Pon los links de Gumroad en la landing de Carrd.
3. **(10 min)** Iniciar registro en Payoneer (Paso D) — la verificación tarda días, arráncala hoy.
4. **(10 min)** Crear cuenta en Takenos y dejar la verificación corriendo (Paso C).
5. **(90 min)** Armar la lista de 50 tiendas objetivo y enviar los primeros 25 DMs (toque 1).
6. **(continuo)** Responder DMs y comentarios en <1 hora. Todo interesado recibe el PDF demo.
7. **(esta semana)** Consulta de 30 min con un contador sobre NIT + ingresos del exterior.
8. **Repórtame cada día**: nº de DMs enviados, respuestas, propuestas enviadas y ventas. Con datos reales de 48h ejecuto el Loop 4 (optimización: qué mensaje, qué canal y qué paquete están convirtiendo — y qué matar).
