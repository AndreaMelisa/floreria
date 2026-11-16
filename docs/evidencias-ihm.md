# Evidencias Académicas de Interacción Humano-Máquina (IHM) — El club de las flores

Este documento sistematiza la implementación real, funcional y verificable de los **diez principios de Interacción Humano-Máquina (IHM)** y accesibilidad web (referencia WCAG 2.2 nivel AA) dentro de la aplicación **"El club de las flores"**.

> **Nota de rigor académico:** Ninguna evidencia gráfica ni resultado de prueba con usuarios ha sido inventado. Se detallan las rutas de componentes reales, las acciones reproducibles paso a paso, las capturas propuestas para la defensa académica y los resultados reales de las pruebas automatizadas ejecutadas en el repositorio.

---

## 1. Matriz Principal de Evidencias IHM

| Principio IHM | Implementación concreta | Vista o componente | Acción para demostrar | Resultado esperado | Evidencia |
|---|---|---|---|---|---|
| **1. Modelo mental** | Flujo guiado de 7 pasos en orden natural de compra (`Seleccionar plan → Personalizar → Destinatario → Entrega → Resumen → Pago simulado → Confirmación`), barra superior de aviso demostrativo, explicación de propósito en cada paso y política explícita de renovación automática simulada y consecuencias de cancelación. | Vistas `/`, `/suscripciones` · Componentes `Navbar.tsx`, `SubscriptionWizard.tsx`, `DynamicSummaryCard.tsx`, `MySubscriptionsPanel.tsx` | Ingresar a `/suscripciones` como usuario nuevo, observar el indicador numerado del Paso 1 al 7, leer el propósito del formulario en el encabezado de cada paso y avanzar hasta el Paso 5 (Resumen) y Paso 6 (Pago simulado). | El usuario identifica sin ambigüedad qué hacer primero, qué datos se le solicitan, que el pago es 100% simulado (sin tarjetas reales) y qué sucederá en cada ciclo de renovación o al cancelar. | Captura propuesta: Vista `/suscripciones` mostrando la barra superior de modo demostrativo, la barra de 7 pasos y el bloque *"¿Qué ocurrirá cuando confirmes el pago simulado?"* en el Paso 5. |
| **2. Modelo conceptual** | Separación visual y estructural de los objetos del dominio (`Plan floral`, `Suscripción`, `Comprador`, `Destinatario`, `Pago simulado`, `Entrega`, `Complemento`), sus acciones (`Seleccionar`, `Personalizar`, `Contratar`, `Consultar`, `Modificar`, `Cancelar`) y sus estados diferenciados mediante insignias con icono + texto + borde. | Vista `/suscripciones` · Componentes `StatusBadge.tsx`, `SubscriptionWizard.tsx` (Paso 1 y Paso 3), `MySubscriptionsPanel.tsx` | 1) Comparar las tarjetas de planes disponibles en el Paso 1 con una suscripción ya contratada en la pestaña *Mis suscripciones*. 2) En el Paso 3 elegir *"Para regalar"* para ver los bloques separados de Comprador y Destinatario. 3) Observar en *Mis suscripciones* la relación entre la suscripción, sus entregas y sus pagos simulados. | El usuario distingue claramente un plan del catálogo frente a una suscripción contratada (`Activa`, `Cancelada`, `Finalizada`), diferencia comprador de destinatario y visualiza los estados de pagos (`Exitoso`, `Rechazado`, `Cancelado`) y entregas (`Programada`, `Entregada`). | Captura propuesta: Pestaña *Mis suscripciones* mostrando una tarjeta `FLORES-0001` con `StatusBadge` y sus listas anidadas de *Entregas asociadas* y *Pagos simulados del ciclo*. |
| **3. Mapeo** | Correspondencia directa e inmediata entre cada control interactivo y su efecto en el sistema: tarjetas de tamaño vinculadas al plan y precio, selector de flores y checkboxes de complementos conectados al cálculo en vivo, selector de frecuencia conectado a las fechas proyectadas y botón *"Para regalar"* conectado al despliegue condicional del formulario de destinatario. | Vista `/suscripciones` · Componentes `SubscriptionWizard.tsx` (Pasos 1, 2, 3 y 4) y `DynamicSummaryCard.tsx` | En el Paso 2 (*Personalizar*), cambiar el tamaño de *Pequeño (Brote — S/ 65.00)* a *Grande (Jardín — S/ 135.00)*, seleccionar *Botánica premium (+S/ 45.00)* y marcar *Caja de bombones (+S/ 26.00)*. Luego cambiar la frecuencia de *Quincenal* a *Semanal*. | Sin recargar la página, el panel lateral *Resumen en vivo* actualiza instantáneamente el precio por entrega a `S/ 206.00`, el precio por ciclo a `S/ 206.00`, la estimación mensual aproximada a `~S/ 824.00 / mes (4 entregas)` y las fechas proyectadas. | Captura propuesta: Comparativa antes/después del Paso 2 junto al componente `DynamicSummaryCard` mostrando el cambio instantáneo de `S/ 95.00` a `S/ 206.00`. |
| **4. Significadores** | Botones con verbos y etiquetas descriptivas (*"Personalizar mi arreglo"*, *"Continuar a entrega"*, *"Revisar mi suscripción"*, *"Simular pago exitoso"*, *"Guardar cambios"*, *"Cancelar suscripción"*), diferenciación jerárquica entre acciones primarias, secundarias y destructivas, bordes de 2px e icono de verificación (`Check`) en tarjetas seleccionadas, e iconos acompañados siempre de texto. | Vistas `/`, `/nosotros`, `/suscripciones` · Componentes `Navbar.tsx`, `SubscriptionWizard.tsx`, `MySubscriptionsPanel.tsx` | Recorrer con el puntero o el teclado las tarjetas de planes, tamaños, turnos horarios y botones de acción en `/suscripciones`. | El usuario reconoce de inmediato qué elementos son clicables/seleccionables, cuál está activo actualmente (borde `border-rose-deep`, fondo `bg-rose-pastel`, etiqueta *"Elegido"* / `aria-pressed="true"`) y qué acción ejecutará cada botón. | Captura propuesta: Detalle de tarjetas seleccionadas vs. no seleccionadas en el Paso 1 y Paso 4, destacando el borde, el icono de check y las etiquetas explícitas de los botones. |
| **5. Feedback o retroalimentación** | Respuesta visual y textual inmediata ante cada interacción: banner de estado contextual, región `aria-live="polite"` para lectores de pantalla, mensajes de validación en formularios, indicador de carga (`Procesando...`) durante el checkout, alerta de error con botón de reintento ante un pago rechazado y avisos de confirmación al modificar o cancelar suscripciones. | Vista `/suscripciones` · Componentes `SubscriptionWizard.tsx` (Pasos 2, 3, 4, 6 y 7) y `MySubscriptionsPanel.tsx` | Ir al Paso 6 (*Pago simulado*) y pulsar el botón *"Simular pago rechazado"*. Posteriormente pulsar *"Reintentar con pago simulado exitoso"*. | Al simular el rechazo, el sistema no activa la suscripción y despliega un bloque `role="alert"` explicando el motivo del rechazo junto al botón *"Reintentar con pago simulado exitoso"*. Al reintentar con éxito, muestra la vista de confirmación con el código `FLORES-XXXX`. | Captura propuesta: Paso 6 mostrando el cuadro de alerta roja `[data-testid="payment-failure-alert"]` tras pulsar *"Simular pago rechazado"*, con el botón de reintento visible. |
| **6. Restricciones** | Prevención activa de errores y operaciones inválidas: bloqueo de fechas pasadas y exigencia de 24h de anticipación en `America/Lima`, validación de correo, teléfono (9 dígitos), dirección y límite de 220 caracteres en dedicatoria, obligación de elegir un único turno horario, prevención de pagos duplicados mediante `cycleId`, bloqueo de edición en suscripciones canceladas y modal de confirmación para cancelar. | Módulos `calendar.ts`, `validation.ts`, `payments.ts`, `subscriptions.ts` · Componentes `SubscriptionWizard.tsx`, `MySubscriptionsPanel.tsx` | 1) En el Paso 4 (*Entrega*), intentar pulsar *"Revisar mi suscripción"* sin haber seleccionado un turno (Mañana o Tarde). 2) Observar el botón de fecha pasada bloqueado. 3) En *Mis suscripciones*, cancelar una suscripción y verificar que los botones de edición quedan bloqueados. | El sistema impide avanzar al Paso 5 y muestra una alerta clara: *"Selecciona un turno de entrega (Mañana: 9:00 a. m. - 1:00 p. m. o Tarde: 3:00 p. m. - 6:00 p. m.) para continuar."* Las suscripciones canceladas no permiten modificaciones posteriores. | Captura propuesta: Paso 4 mostrando el mensaje de restricción cuando no se ha elegido turno y la tarjeta de fecha pasada deshabilitada (`Fecha pasada (Bloqueada)`). |
| **7. Usabilidad** | División del proceso complejo en pasos manejables, preservación automática del borrador en `localStorage` (`club_borrador`) al retroceder o recargar, botón de autocompletado de datos de prueba, enlaces *"Modificar"* en el Resumen antes de pagar, estados vacíos con instrucciones claras y diseño *Mobile First* limpio sin controles innecesarios. | Vistas `/`, `/nosotros`, `/suscripciones` · Componentes `SubscriptionsHubClient.tsx`, `SubscriptionWizard.tsx`, `MySubscriptionsPanel.tsx` | Completar hasta el Paso 5 (*Resumen*), pulsar *"Modificar horario"* para volver al Paso 4, cambiar el turno de Mañana a Tarde y regresar al Paso 5. También verificar la pestaña *Mis suscripciones* cuando aún no hay registros. | Todos los datos ingresados en los pasos anteriores se conservan intactos sin obligar al usuario a reescribirlos. El estado vacío orienta claramente sobre cómo crear la primera suscripción. | Captura propuesta: Vista del Paso 5 (*Resumen*) con los botones *"Modificar arreglo"*, *"Modificar datos"* y *"Modificar horario"*, y captura del estado vacío en *Mis suscripciones*. |
| **8. Accesibilidad — Principios POUR** | **Perceptible:** Paleta con contraste alto (`#1F1A1C` sobre `#FAF7F2` / `#FFFEFB`), jerarquía `h1-h4`, imágenes con `alt`. **Operable:** Enlace *"Saltar al contenido principal"*, navegación total por teclado, foco visible `:focus-visible` de 3px, cierre de modales con `Escape`. **Comprensible:** Español claro, etiquetas permanentes y errores explicativos. **Robusto:** HTML5 semántico (`main`, `nav`, `fieldset`, `legend`, `label`, `details`), roles ARIA (`dialog`, `tablist`, `status`, `alert`). | Toda la aplicación (`globals.css`, `layout.tsx`, `Navbar.tsx`, `AccessibleModal.tsx`, `SubscriptionWizard.tsx`) | Presionar la tecla `Tab` desde el inicio de la página para revelar el enlace *"Saltar al contenido principal"*, recorrer todos los controles con `Tab` / `Shift+Tab`, accionar con `Enter` o `Espacio`, abrir un modal y cerrarlo con `Escape`. | El foco es visible en todo momento con un contorno de 3px color `#8C3B50`, no existen trampas de teclado, los modales atrapan el foco correctamente mientras están abiertos y lo devuelven al botón de origen al cerrarse. | Captura propuesta: Elemento interactivo con el anillo de foco `:focus-visible` activo y reporte de auditoría automática `axe-core` sin violaciones. |
| **9. Accesibilidad sensorial** | Textos alternativos descriptivos en todas las ilustraciones botánicas informativas (`BotanicalIllustration.tsx`), estados diferenciados simultáneamente por icono + etiqueta textual + borde (nunca solo por color), paletas cromáticas con etiqueta descriptiva (*"Suave y romántico"*, *"Vibrante y expresivo"*), ausencia de alertas basadas únicamente en sonido y soporte en CSS para `@media (prefers-reduced-motion: reduce)`. | Componentes `BotanicalIllustration.tsx`, `StatusBadge.tsx`, `SubscriptionWizard.tsx` (selector de colores), `globals.css` | 1) Inspeccionar el atributo `alt` de las imágenes en `/`, `/nosotros` y `/suscripciones`. 2) Observar las insignias de estado (`StatusBadge`) en escala de grises. 3) Activar *Movimiento reducido* en el sistema operativo. | Las imágenes exponen descripciones completas de su contenido floral; los estados de éxito, advertencia, rechazo o cancelación se distinguen por su icono y texto incluso sin percibir el color; las transiciones se desactivan con `prefers-reduced-motion`. | Captura propuesta: Inspector del navegador mostrando el atributo `alt` significativo de `BotanicalIllustration` y vista comparativa de las insignias `StatusBadge` con sus iconos y textos explícitos. |
| **10. Tecnologías de apoyo** | Uso prioritario de controles HTML nativos (`button`, `input`, `select`, `textarea`, `fieldset`, `legend`), asociación explícita `htmlFor` + `id` en todos los campos, vinculación de errores mediante `aria-invalid` y `aria-describedby`, agrupación semántica de radio buttons para los turnos de entrega (`name="delivery-shift"`), `aria-pressed` en tarjetas seleccionables, `aria-current="step"` en el progreso y anuncios en vivo con `aria-live="polite"`. | Componentes `SubscriptionWizard.tsx`, `AccessibleModal.tsx`, `MySubscriptionsPanel.tsx` | Completar el flujo de contratación utilizando únicamente el teclado (`Tab`, `Shift+Tab`, flechas en radio buttons de turno, `Espacio` en checkboxes de complementos, `Enter` en botones) y verificar la lectura de etiquetas y alertas con un lector de pantalla (NVDA / Narrador / VoiceOver). | Todos los controles anuncian su nombre accesible, su rol, su estado (`seleccionado` / `no seleccionado`, `paso actual`) y los mensajes de error asociados a cada campo inválido. | Captura propuesta: Árbol de accesibilidad de Chrome DevTools mostrando el `fieldset` con `legend` *"2. Selecciona un único turno de entrega"* y sus radio buttons asociados. |

