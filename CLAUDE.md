@AGENTS.md

# CLAUDE.md

Las instrucciones del proyecto viven en `AGENTS.md` (fuente única para todos los agentes):

@AGENTS.md

## Recordatorios para Claude

- Antes de crear un archivo, lee uno existente del mismo tipo y replica su convención.
- Al crear casos de uso o repositorios, aplica siempre la inversión de dependencias descrita en `AGENTS.md`: interfaz en `domain`, implementación en `infrastructure`, inyección por constructor en el caso de uso.
- Verifica con `npm test` y `npx tsc` antes de terminar.
