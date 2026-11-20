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


## Backend de IA con Groq

El chat ahora consulta un backend Node.js/Express. La clave de Groq debe mantenerse en un archivo `.env` local y nunca subirse al repositorio.

1. Crea `.env` en la raíz del proyecto con:

```env
GROQ_API_KEY=tu_clave_de_groq
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
# Opcional: GROQ_MODEL=openai/gpt-oss-20b
```

2. Instala dependencias:

```bash
npm install
```

3. Abre una terminal y ejecuta el backend:

```bash
npm run server
```

4. En otra terminal inicia Vite:

```bash
npm run dev
```

5. Abre `http://localhost:5173`. El backend también ofrece `http://localhost:3001/api/health` para comprobar que está activo.

El modelo predeterminado es `openai/gpt-oss-20b`. Puedes cambiarlo mediante `GROQ_MODEL` si tu cuenta tiene acceso a otro modelo compatible.