---

## 2. Verificación Manual Paso a Paso por Principio

1. **Modelo mental y Modelo conceptual:**
   - Abrir `/suscripciones`. Verificar en la parte superior el aviso de entorno demostrativo y los 7 pasos numerados.
   - Contratar un plan y abrir la pestaña **Mis suscripciones**. Comprobar cómo la tarjeta de la suscripción muestra su código `FLORES-0001`, su insignia de estado (`Suscripción Activa`), las entregas programadas y los pagos simulados vinculados.
2. **Mapeo, Significadores y Feedback:**
   - En el Paso 2 (*Personalizar*), hacer clic en cada tamaño (*Pequeño*, *Mediano*, *Grande*) y observar cómo cambia instantáneamente el importe en el panel derecho **Resumen en vivo** y en el banner de retroalimentación superior.
   - En el Paso 6 (*Pago simulado*), hacer clic en **Simular pago rechazado** y comprobar que aparece la alerta explicativa con el botón **Reintentar con pago simulado exitoso**.
3. **Restricciones:**
   - En el Paso 3 (*Destinatario*), intentar avanzar dejando los campos vacíos o ingresando un correo sin `@`. Comprobar los mensajes que explican cómo corregir cada campo.
   - En el Paso 4 (*Entrega*), intentar avanzar sin elegir turno. Comprobar el mensaje de restricción. Verificar además que las fechas pasadas están bloqueadas.
   - En **Mis suscripciones**, pulsar **Simular renovación del ciclo #2 (Demo)** y comprobar que se genera un pago único con `cycleId = sub_..._cycle_2` y que los cambios comerciales programados se aplican en ese nuevo ciclo respetando el importe del ciclo #1.
