# Memoria Persistente — Negocio de Investigación de Mercado E-commerce (Bolivia/Latam)

> Actualizado: 2026-07-03 (Loops 1, 2 y 3 completados)
> Propietario: Félix (felixber@gmail.com)
> Meta: 800–2000 USD de beneficio neto en los primeros 7 días. Inversión ≤ 50 USD. 100% digital.

---

## Estado general

| Loop | Objetivo | Estado |
|------|----------|--------|
| 1 | Validación de demanda + pricing final | ✅ Completado (2026-07-03) |
| 2 | Assets: landing (Carrd), reporte de ejemplo, propuesta, emails, plantillas | ✅ Completado (2026-07-03) |
| 3 | Setup de cobros + publicación en Gumroad + plan de outreach primeras ventas | ✅ Completado (2026-07-03) |
| 4 | Optimización según respuesta real del mercado | ⏸️ Bloqueado: requiere datos del usuario (DMs, respuestas, ventas de las primeras 48h) |

## Decisiones tomadas (Loop 1)

1. **Posicionamiento**: NO competir por precio con Fiverr (gigs de análisis de competidores desde $35–125 USD). Diferenciación: especialización e-commerce **Latam**, en español, con contexto local (Mercado Libre, logística boliviana, pagos QR/Tigo Money, TikTok Shop) y entrega exprés.
2. **Pricing final** (se mantienen los 3 paquetes del brief + se agrega 1 producto de entrada para generar caja rápida en la semana 1):
   - **Mini-Auditoría Exprés — 79 USD** (48h): snapshot de 3 competidores + 3 quick wins. Producto gancho/upsell.
   - **Básico — 180 USD** (3 días): reporte 15–20 págs.
   - **Estándar — 350 USD** (4 días): análisis profundo + recomendaciones accionables + pricing óptimo.
   - **Premium — 550 USD** (5 días): todo lo anterior + 1h consultoría + plantillas.
3. **Stack de cobro (restricción crítica confirmada)**: PayPal Bolivia NO permite retiro directo a bancos bolivianos. Ruta: Gumroad → payout a PayPal → puente (Takenos o Airtm o Binance P2P) → banco boliviano (BNB/BCP/Unión). Alternativa directa: Payoneer (sí retira a bancos bolivianos).
4. **Canal de validación semana 1**: grupos de Facebook de emprendedores/e-commerce Bolivia y Latam + LinkedIn + X + Reddit, con oferta de 2 mini-auditorías gratis a cambio de testimonio (para generar los primeros casos/portafolio en 48h).

## Hallazgos clave (con fuentes en loops/loop1-validacion-demanda.md)

- E-commerce Bolivia en expansión: proyección de crecimiento ~10.6% anual hasta 2029 (volumen ~$2,669M USD en 2029); ventas minoristas +20% hasta 2026 según la Asociación Boliviana de Comercio Electrónico. 47.2% de bolivianos ya hace pagos digitales.
- Dolor real de vendedores: logística/envíos ineficientes y baja penetración de tarjetas (12.6% crédito) → los reportes deben incluir SIEMPRE sección de logística local y métodos de pago alternativos (QR, contra entrega).
- Workana: +1000 freelancers de investigación de mercado y ~280 trabajos activos → hay demanda comprobada de este servicio en Latam; comisión 16%.
- Fiverr benchmarks: análisis de competidores $35–125; paquetes básicos de market research $43–200 → nuestro Básico ($180) debe justificarse con especialización local, no con volumen de páginas.
- PayPal Bolivia: cuenta funciona para RECIBIR, no para retirar a banco local. Puentes válidos: Takenos (retiro a cuenta local ~24h), Airtm (tasa paralela), Payoneer (retiro directo a bancos bolivianos), Binance P2P.

## Restricciones y presupuesto

- Gastado hasta ahora: $0. Presupuesto comprometido plan: Carrd Pro ~$19/año (único gasto obligatorio). Resto: Canva free, Google Docs, Gumroad (comisión ~10%+ por venta, sin costo fijo).
- Todo por debajo del límite de $50.

## Riesgos / notas honestas

- La meta de $800–2000 netos en 7 días requiere ~3–6 ventas de paquetes medios o ~10 mini-auditorías + upsells. Con audiencia cero, los posts solos NO bastan: se necesita outreach directo (30–50 DMs/día) — incluido en el plan de acciones.
- Reddit penaliza autopromoción: solo posts de valor + oferta en comentarios/DM.
- Facturación Bolivia: emitir factura con NIT (persona natural, régimen general) vía SIAT; verificar con contador local — no somos asesores fiscales.

## Assets generados (Loop 2)

Todo en `assets/`: landing Carrd (copy 9 secciones), reporte de ejemplo demo (paquete Estándar, nicho ropa deportiva Bolivia), propuesta comercial 1 página, secuencia de 5 emails, 3 plantillas Premium (tracker competidores, calculadora pricing, calendario contenido — CSV) + formulario de onboarding de 10 preguntas (en `loops/loop2-assets.md`).

## Entregables Loop 3

- `loops/loop3-cobros-y-ventas.md`: guía completa de cobros Bolivia (PayPal + Gumroad payout + puente Takenos/Airtm/Binance P2P + Payoneer directo a banco + nota NIT/SIAT), plan de outreach (lista de 50 objetivos, DMs de 3 toques, metas diarias día 1–7).
- `assets/gumroad-productos.md`: títulos, precios y descripciones listos para los 4 productos + PDF post-compra.

## Próximo loop (Loop 4 — bloqueado por datos)

Optimización según respuesta real: qué mensaje/canal/paquete convierte y qué matar. **Insumo necesario del usuario**: tras 24–48h de ejecución, reportar en la sesión: DMs enviados, tasa de respuesta, propuestas enviadas, ventas por paquete, objeciones más repetidas. Con eso: ajustar copy de DMs, pricing/anclaje, doblar el canal ganador y decidir si activar ads de $5/día.

## Nota operativa

El agendado autónomo (send_later) falló 2 veces en esta sesión por permisos no aprobables en modo no interactivo — los Loops 2 y 3 se ejecutaron inline en su lugar. El Loop 4 se dispara cuando el usuario reporte datos (o pida "Loop 4").
