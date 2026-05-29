-- Indices justificados para consultas frecuentes de la API StudySync.
-- Se usa IF NOT EXISTS para que la migracion sea segura si algun indice ya existe.

CREATE INDEX IF NOT EXISTS "Usuario_rol_idx" ON "Usuario"("rol");

CREATE INDEX IF NOT EXISTS "Materia_semestre_idx" ON "Materia"("semestre");

CREATE INDEX IF NOT EXISTS "Grupo_materiaId_idx" ON "Grupo"("materiaId");
CREATE INDEX IF NOT EXISTS "Grupo_organizadorId_idx" ON "Grupo"("organizadorId");

CREATE INDEX IF NOT EXISTS "Sesion_fecha_idx" ON "Sesion"("fecha");
CREATE INDEX IF NOT EXISTS "Sesion_materiaId_idx" ON "Sesion"("materiaId");
CREATE INDEX IF NOT EXISTS "Sesion_usuarioId_idx" ON "Sesion"("usuarioId");

CREATE INDEX IF NOT EXISTS "Recurso_tipo_idx" ON "Recurso"("tipo");
CREATE INDEX IF NOT EXISTS "Recurso_materiaId_idx" ON "Recurso"("materiaId");
CREATE INDEX IF NOT EXISTS "Recurso_usuarioId_idx" ON "Recurso"("usuarioId");