4. **Usabilidad, Accesibilidad POUR, Sensorial y Tecnologías de Apoyo:**
   - Navegar toda la vista `/suscripciones` usando únicamente el teclado (`Tab`, `Shift+Tab`, `Espacio`, `Enter`, `Escape`).
   - Abrir cualquiera de los tres modales en **Mis suscripciones** (*Cambiar plan*, *Modificar dirección/turno* o *Cancelar suscripción*), comprobar que el foco queda atrapado dentro del modal y presionar `Escape` para verificar que se cierra y devuelve el foco al botón que lo abrió.

---

## 3. Protocolo de Evaluación de Usabilidad (6 Tareas Académicas)

Conforme a la sección 5.7 de la rúbrica, se define la plantilla oficial de evaluación con las **6 tareas obligatorias** para aplicar durante las pruebas con usuarios reales en la exposición académica (sin inventar datos previos):

### Tareas de prueba definidas

1. **Tarea 1:** Contratar una suscripción floral en modalidad *"Para mí mismo"*.
2. **Tarea 2:** Contratar una suscripción floral en modalidad *"Para regalar a otra persona"* completando los datos del destinatario.
3. **Tarea 3:** Cambiar el tipo de flores en el configurador y comprobar el nuevo precio por entrega y ciclo en el resumen dinámico.
4. **Tarea 4:** Seleccionar el **Turno Mañana (9:00 a. m. a 1:00 p. m.)** en el paso de entrega.
5. **Tarea 5:** Modificar la frecuencia de una suscripción activa desde *Mis suscripciones* y verificar que el cambio queda programado para el siguiente ciclo.
6. **Tarea 6:** Cancelar una suscripción activa confirmando la acción en el modal y verificar que su estado cambia a *Cancelada* conservando su historial.

