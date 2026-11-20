# Jhoel — asistente virtual por voz

Jhoel es una asistente web de voz con frontend React + Vite y backend Node.js + Express. El modelo conversacional se conecta a Groq; las respuestas se convierten en voz con ElevenLabs. El navegador reconoce el habla del usuario en español peruano.

## Requisitos
- Node.js 20 o superior
- npm
- Google Chrome o Microsoft Edge
- Cuenta y API key de Groq
- Cuenta y API key de ElevenLabs, además del ID de una voz de la biblioteca

## Configuración local

1. Instala dependencias:

```bash
npm install
```

2. Crea un archivo `.env` en la raíz copiando `.env.example`.
3. Configura las variables:
   - `GROQ_API_KEY`: clave privada de Groq.
   - `GROQ_MODEL`: modelo disponible en tu cuenta.
   - `ELEVENLABS_API_KEY`: clave privada de ElevenLabs.
   - `ELEVENLABS_VOICE_ID`: ID de la voz femenina seleccionada en ElevenLabs.
   - `ELEVENLABS_MODEL`: por defecto `eleven_multilingual_v2`.
   - `PORT=3001`.
   - `FRONTEND_ORIGIN=http://localhost:5173`.

**Nunca subas el archivo `.env` a GitHub ni compartas tus claves API.**

## Ejecutar

Abre dos terminales en la carpeta del proyecto.

Terminal 1 — backend:

```bash
npm run server
```

Terminal 2 — frontend:

```bash
npm run dev
```

Abre `http://localhost:5173`.

Comprueba el backend en `http://localhost:3001/api/health`. La respuesta indica si las claves de modelo y voz están configuradas.

## Voz de Jhoel

La aplicación usa el reconocimiento de voz del navegador para escuchar al usuario. El navegador debe permitir el acceso al micrófono y, al publicar, la web debe funcionar con HTTPS.

La respuesta se genera con el endpoint de Text to Speech de ElevenLabs. El backend devuelve el audio al navegador sin exponer la API key. La voz y el modelo se configuran mediante variables de entorno. Para una voz femenina cálida y profesional en español, selecciona y prueba una voz de acento latino en la Voice Library de ElevenLabs y copia su Voice ID.

Documentación oficial:
- [ElevenLabs — Text to Speech API](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)
- [ElevenLabs — Voice Library](https://elevenlabs.io/voice-library)

## Conocimiento comercial Markdown

Coloca el documento que proporciones en:

```
knowledge/contexto_ventas.md
```

El backend lo lee automáticamente en cada consulta y lo incorpora a las instrucciones de Jhoel junto con el historial reciente. No se necesita entrenar ni ajustar el modelo. El archivo no se sirve desde el frontend.

El documento puede incluir catálogo y características de productos, políticas, precios vigentes, argumentos, guiones y manejo de objeciones. Evita incluir contraseñas, API keys o datos personales sensibles. Mantén el archivo actualizado cuando cambien los productos o las condiciones comerciales.

## Endpoints

- `GET /api/health`: estado del backend y configuración de servicios.
- `POST /api/chat`: consulta el modelo de Groq.
- `POST /api/tts`: convierte el texto de respuesta en audio MP3 con ElevenLabs.

## Arquitectura actual

- Frontend: React + Vite, interfaz minimalista de ondas de audio, sin chat escrito ni avatar.
- Reconocimiento de voz: Web Speech API del navegador.
- Modelo conversacional: Groq.
- Voz de respuesta: ElevenLabs.
- Contexto comercial: archivo local `knowledge/contexto_ventas.md`.
