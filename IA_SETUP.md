# Configuración de Inteligencia Artificial Médica con Deepseek

## 📋 Descripción

Se ha agregado un asistente de IA médica inteligente que permite consultar sobre datos de pacientes y obtener recomendaciones médicas precisas usando el modelo de Deepseek.

## 🎯 Características

- **Análisis Inteligente de Datos Clínicos**: La IA analiza automáticamente:
  - Presión arterial y glucosa en sangre
  - Hemogramas completos
  - Historial médico (enfermedades, alergias, medicamentos)
  - Tendencias en valores clínicos
  
- **Recomendaciones Médicas**: Sugiere:
  - Procedimientos médicos adicionales
  - Estudios recomendados basados en los datos
  - Alertas sobre valores críticos
  - Interpretación de resultados

- **Chat Interactivo**: Interfaz intuitiva para formular preguntas específicas

- **Acciones Rápidas**: Botones para consultas comunes:
  - Analizar vitales
  - Pedir recomendaciones
  - Interpretar hemograma
  - Verificar alertas

## 🔧 Configuración Inicial

### 1. Obtener API Key de Deepseek

1. Visita [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. Crea una cuenta o inicia sesión
3. Ve a la sección de "API Keys"
4. Crea una nueva API key
5. Copia la clave (empezará con `sk_`)

### 2. Configurar Variables de Entorno

1. Copia el archivo `.env.local.example` a `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edita `.env.local` y reemplaza tu API key:
   ```
   DEEPSEEK_API_KEY=sk_your_actual_api_key_here
   ```

### 3. Iniciar la Aplicación

```bash
pnpm dev
```

## 📱 Cómo Usar

### Acceso al Consultor de IA

1. Navega al **Panel de Pacientes** (Dashboard)
2. Selecciona el botón **"Consultor IA"** en el menú lateral
3. Selecciona un paciente (o busca uno primero)
4. Se abrirá la interfaz de chat con los datos del paciente cargados

### Tipos de Consultas

**Ejemplo 1 - Análisis de Vitales:**
```
"El paciente tiene presión arterial de 145/95. ¿Qué significa esto y qué debo hacer?"
```

**Ejemplo 2 - Recomendaciones:**
```
"¿Qué procedimientos médicos me recomiendas para este paciente dado su historial?"
```

**Ejemplo 3 - Interpretación de Laboratorio:**
```
"Los glóbulos blancos están en 6.5 K/μL. ¿Es normal para esta edad?"
```

**Ejemplo 4 - Alertas:**
```
"¿Hay algún valor crítico que deba alertar al paciente?"
```

## 📊 Archivos Creados

```
src/
├── app/
│   └── api/
│       └── ai/
│           └── medical-consultation/
│               └── route.ts          # Endpoint de la IA
└── components/
    └── ai/
        └── MedicalAIConsultant.tsx   # Componente de chat médico
```

## 🔐 Seguridad

- La API key se mantiene segura en el servidor (`.env.local`)
- Los datos del paciente se envían de forma segura al servidor
- La comunicación con Deepseek es cifrada (HTTPS)
- Se incluye un disclaimer indicando que esto no reemplaza la consulta médica profesional

## ⚠️ Notas Importantes

1. **No es Sustituto de Profesionales**: El sistema proporciona información educativa e informativa. Las recomendaciones deben ser validadas por profesionales médicos calificados.

2. **Privacidad de Datos**: Asegúrate de cumplir con las regulaciones de protección de datos médicos (HIPAA, RGPD, etc.)

3. **Responsabilidad Legal**: Los hospitales/clínicas son responsables de revisar todas las recomendaciones de IA antes de usarlas en tratamientos.

4. **Costo de API**: Deepseek cobra por uso de API. Monitorea tu uso para evitar cargos inesperados.

## 🚀 Optimizaciones Futuras

- [ ] Agregar historial de consultas por paciente
- [ ] Exportar reportes de consultas de IA
- [ ] Integrar más modelos de IA
- [ ] Caché de respuestas para consultas similares
- [ ] Análisis de tendencias a largo plazo
- [ ] Alertas automáticas basadas en umbrales clínicos

## 🐛 Troubleshooting

### Error: "API key no configurada"
- Verifica que `.env.local` existe y contiene `DEEPSEEK_API_KEY`
- Reinicia el servidor (`pnpm dev`)

### Error: "Error al consultar la IA médica"
- Verifica que tu API key de Deepseek es válida
- Verifica tu saldo/cuota en el dashboard de Deepseek
- Revisa la consola del servidor para más detalles

### La IA no responde rápido
- Puede deberse a latencia de red
- Intenta con una pregunta más específica
- Deepseek puede estar saturado (intenta después)

## 📚 Recursos

- [Documentación de Deepseek API](https://platform.deepseek.com/docs)
- [Modelos disponibles](https://platform.deepseek.com/docs/api/models)
- [Pricing de Deepseek](https://platform.deepseek.com/pricing)
