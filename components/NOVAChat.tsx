'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Scale,
  Clock,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Plus,
  Check,
  X,
  Bot,
  User,
  Paperclip
} from 'lucide-react';
import ScannerModal from './ScannerModal';
import LocationPicker from './LocationPicker';

export interface NovaMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  structuredData?: {
    understanding?: string;
    recommendedActions?: string[];
    questions?: string[];
    evidenceNeeded?: string[];
    statutoryRoute?: string;
    legalAct?: string;
    suggestedUrgency?: string;
    estimatedDays?: number;
    canCreateCase?: boolean;
    caseData?: any;
  };
  timestamp: string;
}

interface NOVAChatProps {
  onCaseCreated?: (newCase: any) => void;
  onOpenScanner?: () => void;
  initialPrompt?: string;
}

const STARTER_PROMPTS = [
  { label: 'Road Pothole & Damaged Street', query: 'There is a dangerous pothole on our main road causing bike skidding.' },
  { label: 'Bank UPI Failed / Money Deducted', query: 'UPI money was deducted from my bank account but merchant payment failed and no refund.' },
  { label: 'Landlord Withholding Deposit', query: 'My landlord is refusing to return my security deposit after I vacated the flat.' },
  { label: 'Defective Appliance / Warranty Denied', query: 'My washing machine broke under warranty and customer care is refusing technician visit.' },
  { label: 'Cyber Fraud / Fake Call Scam', query: 'Someone scammed me with a fake KYC call and transferred money from my account.' }
];

