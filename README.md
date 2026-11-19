# Jhoel — demo web

Primera etapa de la asistente virtual Jhoel: interfaz React + Vite, responsive, con chat de demostración, reconocimiento de voz del navegador y lectura de respuestas mediante SpeechSynthesis.

## Requisitos
- Node.js 20 o superior recomendado
- npm
- Google Chrome o Microsoft Edge para probar el micrófono

## Ejecutar en tu computadora

1. Descomprime el proyecto.
2. Abre una terminal dentro de la carpeta `jhoel-ai-demo`.
3. Ejecuta:

```bash
npm install
npm run dev
```

4. Abre la dirección que muestra Vite, normalmente `http://localhost:5173`.

## Probar desde el celular en la misma red Wi-Fi

Ejecuta `npm run dev -- --host 0.0.0.0` y abre en el celular `http://IP-DE-TU-PC:5173`. Ambos dispositivos deben estar en la misma red. Para el micrófono, los navegadores suelen exigir HTTPS o localhost; el acceso por IP local HTTP puede no habilitarlo.

## Estado de esta primera etapa

- La interfaz y el chat visual funcionan.
- El botón del micrófono usa el reconocimiento de voz del navegador si está disponible.
- Las respuestas son demostrativas: **todavía no hay un LLM conectado**.
- La voz utiliza SpeechSynthesis del dispositivo; la voz femenina depende de las voces instaladas en el navegador/sistema.
- No hay backend ni claves API en esta etapa.

## Siguiente etapa
Conectar el backend a un proveedor LLM (por ejemplo Groq) sin exponer la API key en el navegador. Luego añadiremos memoria de conversación y afinaremos la voz/avatar.
