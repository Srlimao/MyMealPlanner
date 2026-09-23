import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { DailyLog, NutritionPlan } from '../../shared/types/nutrition';
import { UserSettings } from '../../shared/types/settings';
import { buildAdvisorSystemPrompt, formatDailyConsumptionContext } from './advisorPrompt';
import { geminiService } from '../../shared/services/geminiService';
import { MarkdownViewer } from '../../shared/components/MarkdownViewer';
import { getTranslation } from '../../shared/i18n';
import { useSubscription } from '../subscription/SubscriptionContext';
import { TIER_CONFIGS } from '../subscription/types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AdvisorChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  todayLog: DailyLog | null;
  nutritionPlan: NutritionPlan;
  settings: UserSettings;
}

export const AdvisorChatDrawer: React.FC<AdvisorChatDrawerProps> = ({
  isOpen,
  onClose,
  todayLog,
  nutritionPlan,
  settings,
}) => {
  const t = getTranslation(settings.language);
  const { tier, canPerformAction, recordAction, getModelForAction, openTierModal } = useSubscription();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: t.advisor.welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tierConfig = TIER_CONFIGS[tier];
  const chatCheck = canPerformAction('chat');

  // Update initial welcome message if language changes
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === 'welcome' ? { ...m, text: t.advisor.welcomeMessage } : m
      )
    );
  }, [t.advisor.welcomeMessage]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (userText: string) => {
    if (!userText.trim() || loading) return;

    if (!chatCheck.allowed) {
      openTierModal();
      return;
    }

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = buildAdvisorSystemPrompt(nutritionPlan, settings.language);
      const dailyContext = formatDailyConsumptionContext(todayLog, settings.targets);
      const contextualPrompt = `${dailyContext}\n\nPergunta do Willian:\n${userText}`;

      const modelToUse = getModelForAction('chat', settings.activeModel);

      const response = await geminiService.generateContent(
        contextualPrompt,
        undefined,
        modelToUse,
        systemPrompt
      );

      recordAction('chat');

      const aiMsg: Message = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: response.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Erro: ${err instanceof Error ? err.message : 'Falha na resposta do assistente.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-neutral-900 border-l border-neutral-800 w-full sm:max-w-md h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-neutral-100">{t.advisor.title}</h3>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    tier === 'pro'
                      ? 'bg-emerald-500 text-neutral-950'
                      : tier === 'starter'
                      ? 'bg-sky-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {tierConfig.badge}
                </span>
              </div>
              <p className="text-[10px] text-emerald-400">
                {chatCheck.limit === Infinity
                  ? 'Conversas ilimitadas'
                  : `${chatCheck.remaining} de ${chatCheck.limit} restantes hoje`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs whitespace-pre-line'
                    : 'bg-neutral-950 border border-neutral-800/80 text-neutral-200 rounded-bl-xs'
                }`}
              >
                {m.sender === 'user' ? (
                  m.text
                ) : (
                  <MarkdownViewer content={m.text} />
                )}
                <span
                  className={`block text-[9px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-emerald-200' : 'text-neutral-500'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
              {m.sender === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-neutral-400 pl-8">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>{t.advisor.consultingPlan}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Pills */}
        <div className="px-3 py-2 border-t border-neutral-800/80 bg-neutral-950/40 overflow-x-auto flex gap-1.5 no-scrollbar">
          {t.advisor.quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 text-neutral-300 px-2.5 py-1 rounded-full transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        {!chatCheck.allowed ? (
          <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                ⚠️ Limite diário de conversas atingido ({chatCheck.limit}/{chatCheck.limit})
              </span>
              <button
                type="button"
                onClick={openTierModal}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors cursor-pointer"
              >
                Aumentar Limite
              </button>
            </div>
            <p className="text-[10px] text-neutral-400">
              O limite gratuito reinicia à meia-noite. Mude para Starter ou Pro para mais conversas.
            </p>
          </div>
        ) : (
          <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder={t.advisor.inputPlaceholder}
              className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-all shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
