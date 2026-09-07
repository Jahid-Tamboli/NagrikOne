'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  FileCheck,
  ShieldCheck,
  ChevronRight,
  User,
  Trash2,
  Clock3,
  HelpCircle,
  Scale,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Square
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import NovaHeroCore, { NovaState } from '@/components/three/NovaHeroCore';
import { AuthSession } from '@/lib/auth/session';
import { novaVoice } from '@/lib/voice/tts';
import { novaSTT } from '@/lib/voice/stt';
import { MicAudioAnalyzer } from '@/lib/voice/audioAnalyzer';

interface DynamicQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'boolean' | 'file';
  placeholder?: string;
  options?: string[];
  required: boolean;
  helpText?: string;
}

interface ConversationTurn {
  sender: 'citizen' | 'nova';
  text: string;
  timestamp: string;
}

function NovaContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('initial') || '';
  const initialCategory = searchParams.get('category') || '';

  const [user, setUser] = useState<AuthSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | undefined>();

  const [inputProblem, setInputProblem] = useState(initialQuery);
  const [customLocation, setCustomLocation] = useState('');
  const [novaState, setNovaState] = useState<NovaState>('IDLE');
  const [micAmplitude, setMicAmplitude] = useState<number>(0);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string>>({});
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; type: string; size: number; url?: string; ocrExtracted?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [creatingCase, setCreatingCase] = useState(false);
  const [createdCase, setCreatedCase] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioAnalyzerRef = useRef<MicAudioAnalyzer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check current user session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      }
    }
    checkSession();

    // Initial greeting if no input
    if (!initialQuery) {
      const greeting = "Hello! I am NOVA. Tell me what problem you are facing, and I will help you identify the right statutory path and next step.";
      setConversation([{
        sender: 'nova',
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [initialQuery]);

  // Audio amplitude polling loop when listening
  const startAudioMeter = async () => {
    if (!audioAnalyzerRef.current) {
      audioAnalyzerRef.current = new MicAudioAnalyzer();
    }
    const started = await audioAnalyzerRef.current.start();
    if (started) {
      const updateAmp = () => {
        if (audioAnalyzerRef.current) {
          const amp = audioAnalyzerRef.current.getAmplitude();
          setMicAmplitude(amp);
          animFrameRef.current = requestAnimationFrame(updateAmp);
        }
      };
      updateAmp();
    }
  };

  const stopAudioMeter = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioAnalyzerRef.current) {
      audioAnalyzerRef.current.stop();
      audioAnalyzerRef.current = null;
    }
    setMicAmplitude(0);
  };

  // Trigger speech synthesis
  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    novaVoice.stop();
    setNovaState('ASKING');
    setIsSpeaking(true);

    novaVoice.speak(text, {
      onStart: () => {
        setIsSpeaking(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setNovaState('IDLE');
      },
      onError: () => {
        setIsSpeaking(false);
        setNovaState('IDLE');
      }
    });
  };

  // Stop speaking
  const handleStopSpeaking = () => {
    novaVoice.stop();
    setIsSpeaking(false);
    setNovaState('IDLE');
  };

  // Toggle Voice Input / Microphone
  const handleToggleMic = () => {
    if (isSpeaking) {
      handleStopSpeaking();
    }

    if (isListening) {
      novaSTT.stopListening();
      stopAudioMeter();
      setIsListening(false);
      setNovaState('IDLE');
      return;
    }

    setIsListening(true);
    setNovaState('LISTENING');
    startAudioMeter();

    const success = novaSTT.startListening({
      lang: 'en-IN',
      onResult: (transcript, isFinal) => {
        setInputProblem(transcript);
        if (isFinal && transcript.trim()) {
          novaSTT.stopListening();
          stopAudioMeter();
          setIsListening(false);
          // Automatically analyze the spoken input
          runTriage(transcript);
        }
      },
      onError: (err) => {
        console.warn('STT Error:', err);
        stopAudioMeter();
        setIsListening(false);
        setNovaState('IDLE');
      },
      onEnd: () => {
        stopAudioMeter();
        setIsListening(false);
        if (novaState === 'LISTENING') {
          setNovaState('IDLE');
        }
      }
    });

    if (!success) {
      stopAudioMeter();
      setIsListening(false);
      setNovaState('IDLE');
      setErrorMessage('Microphone access unavailable or unsupported. Please type your problem below.');
    }
  };

  const runTriage = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) {
      setErrorMessage('Please provide a description of the issue first.');
      return;
    }

    // Add citizen turn to transcript
    setConversation(prev => [
      ...prev,
      {
        sender: 'citizen',
        text: textToAnalyze,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setErrorMessage(null);
    setNovaState('THINKING');
    setAnalyzing(true);

    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          location: customLocation || undefined
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze issue.');
      }

      setNovaState('CLASSIFYING');
      setAnalysisResult(data);

      const spokenResponse = data.classification.summary 
        ? `${data.classification.summary}. I've identified the statutory route as ${data.route.targetDepartment || 'the relevant authority'}. Let's review the required details.`
        : `I understand. I have mapped this to ${data.classification.domain} under ${data.route.statutoryFramework || 'applicable frameworks'}.`;

      setConversation(prev => [
        ...prev,
        {
          sender: 'nova',
          text: spokenResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (voiceEnabled) {
        speakText(spokenResponse);
      } else {
        setTimeout(() => setNovaState('IDLE'), 1800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error analyzing issue with NOVA.');
      setNovaState('IDLE');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      setAuthPromptMessage('Before we start, please log in so I can securely save your problem, documents and case status.');
      setAuthModalOpen(true);
      return;
    }

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/evidence', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload verification failed.');
      }

      setEvidenceFiles((prev) => [...prev, data.file]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not upload evidence file.');
    }
  };

  const handleCreatePersistentCase = async () => {
    if (!user) {
      setAuthPromptMessage('Before we start, please log in so I can securely save your problem, documents and case status.');
      setAuthModalOpen(true);
      return;
    }

    if (!analysisResult) return;

    setCreatingCase(true);
    setErrorMessage(null);
    setNovaState('THINKING');

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTypeId: analysisResult.classification.domain === 'UNKNOWN' ? undefined : analysisResult.classification.problemCode,
          title: analysisResult.classification.domain === 'UNKNOWN' 
            ? `Dispute: ${inputProblem.slice(0, 50)}...`
            : `${analysisResult.classification.domain} Issue`,
          description: inputProblem,
          location: customLocation || 'Unspecified Jurisdiction',
          customAnswers: dynamicAnswers,
          evidenceFiles: evidenceFiles,
          routeRecommendation: analysisResult.route
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create persistent case.');
      }

      setCreatedCase(data.case);
      setNovaState('CASE_CREATED');

      const successVoice = `Your case ${data.case.id} has been securely created. All statutory timelines and events are now actively tracked.`;
      if (voiceEnabled) {
        speakText(successVoice);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not create case.');
      setNovaState('IDLE');
    } finally {
      setCreatingCase(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 pb-24">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={async () => {
          await fetch('/api/auth/session', { method: 'DELETE' });
          setUser(null);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        customPrompt={authPromptMessage}
        onLoginSuccess={(u) => {
          setUser(u);
          setAuthPromptMessage(undefined);
        }}
      />

      <div className="container-box pt-8 sm:pt-12 max-w-5xl">
        
        {/* ============================================================ */}
        {/* CENTRAL NOVA INTELLIGENCE EXPERIENCE                          */}
        {/* ============================================================ */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NOVA CITIZEN INTELLIGENCE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-50 tracking-tight">
            Tell NOVA what you're facing.
          </h1>

          {/* Dominant Living 3D Core */}
          <div className="py-2">
            <NovaHeroCore
              state={novaState}
              amplitude={micAmplitude}
              size="hero"
              onCoreClick={() => {
                if (isSpeaking) handleStopSpeaking();
                else handleToggleMic();
              }}
            />
          </div>

          {/* Voice Controls Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleMic}
              className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all ${
                isListening
                  ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] animate-pulse'
                  : 'bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cyan-400" />}
              <span>{isListening ? 'Stop Listening' : 'Speak to NOVA'}</span>
            </button>

            {isSpeaking && (
              <button
                onClick={handleStopSpeaking}
                className="px-4 py-2.5 rounded-full bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop Voice</span>
              </button>
            )}

            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? 'Voice Responses Enabled' : 'Voice Responses Muted'}
              className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CONVERSATION TRANSCRIPT & INPUT AREA                          */}
        {/* ============================================================ */}
        <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800/80 shadow-2xl space-y-6 mb-8">
          
          {/* Transcript Feed */}
          <div className="space-y-3.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {conversation.map((turn, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs sm:text-sm ${
                  turn.sender === 'citizen' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed font-sans ${
                    turn.sender === 'citizen'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-950 font-semibold'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-sm'
                  }`}
                >
                  <p>{turn.text}</p>
                  <span className="text-[10px] opacity-60 block mt-1 text-right font-mono">
                    {turn.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Input Form */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={inputProblem}
                onChange={(e) => setInputProblem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runTriage(inputProblem);
                }}
                placeholder="Type your issue... (e.g. My landlord refuses to return my ₹45,000 security deposit)"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-400 font-sans"
              />

              <button
                onClick={() => runTriage(inputProblem)}
                disabled={analyzing}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] whitespace-nowrap transition-all disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Issue</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Optional Location / City (e.g. Pune, Maharashtra)"
                className="w-full bg-transparent text-xs text-slate-400 placeholder:text-slate-600 outline-none font-mono"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* ANALYSIS RESULT & DYNAMIC QUESTIONS SECTION                  */}
        {/* ============================================================ */}
        {analysisResult && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Structured Solution Header */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#081322] to-[#040914] border border-cyan-500/30 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                    {analysisResult.classification.domain}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Confidence: {Math.round(analysisResult.classification.confidence * 100)}%
                  </span>
                </div>

                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <Clock3 className="w-4 h-4" />
                  <span>Statutory SLA: {analysisResult.route.estimatedSlaDays} Days</span>
                </div>
              </div>

              {/* Solution Overview */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-black text-slate-50">
                  Recommended Statutory Path
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {analysisResult.route.actionPlan}
                </p>
              </div>

              {/* Target Authority & Checklist */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Target Authority</span>
                  <strong className="text-sm text-cyan-300 font-bold block">{analysisResult.route.targetDepartment}</strong>
                  <span className="text-xs text-slate-400 block">{analysisResult.route.statutoryFramework}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Next Immediate Step</span>
                  <strong className="text-sm text-emerald-300 font-bold block">{analysisResult.route.nextImmediateStep}</strong>
                  <span className="text-xs text-slate-400 block">{analysisResult.route.legalNoticeRecommended ? 'Legal Notice / Formal Dispute Recommended' : 'Direct RTS Submission Available'}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Contextual Questions */}
            {analysisResult.questions && analysisResult.questions.length > 0 && (
              <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-cyan-400" />
                    <span>Case Fact Verification</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    NOVA requires these essential details to prepare your formal case docket accurately.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {analysisResult.questions.map((q: DynamicQuestion) => (
                    <div key={q.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-200 block">
                        {q.question} {q.required && <span className="text-rose-400">*</span>}
                      </label>

                      {q.type === 'choice' && q.options ? (
                        <select
                          value={dynamicAnswers[q.id] || ''}
                          onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [q.id]: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400 font-sans"
                        >
                          <option value="">Select option...</option>
                          {q.options.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : q.type === 'boolean' ? (
                        <div className="flex gap-2">
                          {['Yes', 'No'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setDynamicAnswers({ ...dynamicAnswers, [q.id]: opt })}
                              className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                dynamicAnswers[q.id] === opt
                                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder={q.placeholder || 'Your answer...'}
                          value={dynamicAnswers[q.id] || ''}
                          onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [q.id]: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-400 font-sans"
                        />
                      )}

                      {q.helpText && (
                        <span className="text-[10px] text-slate-500 block font-mono">{q.helpText}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Attachment Section */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-cyan-400" />
                    <span>Evidence & Document Verification</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Attach receipts, screenshots, notices, or photographs to strengthen statutory enforceability.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload File</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                />
              </div>

              {evidenceFiles.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {evidenceFiles.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-200">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold truncate max-w-xs">{f.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({Math.round(f.size / 1024)} KB)</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono uppercase">Verified</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500 font-mono">
                  No files attached yet. (PDF, JPG, PNG up to 10MB)
                </div>
              )}
            </div>

            {/* Persistent Case Creation Action */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 font-mono">
                {user ? (
                  <span className="text-emerald-400">✓ Logged in as {user.name || user.phone}</span>
                ) : (
                  <span className="text-amber-400">⚠ Login required before saving persistent case</span>
                )}
              </div>

              <button
                onClick={handleCreatePersistentCase}
                disabled={creatingCase}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all disabled:opacity-50"
              >
                {creatingCase ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Case & Event Timeline...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>Create Persistent Case & Track</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CASE CREATED SUCCESS MODAL / CARD                            */}
        {/* ============================================================ */}
        {createdCase && (
          <div className="mt-8 rounded-3xl p-8 bg-gradient-to-b from-[#091e1d] to-[#040914] border border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)] space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-50">Your Case is Ready & Active</h2>
                <span className="text-xs font-mono text-emerald-400 font-bold">Case Reference: {createdCase.id}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Your case has been logged into the NagrikOne deterministic workflow engine. All statutory SLAs, escalation triggers, and evidence attachments are securely stored.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href={`/cases/${createdCase.id}`}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
              >
                <span>Open Live Case Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/cases"
                className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 font-bold text-xs transition-colors"
              >
                <span>View All My Cases</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default function NovaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-xs font-mono text-cyan-400">
        Loading NOVA Intelligence...
      </div>
    }>
      <NovaContent />
    </Suspense>
  );
}
