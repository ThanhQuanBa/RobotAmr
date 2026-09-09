export const VOICE_SILENCE_MS = 2000;

// Keep recognition callbacks independent of React renders and submit each turn once.
export function createVoiceSession({ recognition, onTranscript, onSubmit, onClose, onError,
  silenceMs = VOICE_SILENCE_MS, schedule = setTimeout, cancel = clearTimeout }) {
  let timer;
  let closed = false;
  let stopping = false;
  let prefix = '';
  let text = '';
  const clearTimer = () => { cancel(timer); timer = undefined; };
  const finish = (submit) => {
    if (closed) return;
    closed = true;
    clearTimer();
    // Engines may already be stopped when navigating away or reloading.
    try { recognition.abort(); } catch { /* Cleanup must still complete. */ }
    onClose();
    if (submit && text.trim()) onSubmit(text.trim());
  };
  const stop = () => {
    if (closed || stopping) return;
    stopping = true;
    clearTimer();
    // Allow the engine to deliver its last final result before submitting.
    timer = schedule(() => finish(true), 500);
    try { recognition.stop(); } catch { finish(true); }
  };
  const arm = () => {
    clearTimer();
    if (text.trim()) timer = schedule(stop, silenceMs);
  };
  recognition.onresult = (event) => {
    if (closed) return;
    let final = prefix;
    let interim = '';
    for (let i = 0; i < event.results.length; i++) {
      if (event.results[i].isFinal) final += ' ' + event.results[i][0].transcript;
      else interim += ' ' + event.results[i][0].transcript;
    }
    text = (final + ' ' + interim).trim();
    onTranscript(final.trim(), interim.trim());
    if (!stopping) arm();
  };
  recognition.onspeechstart = () => { if (!closed && !stopping) clearTimer(); };
  recognition.onspeechend = () => { if (!closed && !stopping) arm(); };
  recognition.onerror = (event) => {
    if (closed) return;
    if (event.error === 'no-speech') return;
    finish(false);
    onError(event.error);
  };
  recognition.onend = () => {
    if (closed) return;
    if (stopping) { finish(true); return; }
    // Some engines end a continuous session at a short pause. Keep listening
    // through the remaining silence window, preserving the preceding words.
    if (!text.trim()) { finish(false); return; }
    prefix = text;
    try { recognition.start(); } catch { finish(true); }
  };
  return { submit: stop, cancel: () => finish(false) };
}
