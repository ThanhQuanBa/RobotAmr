import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Globe, MapPin, Send, Trash2, StopCircle } from 'lucide-react';
import './AIGuide.css';
import { createVoiceSession, VOICE_SILENCE_MS } from './voiceSession';

const API = window.location.origin;

// Generate unique session ID
const SESSION_ID = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function AIGuide() {
  const [isRecording, setIsRecording] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Xin chào! 👋 Tôi là AI Tour Guide của SmartBus. Hãy hỏi tôi bất cứ điều gì về các địa điểm trong campus nhé! Bạn có thể gõ hoặc nhấn nút micro để nói.', timestamp: new Date().toISOString() }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPoi, setCurrentPoi] = useState('Main Hall');
  const [language, setLanguage] = useState('vi');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceSessionRef = useRef(null);
  const processingRef = useRef(false);
  const sendMessageRef = useRef(null);
  const visualizationGenerationRef = useRef(0);
  const synthRef = useRef(null);
  const requestRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  const poiOptions = ['Main Hall', 'Exhibition A', 'Garden Area', 'Museum Wing'];
  const languages = [
    { code: 'vi', label: '🇻🇳 Tiếng Việt', speechCode: 'vi-VN' },
    { code: 'en', label: '🇬🇧 English', speechCode: 'en-US' },
    { code: 'ja', label: '🇯🇵 日本語', speechCode: 'ja-JP' },
    { code: 'ko', label: '🇰🇷 한국어', speechCode: 'ko-KR' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    try { synthRef.current = window.speechSynthesis || null; } catch { synthRef.current = null; }
    return () => {
      requestRef.current?.abort();
      voiceSessionRef.current?.cancel();
      visualizationGenerationRef.current++;
      if (audioContextRef.current?.state !== "closed") audioContextRef.current?.close().catch(() => {});
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Audio level visualization for microphone
  const startAudioVisualization = useCallback(async () => {
    const generation = ++visualizationGenerationRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation !== visualizationGenerationRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 128); // Normalize to 0-2
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.warn('Could not access microphone for visualization:', err);
    }
  }, []);

  const stopAudioVisualization = useCallback(() => {
    visualizationGenerationRef.current++;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Text-to-Speech
  const speakText = useCallback((text) => {
    if (!synthRef.current || !text || typeof window.SpeechSynthesisUtterance !== 'function') return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const currentLang = languages.find(l => l.code === language);
    utterance.lang = currentLang?.speechCode || 'vi-VN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a matching voice
    const voices = synthRef.current.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(currentLang?.speechCode?.split('-')[0] || 'vi'));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, [language, languages]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Voice Recognition
  const handleMicClick = useCallback(() => {
    if (voiceSessionRef.current) {
      voiceSessionRef.current.cancel();
      return;
    }
    if (processingRef.current) return;

    // Stop TTS if playing
    stopSpeaking();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: language === 'vi'
          ? '⚠️ Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome hoặc Edge để có trải nghiệm tốt nhất, hoặc gõ câu hỏi phía dưới.'
          : '⚠️ Your browser does not support voice recognition. Please use Chrome or Edge for the best experience, or type your question below.',
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    let recognition;
    try { recognition = new SpeechRecognition(); } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Không thể khởi tạo micro trong trình duyệt này. Bạn vẫn có thể nhập câu hỏi.', timestamp: new Date().toISOString() }]);
      return;
    }
    const currentLang = languages.find(l => l.code === language);
    recognition.lang = currentLang?.speechCode || 'vi-VN';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    let started = false;
    recognition.onstart = () => {
      if (recognitionRef.current !== recognition || started) return;
      started = true;
      startAudioVisualization();
    };
    const showVoiceError = () => {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: language === 'vi'
          ? 'Nhận giọng nói bị gián đoạn. Vui lòng kiểm tra quyền micro và thử lại, hoặc gửi phần câu hỏi đã nhận trong ô nhập.'
          : 'Voice recognition failed. Please check microphone access and try again, or send the captured text below.',
        timestamp: new Date().toISOString()
      }]);
    };
    voiceSessionRef.current = createVoiceSession({
      recognition,
      onTranscript: (final, interim) => {
        setQuery(final);
        setInterimTranscript(interim);
      },
      onSubmit: (text) => sendMessageRef.current(text),
      onClose: () => {
        recognitionRef.current = null;
        voiceSessionRef.current = null;
        setIsRecording(false);
        setInterimTranscript('');
        stopAudioVisualization();
      },
      onError: showVoiceError
    });
    setIsRecording(true);
    setQuery('');
    setInterimTranscript('');
    try { recognition.start(); } catch {
      voiceSessionRef.current?.cancel();
      showVoiceError();
    }
  }, [language, languages, stopSpeaking, startAudioVisualization, stopAudioVisualization]);

  const handleSendVoice = () => voiceSessionRef.current?.submit();

  const sendMessage = async (text) => {
    if (!text.trim() || processingRef.current) return;
    processingRef.current = true;

    setMessages(prev => [...prev, { sender: 'user', text: text.trim(), timestamp: new Date().toISOString() }]);
    setQuery('');
    setInterimTranscript('');
    setIsProcessing(true);

    // Stop any ongoing TTS
    stopSpeaking();

    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const res = await fetch(`${API}/api/ai/ask`, {
        signal: controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text.trim(),
          poiName: currentPoi,
          language,
          sessionId: SESSION_ID
        })
      });
      if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
      const data = await res.json();
      if (controller.signal.aborted) return;
      if (typeof data.answer !== 'string') throw new Error('Invalid AI answer');

      const aiMessage = {
        sender: 'ai',
        text: data.answer,
        poi: data.poiContext,
        timestamp: data.timestamp || new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Auto-speak the response
      if (autoSpeak && data.answer) {
        speakText(data.answer);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: language === 'vi'
          ? '❌ Xin lỗi, tôi không thể kết nối với hệ thống AI. Vui lòng kiểm tra kết nối mạng và thử lại.'
          : '❌ Sorry, I could not connect to the AI system. Please check your connection and try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  sendMessageRef.current = sendMessage;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && query.trim() && !isProcessing) {
      sendMessage(query);
    }
  };

  const clearChat = () => {
    voiceSessionRef.current?.cancel();
    setQuery('');
    stopSpeaking();
    setMessages([{
      sender: 'ai',
      text: language === 'vi'
        ? 'Xin chào! 👋 Cuộc trò chuyện đã được làm mới. Hỏi tôi bất cứ điều gì nhé!'
        : 'Hello! 👋 Conversation has been reset. Ask me anything!',
      timestamp: new Date().toISOString()
    }]);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-container ai-guide">
      {/* Left: AI Avatar & Controls */}
      <div className="ai-avatar-section">
        <div className={`avatar-orb ${isProcessing ? 'thinking' : ''} ${isRecording ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
          style={isRecording ? { '--audio-level': audioLevel } : {}}>
          <div className="orb-core"></div>
          <div className="orb-ring ring-1"></div>
          <div className="orb-ring ring-2"></div>
          <div className="orb-ring ring-3"></div>
          {isRecording && (
            <div className="sound-waves">
              <span style={{ '--delay': '0s', '--height': `${20 + audioLevel * 20}px` }}></span>
              <span style={{ '--delay': '0.1s', '--height': `${15 + audioLevel * 25}px` }}></span>
              <span style={{ '--delay': '0.2s', '--height': `${25 + audioLevel * 15}px` }}></span>
              <span style={{ '--delay': '0.15s', '--height': `${18 + audioLevel * 22}px` }}></span>
              <span style={{ '--delay': '0.05s', '--height': `${22 + audioLevel * 18}px` }}></span>
            </div>
          )}
          {!isRecording && <Sparkles className="sparkle-icon" size={28} />}
        </div>

        <div className="ai-status">
          {isRecording ? (
            <span className="status-recording">
              <span className="recording-dot"></span>
              {language === 'vi' ? 'Đang nghe...' : 'Listening...'}
            </span>
          ) : isSpeaking ? (
            <span className="status-speaking">🔊 {language === 'vi' ? 'Đang nói...' : 'Speaking...'}</span>
          ) : isProcessing ? (
            <span className="status-thinking">🧠 {language === 'vi' ? 'Đang suy nghĩ...' : 'Thinking...'}</span>
          ) : (
            <span className="status-ready">✨ {language === 'vi' ? 'Sẵn sàng' : 'Ready'}</span>
          )}
        </div>

        <p className="voice-hint">
          {language === 'vi'
            ? `Nhấn micro và nói câu hỏi. AI tự trả lời sau ${VOICE_SILENCE_MS / 1000} giây im lặng. Nhấn micro lần nữa để hủy.`
            : `Tap the microphone and ask. AI answers after ${VOICE_SILENCE_MS / 1000} seconds of silence. Tap again to cancel.`}
        </p>

        {/* Interim transcript display */}
        {(isRecording && (interimTranscript || query)) && (
          <div className="interim-transcript glass-panel">
            <p className="transcript-text">
              {query && <span className="final-text">{query}</span>}
              {interimTranscript && <span className="interim-text"> {interimTranscript}</span>}
            </p>
            <button className="btn btn-primary btn-sm send-voice-btn" onClick={handleSendVoice} disabled={!(query || interimTranscript).trim()}>
              <Send size={14} /> {language === 'vi' ? 'Gửi' : 'Send'}
            </button>
          </div>
        )}

        {/* POI Selector */}
        <div className="context-controls glass-panel">
          <div className="control-row">
            <MapPin size={16} color="var(--primary)" />
            <select
              className="input-glass select-glass"
              disabled={isRecording || isProcessing}
              value={currentPoi}
              onChange={e => setCurrentPoi(e.target.value)}
            >
              {poiOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="control-row">
            <Globe size={16} color="var(--primary)" />
            <select
              className="input-glass select-glass"
              disabled={isRecording || isProcessing}
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div className="control-row tts-toggle">
            {autoSpeak ? <Volume2 size={16} color="var(--success)" /> : <VolumeX size={16} color="var(--text-muted)" />}
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={e => setAutoSpeak(e.target.checked)}
              />
              <span className="toggle-switch"></span>
              <span className="toggle-text">{language === 'vi' ? 'Tự động đọc' : 'Auto TTS'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Right: Chat Interface */}
      <div className="chat-interface glass-panel">
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="ai-badge">
              <Sparkles size={16} />
              <span>Gemini AI</span>
            </div>
            <h3>AI Tour Guide</h3>
          </div>
          <div className="chat-header-right">
            <span className="poi-indicator"><MapPin size={14} /> {currentPoi}</span>
            <button className="btn-icon" onClick={clearChat} title={language === 'vi' ? 'Xóa cuộc trò chuyện' : 'Clear chat'}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="messages-area">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-bubble ${msg.sender} animate-slide-in`}>
              {msg.sender === 'ai' && (
                <button
                  className="tts-btn"
                  disabled={isRecording}
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.text)}
                  title={isSpeaking ? 'Stop' : 'Listen'}
                >
                  {isSpeaking ? <StopCircle size={14} /> : <Volume2 size={14} />}
                </button>
              )}
              <div className="message-content">
                <p>{msg.text}</p>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="message-bubble ai typing animate-slide-in">
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <input
            type="text"
            className="input-glass chat-input"
            placeholder={isRecording
              ? (language === 'vi' ? 'Đang nghe giọng nói...' : 'Listening...')
              : (language === 'vi' ? 'Gõ câu hỏi của bạn...' : 'Type your question...')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isRecording || isProcessing}
          />
          <button
            className="send-btn"
            onClick={() => query.trim() && sendMessage(query)}
            disabled={!query.trim() || isProcessing || isRecording}
          >
            <Send size={20} />
          </button>
          <button
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={handleMicClick}
            disabled={isProcessing}
          >
            {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
        </div>
      </div>
    </div>
  );
}