### Ficha de registro para sesiones de evaluación (Plantilla en blanco para uso real)

| ID Tarea | Descripción de la tarea | Éxito / Fracaso | Tiempo de realización (s) | Errores cometidos (n.º y tipo) | Dificultades observadas | Satisfacción declarada (1 a 5) |
|---|---|---|---|---|---|---|
| **T1** | Contratar suscripción para uno mismo | *Pendiente de sesión* | — | — | — | — |
| **T2** | Contratar suscripción para regalar | *Pendiente de sesión* | — | — | — | — |
| **T3** | Cambiar tipo de flores y comprobar precio | *Pendiente de sesión* | — | — | — | — |
| **T4** | Seleccionar el turno de mañana (9:00 a. m. - 1:00 p. m.) | *Pendiente de sesión* | — | — | — | — |
| **T5** | Modificar la frecuencia de una suscripción activa | *Pendiente de sesión* | — | — | — | — |
| **T6** | Cancelar una suscripción activa | *Pendiente de sesión* | — | — | — | — |

---

## 4. Lista de Verificación para la Demostración Académica en Vivo

Durante la exposición ante el docente o jurado, sigue este guion de verificación rápida:

- [ ] **1. Estructura de 3 vistas exactas:** Mostrar la navegación entre **Inicio (`/`)**, **Nosotros (`/nosotros`)** y **Suscripciones (`/suscripciones`)** desde el `Navbar`.
- [ ] **2. Modelo mental y Mapeo de precios en vivo:** En `/suscripciones`, seleccionar el **Plan Brote (`S/ 65.00`)**, pasar a *Personalizar*, cambiar el tamaño a **Grande (`S/ 135.00`)**, elegir **Selección de rosas (`+S/ 28.00`)** y marcar **Tarjeta caligráfica (`+S/ 8.00`)**. Mostrar cómo el resumen lateral actualiza el precio instantáneamente a `S/ 171.00` sin recargar la página.
- [ ] **3. Separación Comprador vs. Destinatario (Mapeo condicional):** En el Paso 3, alternar entre *"Para mí mismo"* y *"Para regalar a otra persona"* para mostrar cómo aparecen los campos específicos del destinatario.
- [ ] **4. Restricciones en Calendario y Turnos (`America/Lima`):** En el Paso 4, mostrar la fecha pasada bloqueada, intentar continuar sin elegir turno para evidenciar el mensaje de restricción, y luego seleccionar **Turno Mañana (9:00 a. m. a 1:00 p. m.)**.
- [ ] **5. Feedback en Simulación de Pago:** En el Paso 6, hacer clic primero en **Simular pago rechazado** para mostrar la alerta de error y comprobar que no se activa la suscripción. Luego hacer clic en **Reintentar con pago simulado exitoso** para activar la suscripción y ver el comprobante en el Paso 7.
- [ ] **6. Gestión, Modificación para el Próximo Ciclo y Renovación Simulada:** Ir a la pestaña **Mis suscripciones**, abrir **Cambiar plan, tamaño, flores o frecuencia**, guardar un cambio y mostrar el aviso que indica que el nuevo precio se aplicará en el próximo ciclo respetando el importe ya pagado. Pulsar **Simular renovación del ciclo #2 (Demo)** para demostrar cómo se aplica el cambio y se genera el nuevo cobro sin duplicados.
- [ ] **7. Entrega en Modo Demostración y Cancelación:** Pulsar **Marcar entregada (Demo)** en una entrega programada y luego cancelar la suscripción mediante el modal de confirmación para evidenciar el bloqueo de edición posterior y la conservación del historial.
- [ ] **8. Navegación por Teclado y Tecnologías de Apoyo:** Presionar `Tab` para mostrar el foco visible de alto contraste, abrir un modal con `Enter` y cerrarlo con `Escape` comprobando que el foco regresa al botón original.

