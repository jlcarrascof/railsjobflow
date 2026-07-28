# 📱 Propuesta de Post para LinkedIn - Sprint 1 (RailsJobFlow)

---

## 📝 Post Sugerido (Lenguaje Sencillo, Tercera Persona)

🚀 **Construyendo Sistemas Asíncronos de Alta Escalabilidad: Presentando RailsJobFlow (Parte 1)**

Se dio inicio al desarrollo de **RailsJobFlow**, una plataforma diseñada para gestionar procesamiento asíncrono de alto rendimiento, observabilidad de tareas y control de idempotencia mediante una arquitectura moderna en Ruby on Rails 8.

En esta primera etapa (Sprint 1), se completó la infraestructura base orientada a microservicios y APIs REST:

⚡ **Logros Técnicos Implementados:**
- **Rails 8 API-Only:** Estructuración de la arquitectura backend desacoplada sin capa de vistas.
- **Persistencia Documental con MongoDB & Mongoid:** Implementación de almacén NoSQL orientado a documentos para registros flexibles de jobs.
- **Idempotencia Garantizada:** Diseño del modelo `WorkflowJob` equipado con un índice de unicidad en `idempotency_key`, previniendo la duplicación o reejecución accidental de tareas.
- **Procesamiento Asíncrono con Sidekiq & Redis:** Configuración de colas con prioridades estratégicas (`critical`, `default`, `low`) e integración del dashboard web para observabilidad en tiempo real.
- **Entorno Contenedorizado con Docker Compose:** Despliegue automatizado de servicios de base de datos e in-memory data store con un solo comando.
- **Salud del Sistema (Health Check API):** Creación del controlador de diagnóstico `/api/v1/health` que inspecciona la conectividad de Redis, MongoDB y métricas de Sidekiq.
- **Pruebas Automatizadas (RSpec + FactoryBot):** Suite de pruebas unitarias cubriendo el 100% de las validaciones del modelo y transiciones de estado.

La base técnica se encuentra lista para la siguiente fase: Workers resilientes con lógica de retries e idempotencia avanzada.

---

## 🏷️ Top 5 Hashtags Clave

#RubyOnRails #SystemDesign #SoftwareEngineering #MongoDB #Docker

---

## 📸 Sugerencias de Screenshots Claves para el Slider de LinkedIn

1. **Slide 1 (Infraestructura y Contenedores):** 
   - Captura dividida mostrando el archivo `docker-compose.yml` en el editor junto a la terminal con `docker compose ps` y el panel visual de **Docker Desktop** con las luces verdes de MongoDB y Redis.

2. **Slide 2 (API Health & Prueba en Vivo):** 
   - Captura del cliente HTTP (REST Client / Thunder Client) ejecutando `GET http://localhost:3001/api/v1/health` mostrando la respuesta JSON con `"status": "ok"`, `"redis": "connected"` y `"mongodb": "connected"`.

3. **Slide 3 (Suite de Pruebas RSpec 100% Green):** 
   - Captura de la terminal ejecutando `bundle exec rspec spec/models/workflow_job_spec.rb` mostrando los 6 ejemplos aprobados en verde (🟢) comprobando las validaciones y la unicidad del `idempotency_key`.
