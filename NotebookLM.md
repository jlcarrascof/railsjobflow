# 📘 NotebookLM - Guía de Aprendizaje e Hitos Técnicos (Sprint 1)
> **Proyecto:** RailsJobFlow
> **Tecnologías:** Rails 8 API + MongoDB (Mongoid) + Sidekiq + Redis + Docker Compose + RSpec

---

## 💡 Conceptos Clave Aprendidos

### 1. Rails 8 en Modo API (`--api`)
- **Qué es:** Una aplicación de Rails donde se eliminan las vistas HTML, sesiones basadas en cookies y activos estáticos (Sass/JS/Assets), enfocándose únicamente en recibir y responder datos estructurados en JSON.
- **Por qué:** Es el estándar cuando el cliente es una aplicación SPA (Single Page Application) independiente en React o Next.js.

### 2. Base de Datos Documental: MongoDB con Mongoid
- **Diferencia vs ActiveRecord / SQL:** En ActiveRecord (PostgreSQL/MySQL), los datos residen en tablas relacionales con esquemas estrictos que requieren archivos de migración (`rails db:migrate`). En Mongoid (MongoDB), los datos se almacenan como documentos JSON/BSON flexibles dentro de colecciones.
- **No hay migraciones:** Los modelos Ruby definen la estructura con el método `field`, permitiendo evolucionar el esquema sin alterar tablas de producción.

### 3. Patrón de Idempotencia (`idempotency_key`)
- **Problema en Background Jobs:** Si un cliente reintenta una petición HTTP o el worker falla a medio camino, un trabajo podría procesarse más de una vez (ej. cobro duplicado o envío múltiple de emails).
- **Solución:** Creamos una clave única (`idempotency_key`) con un índice de unicidad en MongoDB (`index({ idempotency_key: 1 }, { unique: true, sparse: true })`). Si se intenta insertar un boleto duplicado, la base de datos aborta la creación.

### 4. Background Jobs con Sidekiq y Redis
- **Procesamiento Asíncrono:** Mover tareas pesadas fuera del ciclo solicitud/respuesta HTTP de Rails.
- **Colas Prioritarias (`config/sidekiq.yml`):**
  - `critical` (ponderación 3): Trabajos de alta prioridad.
  - `default` (ponderación 2): Operaciones normales.
  - `low` (ponderación 1): Tareas lentas (correos, reportes).
- **Rastreo con `sidekiq-status`:** Middleware para consultar el estado en tiempo real de cada job en Redis.

### 5. Contenedores con Docker Compose v2
- **Aislamiento e Infraestructura:** Levantamiento de `mongodb:7.0` (puerto 27017) y `redis:7.2-alpine` (puerto 6379).
- **Formato Moderno:** En Compose v2 se omite la propiedad de nivel superior `version: '3.8'` para evitar advertencias de obsolescencia.

---

## ❓ Dudas Resueltas Durante el Sprint

1. **¿Cómo trabajar con MongoDB desde Venezuela sin problemas de bloqueo político o VPN?**
   - **Respuesta:** En entornos de desarrollo (`development`) y pruebas (`test`), MongoDB corre localmente (`localhost:27017` o en Docker local), lo que funciona 100% desconectado de internet y sin necesidad de VPN. La VPN solo aplicaría para servicios cloud como MongoDB Atlas en producción.

2. **¿Por qué aparecía la carpeta `tmp/cache/bootsnap` sin trackear en Git?**
   - **Respuesta:** Bootsnap es un optimizador de inicio de Rails. Genera archivos temporales de bytecode en `tmp/cache/`. La regla inicial de `.gitignore` (`tmp/*`) solo aplicaba al nivel raíz; la actualizamos a `**/tmp/` para ignorar carpetas temporales en subdirectorios como `backend/tmp/`.

3. **¿Por qué ocurrió el error `error getting credentials - err: fork/exec /usr/bin/docker-credential-desktop.exe` en WSL?**
   - **Respuesta:** Al activar la integración con Windows en Docker Desktop, `~/.docker/config.json` en Linux intentaba llamar a `desktop.exe`. Se solucionó removiendo `"credsStore": "desktop.exe"` para usar las credenciales locales de Linux directamente.

---

## 🧪 Resumen de Pruebas Automáticas (`RSpec`)

- Pruebas del modelo `WorkflowJob`:
  - Validaciones de presencia de `title` e inclusión de `status`.
  - Transiciones de estado (`#mark_running!`, `#mark_completed!`, `#mark_failed!`).
  - Verificación de unicidad del `idempotency_key`.
- **Resultado:** 6 ejemplos ejecutados en 0.47 segundos con **0 fallas** (🟢).