---

## 5. Registro Real de Pruebas Automatizadas Ejecutadas

El proyecto cuenta con pruebas unitarias, de integración de interfaz y de accesibilidad automática con **Vitest v2.1.9**, **React Testing Library** y **axe-core** ubicadas en:

- `src/__tests__/business-logic.test.ts` (11 pruebas: cálculo de precios en PEN, frecuencias semanal/quincenal/mensual, validación de fechas en `America/Lima`, bloqueo de fechas pasadas, obligatoriedad de turnos, pagos simulados exitoso/rechazado/cancelado, prevención de pagos duplicados por `cycleId`, renovaciones automáticas simuladas, aplicación de cambios comerciales al siguiente ciclo y cancelación).
- `src/__tests__/interaction-and-a11y.test.tsx` (6 pruebas: mapeo instantáneo de precios en la interfaz, aparición condicional del formulario de destinatario, restricción de avance sin turno, alerta y reintento ante pago rechazado, gestión de foco y tecla `Escape` en `AccessibleModal` y auditoría `axe-core` con `0` violaciones semánticas).

### Resultado real de la ejecución (`npm test`)

- **Archivos de prueba:** `2 passed (2)`
- **Pruebas totales:** `17 passed (17)` (`0 failed`)
- **Duración total:** `9.14s` (`business-logic.test.ts`: `46ms`, `interaction-and-a11y.test.tsx`: `1019ms`)
- **Violaciones detectadas por `axe-core`:** `0`

Para ejecutar las pruebas en cualquier momento:

```bash
npm test
```