export default function NOVAChat({ onCaseCreated, onOpenScanner, initialPrompt }: NOVAChatProps) {
  const [messages, setMessages] = useState<NovaMessage[]>([
    {
      id: 'welcome_1',
      role: 'assistant',
      content: "Hi, I'm NOVA AI. What problem are you facing today?\n\nExplain your issue in simple Hindi or English — I will identify the governing law, determine the official statutory route, and help you file an actionable resolution case.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [location, setLocation] = useState('');
  const [conversationId, setConversationId] = useState<string>(`conv_${Date.now()}`);
  const [loading, setLoading] = useState(false);
  const [creatingCaseForMsgId, setCreatingCaseForMsgId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ name: string; url?: string; ocrExtracted?: string }>>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend && attachments.length === 0) return;

    setErrorNotice(null);
    setInput('');

    const userMessage: NovaMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome_1')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationId,
          location: location || undefined,
          attachments,
          history
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reach NOVA AI.');
      }

      const assistantMessage: NovaMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        structuredData: {
          understanding: data.understanding,
          recommendedActions: data.recommendedActions,
          questions: data.questions,
          evidenceNeeded: data.evidenceNeeded,
          statutoryRoute: data.statutoryRoute,
          legalAct: data.legalAct,
          suggestedUrgency: data.suggestedUrgency,
          estimatedDays: data.estimatedDays,
          canCreateCase: data.canCreateCase,
          caseData: data.caseData
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setAttachments([]);
    } catch (err: any) {
      console.error('[NOVAChat] Message error:', err);
      setErrorNotice(err.message || 'NOVA AI could not process your message. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'hi-IN';

      rec.onstart = () => setIsRecording(true);
      rec.onresult = (e: any) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);

      recognitionRef.current = rec;
      rec.start();
    } else {
      // Simulation for unsupported browsers
      setIsRecording(true);
      setTimeout(() => {
        setInput('Mere area mein street light 5 din se band hai aur andhera rehta hai.');
        setIsRecording(false);
      }, 1800);
    }
  };

  const handleCreateCaseFromNova = async (msg: NovaMessage) => {
    if (!msg.structuredData?.caseData) return;
    setCreatingCaseForMsgId(msg.id);
    setErrorNotice(null);

    const caseData = msg.structuredData.caseData;

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: caseData.title || 'Citizen Grievance Docket',
          category: caseData.category || 'General Citizen Grievance',
          priority: caseData.priority || 'MEDIUM',
          description: caseData.description || msg.content,
          location: location || caseData.location,
          statutoryRoute: caseData.statutoryRoute,
          suggestedUrgency: caseData.priority,
          problemId: caseData.problemId,
          conversationId
        })
      });

      const newCase = await res.json();
      if (!res.ok || !newCase.id) {
        throw new Error(newCase.error || 'Could not save resolution case.');
      }

      setSuccessNotice(`Statutory Case ${newCase.id} created successfully! You can track its live progress below.`);
      onCaseCreated?.(newCase);
    } catch (err: any) {
      console.error('[NOVAChat] Create case error:', err);
      setErrorNotice(err.message || 'Error creating resolution case.');
    } finally {
      setCreatingCaseForMsgId(null);
    }
  };

  const handleScanComplete = (scannedText: string, meta?: { type: string }) => {
    setAttachments((prev) => [
      ...prev,
      {
        name: `${meta?.type || 'Scanned QR'}: ${scannedText.substring(0, 30)}...`,
        ocrExtracted: scannedText
      }
    ]);
    setInput((prev) => (prev ? `${prev} [Scanned Code: ${scannedText}]` : `Scanned Evidence: ${scannedText}`));
    setSuccessNotice('QR / Document evidence captured and linked to NOVA.');
  };

  const toggleQuestionCheck = (q: string) => {
    setAnsweredQuestions((prev) => ({ ...prev, [q]: !prev[q] }));
  };

  return (
    <div className="w-full rounded-3xl bg-[#061220] border border-cyan-500/25 shadow-[0_0_80px_rgba(6,182,212,0.12)] overflow-hidden flex flex-col h-[680px] sm:h-[720px] max-w-5xl mx-auto">
      {/* NOVA Header */}
      <div className="px-5 py-4 bg-[#08182b] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#08182b] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base sm:text-lg text-slate-100">NOVA AI</h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                ACTIVE ASSISTANT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Citizen Problem-Solving & Statutory Escalation Engine
            </p>
          </div>
        </div>

        {/* Location chip */}
        <button
          type="button"
          onClick={() => setLocationPickerOpen(!locationPickerOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-xs text-slate-300 transition-colors max-w-[160px] sm:max-w-xs truncate"
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{location || 'Set Locality'}</span>
        </button>
      </div>

      {/* Location Picker Drawer if open */}
      {locationPickerOpen && (
        <div className="p-4 bg-slate-950 border-b border-slate-800 animate-fadeIn">
          <LocationPicker
            currentLocation={location}
            onLocationSelected={(loc) => {
              setLocation(loc);
              setLocationPickerOpen(false);
              setSuccessNotice(`Locality set to: ${loc}`);
            }}
            onClose={() => setLocationPickerOpen(false)}
          />
        </div>
      )}

      {/* Alerts */}
      {errorNotice && (
        <div className="px-4 py-2 bg-rose-950/80 border-b border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successNotice && (
        <div className="px-4 py-2 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Content Bubble */}
            <div
              className={`rounded-2xl p-4 sm:p-5 text-sm space-y-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-lg'
                  : 'bg-[#08182b] border border-slate-800 text-slate-100 rounded-tl-none shadow-xl'
              }`}
            >
              {/* Text Body */}
              <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                {msg.content}
              </div>

              {/* Structured AI Guidance Card */}
              {msg.structuredData && (
                <div className="pt-3 border-t border-slate-800/80 space-y-4">
                  {/* Statutory Route & Governing Act */}
                  {msg.structuredData.statutoryRoute && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Official Statutory Authority
                        </span>
                        {msg.structuredData.suggestedUrgency && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-500/30">
                            {msg.structuredData.suggestedUrgency}
                          </span>
                        )}
                      </div>
                      <strong className="text-slate-100 block text-xs sm:text-sm">
                        {msg.structuredData.statutoryRoute}
                      </strong>
                      {msg.structuredData.legalAct && (
                        <p className="text-[11px] text-emerald-300/80 flex items-center gap-1">
                          <Scale className="w-3 h-3 shrink-0" />
                          <span>Governed under: {msg.structuredData.legalAct}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Recommended Action Checklist */}
                  {msg.structuredData.recommendedActions && msg.structuredData.recommendedActions.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">
                        Actionable Next Steps:
                      </span>
                      <div className="space-y-1.5">
                        {msg.structuredData.recommendedActions.map((act, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
                          >
                            <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-snug">{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Questions to Confirm */}
                  {msg.structuredData.questions && msg.structuredData.questions.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Key Details to Verify for Filing:</span>
                      </span>
                      <div className="space-y-1.5">
                        {msg.structuredData.questions.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleQuestionCheck(q)}
                            className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-colors ${
                              answeredQuestions[q]
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                                answeredQuestions[q]
                                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                  : 'border-slate-600 bg-slate-800'
                              }`}
                            >
                              {answeredQuestions[q] && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="leading-snug">{q}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence Needed */}
                  {msg.structuredData.evidenceNeeded && msg.structuredData.evidenceNeeded.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">
                        Essential Evidence to Keep:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.structuredData.evidenceNeeded.map((ev, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                          >
                            • {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Create Resolution Case CTA Button */}
                  {msg.structuredData.canCreateCase && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleCreateCaseFromNova(msg)}
                        disabled={creatingCaseForMsgId === msg.id}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform active:scale-[0.99]"
                      >
                        {creatingCaseForMsgId === msg.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Drafting Official Case Docket...</span>
                          </>
                        ) : (
                          <>
                            <FileCheck className="w-4 h-4" />
                            <span>Create Official Resolution Case</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className="text-[10px] font-mono text-slate-400/80 text-right pt-1">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 max-w-md animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none p-4 bg-[#08182b] border border-slate-800 text-xs text-cyan-300 flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-mono">NOVA AI is analyzing legal statutes & jurisdiction...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Suggestions Chips (if 1 message) */}
      {messages.length === 1 && (
        <div className="px-5 py-2.5 bg-[#071526] border-t border-slate-850">
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Instant Problem Starters:
          </p>
          <div className="flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((starter) => (
              <button
                key={starter.label}
                type="button"
                onClick={() => handleSend(starter.query)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all"
              >
                {starter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-5 py-2 bg-emerald-950/40 border-t border-emerald-500/30 flex flex-wrap gap-2">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs font-mono"
            >
              <Paperclip className="w-3 h-3 text-emerald-400" />
              <span className="truncate max-w-[150px]">{att.name}</span>
              <button
                type="button"
                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                className="text-emerald-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-[#08182b] border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          {/* Scanner Button */}
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors shrink-0"
            title="Scan QR / Capture Evidence"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Voice Button */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
              isRecording
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40'
            }`}
            title="Voice Input (Hindi/English)"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Textarea */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell NOVA what happened... (e.g. 'Street light band hai' or 'Landlord deposit issue')"
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            disabled={loading}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || (!input.trim() && attachments.length === 0)}
            className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Real Camera / QR Scanner Modal */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
}
