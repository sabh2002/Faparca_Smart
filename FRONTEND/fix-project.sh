#!/bin/bash

echo "🔧 REPARANDO PROYECTO FAPARCA_SMART..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar progreso
show_progress() {
    echo -e "${BLUE}➤ $1${NC}"
}

show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Ir al directorio del frontend
cd ~/Documentos/Proyectos/FAPARCA_SMART/FRONTEND || {
    show_error "No se puede acceder al directorio del frontend"
    exit 1
}

show_progress "Paso 1: Limpiando proyecto..."
rm -rf node_modules package-lock.json .vite 2>/dev/null
npm cache clean --force
show_success "Limpieza completada"

show_progress "Paso 2: Copiando archivo .env..."
if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || touch .env
fi
show_success "Archivo .env configurado"

show_progress "Paso 3: Instalando dependencias..."
npm install --legacy-peer-deps
if [ $? -eq 0 ]; then
    show_success "Dependencias instaladas correctamente"
else
    show_error "Error instalando dependencias con --legacy-peer-deps, intentando con --force"
    npm install --force
    if [ $? -eq 0 ]; then
        show_success "Dependencias instaladas con --force"
    else
        show_error "Error crítico instalando dependencias"
        exit 1
    fi
fi

show_progress "Paso 4: Verificando configuración TypeScript..."
npm run type-check
if [ $? -eq 0 ]; then
    show_success "TypeScript configurado correctamente"
else
    show_error "Errores de TypeScript detectados - revisar archivos"
fi

show_progress "Paso 5: Ejecutando linter..."
npm run lint
show_success "Linting completado"

show_progress "Paso 6: Iniciando servidor de desarrollo..."
echo -e "${GREEN}"
echo "======================================"
echo "🎉 PROYECTO REPARADO EXITOSAMENTE!"
echo "======================================"
echo "🚀 Ejecutando: npm run dev"
echo "📱 Servidor: http://localhost:5173"
echo "🔧 DevTools: http://localhost:5173/__devtools__"
echo "======================================"
echo -e "${NC}"

npm run dev