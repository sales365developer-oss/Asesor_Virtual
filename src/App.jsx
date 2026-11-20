import React, { useEffect, useRef, useState } from "react";
import { AudioLines, Heart, Mic, MicOff, RotateCcw, Settings2, Sparkles, Volume2, Waves } from "lucide-react";

export default function App() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [notice, setNotice] = useState("Presiona el micrófono y conversemos");
  const [heardText, setHeardText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const conversationRef = useRef([]);

  useEffect(() => () => {
    recognitionRef.current?.stop?.();
    audioRef.current?.pause?.();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  async function speak(text) {
    setNotice("Preparando mi voz…");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(apiUrl + "/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        let message = "No pude generar mi voz.";
        try { message = (await response.json()).error || message; } catch {}
        throw new Error(message);
      }

      const audioBlob = await response.blob();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onplay = () => {
        setSpeaking(true);
        setNotice("Jhoel te está hablando");
      };
      audio.onended = () => {
        setSpeaking(false);
        setNotice("Cuando quieras, puedes volver a hablar");
        URL.revokeObjectURL(audioUrl);
        if (audioUrlRef.current === audioUrl) audioUrlRef.current = null;
      };
      audio.onerror = () => {
        setSpeaking(false);
        setNotice("No se pudo reproducir el audio. Comprueba el sonido de tu dispositivo.");
      };
      await audio.play();
    } catch (error) {
      console.error("Error de voz:", error);
      setSpeaking(false);
      setNotice(error.message || "No pude generar la voz de Jhoel.");
    }
  }

  async function askJhoel(transcript) {
    setThinking(true);
    setNotice("Estoy pensando en lo que me has dicho…");
    const messages = [...conversationRef.current, { role: "user", content: transcript }];
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(apiUrl + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo consultar el modelo de IA.");
      conversationRef.current = [...messages, { role: "assistant", content: data.reply }].slice(-20);
      await speak(data.reply);
    } catch (error) {
      console.error("Error al consultar Jhoel:", error);
      setNotice(error.message || "No pude conectarme con el modelo de IA.");
    } finally {
      setThinking(false);
    }
  }

  function toggleListening() {
    if (speaking) {
      audioRef.current?.pause?.();
      audioRef.current.currentTime = 0;
      setSpeaking(false);
      setNotice("Respuesta detenida. Puedes volver a hablar.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop?.();
      setListening(false);
      setNotice("Escucha detenida");
      return;
    }
    if (thinking) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNotice("El reconocimiento de voz no está disponible. Abre Jhoel en Chrome o Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-PE";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onstart = () => {
        setListening(true);
        setHeardText("");
        setNotice("Te estoy escuchando…");
      };
      recognition.onresult = event => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        setListening(false);
        if (transcript) {
          setHeardText(transcript);
          askJhoel(transcript);
        } else setNotice("No logré escucharte. Inténtalo otra vez.");
      };
      recognition.onerror = event => {
        setListening(false);
        setNotice(event.error === "not-allowed"
          ? "Necesito permiso para usar tu micrófono."
          : "No pude escuchar bien. Inténtalo nuevamente.");
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setListening(false);
      setNotice("No se pudo iniciar el micrófono. Revisa los permisos.");
    }
  }

  function resetConversation() {
    recognitionRef.current?.stop?.();
    audioRef.current?.pause?.();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    audioRef.current = null;
    conversationRef.current = [];
    setListening(false);
    setSpeaking(false);
    setThinking(false);
    setHeardText("");
    setNotice("Conversación reiniciada. Estoy lista para escucharte.");
    setShowSettings(false);
  }

  const mode = listening ? "listening" : thinking ? "thinking" : speaking ? "speaking" : "idle";

  return (
    <main className="jhoel-app">
      <header className="jhoel-header">
        <a className="jhoel-brand" href="#" aria-label="Jhoel">
          <span className="jhoel-brand-icon"><AudioLines size={23}/></span>
          <span><strong>jhoel</strong><small>ASISTENTE VIRTUAL</small></span>
        </a>
        <div className="header-right">
          <span className="status-chip"><i/> LISTA PARA TI</span>
          <button className="settings-trigger" onClick={() => setShowSettings(value => !value)} aria-label="Configuración"><Settings2 size={19}/></button>
        </div>
      </header>

      {showSettings && (
        <section className="jhoel-settings">
          <strong>Tu sesión</strong>
          <p>La conversación se mantiene mientras esta página esté abierta.</p>
          <button onClick={resetConversation}><RotateCcw size={15}/> Reiniciar conversación</button>
        </section>
      )}

      <section className="voice-main">
        <div className="intro-copy">
          <span className="eyebrow"><Sparkles size={14}/> TU ASISTENTE PERSONAL</span>
          <h1>Hola, soy <span>Jhoel.</span></h1>
          <p>Estoy aquí para escucharte y ayudarte.<br/>¿Qué te gustaría conversar hoy?</p>
        </div>

        <div className={"voice-visual voice-" + mode} aria-label={notice}>
          <div className="orbit orbit-one"/>
          <div className="orbit orbit-two"/>
          <div className="orbit orbit-three"/>
          <div className="voice-core">
            <div className="core-shine"/>
            <div className="core-wave"><i/><i/><i/><i/><i/><i/><i/></div>
          </div>
          <div className="visual-caption">{listening ? "TE ESCUCHO" : thinking ? "PENSANDO" : speaking ? "HABLANDO" : "AQUÍ CONTIGO"}</div>
        </div>

        <div className="interaction">
          <button className={"main-mic " + (listening ? "mic-active" : "")} onClick={toggleListening} disabled={thinking} aria-label={listening ? "Detener micrófono" : speaking ? "Detener voz" : "Hablar con Jhoel"}>
            {listening ? <MicOff size={27}/> : speaking ? <Volume2 size={27}/> : <Mic size={27}/>}
          </button>
          <strong>{listening ? "Te estoy escuchando…" : thinking ? "Déjame pensar…" : speaking ? "Estoy hablando…" : "Pulsa para hablar"}</strong>
          <span className="status-message" aria-live="polite">{notice}</span>
        </div>

        {heardText && <div className="last-heard"><span>LO QUE ME DIJISTE</span><p>“{heardText}”</p></div>}

        <div className="voice-hints">
          <div><Waves size={17}/><span>Conversación<br/>natural</span></div>
          <div><Sparkles size={17}/><span>Inteligencia<br/>artificial</span></div>
          <div><Heart size={17}/><span>Cercana y<br/>profesional</span></div>
        </div>
      </section>

      <footer className="jhoel-footer">
        <span><Heart size={13}/> Jhoel · Siempre contigo</span>
        <span>Tu voz, tu espacio, tu conversación.</span>
      </footer>
    </main>
  );
}
