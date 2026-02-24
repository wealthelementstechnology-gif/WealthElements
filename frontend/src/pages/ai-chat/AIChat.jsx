import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Send, Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import chatService from '../../services/chat.service';

const SUGGESTED_QUESTIONS = [
  'Summarize my finances',
  'How is my emergency fund?',
  'Should I pay off debt or invest?',
  'What is my biggest risk?',
  'How long to hit my goal?',
  'Which subscriptions to cut?',
];

const MessageBubble = ({ role, content }) => {
  const isAI = role === 'assistant';
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-5`}>
      <div
        className={`max-w-[88%] rounded-3xl px-5 py-4 leading-relaxed ${
          isAI
            ? 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-lg text-base'
            : 'bg-gray-900 text-white rounded-tr-lg text-lg font-medium'
        }`}
      >
        {isAI ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => <p className="font-bold text-base mt-3 mb-1 text-gray-900">{children}</p>,
              h3: ({ children }) => <p className="font-semibold text-sm mt-2 mb-0.5 text-gray-800">{children}</p>,
              strong: ({ children }) => <span className="font-semibold text-gray-900">{children}</span>,
              p: ({ children }) => <p className="mb-2 last:mb-0 text-base leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-gray-700 text-base">{children}</li>,
              code: ({ children }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>,
              pre: ({ children }) => <pre className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-2 mb-2 overflow-x-auto text-sm font-mono">{children}</pre>,
              hr: () => <hr className="border-gray-200 my-3" />,
              table: ({ children }) => (
                <div className="overflow-x-auto my-3 rounded-xl border border-gray-200">
                  <table className="w-full text-sm border-collapse">{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-indigo-50">{children}</thead>,
              tbody: ({ children }) => <tbody className="divide-y divide-gray-100">{children}</tbody>,
              tr: ({ children }) => <tr className="divide-x divide-gray-100">{children}</tr>,
              th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-indigo-700 whitespace-nowrap">{children}</th>,
              td: ({ children }) => <td className="px-3 py-2 text-gray-700">{children}</td>,
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          content
        )}
      </div>
    </div>
  );
};

const ThinkingBubble = () => (
  <div className="flex justify-start mb-5">
    <div className="bg-white border border-gray-100 shadow-sm rounded-3xl rounded-tl-lg px-5 py-4">
      <div className="flex gap-1.5 items-center h-5">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

const AIChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useSelector(state => state.auth);
  const { totalNetWorth } = useSelector(state => state.networth);
  const { monthlySummary } = useSelector(state => state.transactions);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const assistantHistoryRef = useRef([]);

  const userName = profile?.name?.split(' ')[0] || 'there';
  const monthlyIncome = monthlySummary?.totalIncome || 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-send if navigated here with an initial message (e.g. from proactive insight card)
  useEffect(() => {
    const initial = location.state?.initialMessage;
    if (initial) {
      sendMessage(initial);
      window.history.replaceState({}, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    setInput('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setIsLoading(true);

    try {
      const { message: aiReply } = await chatService.sendMessage({
        message: messageText,
        history: assistantHistoryRef.current,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
      assistantHistoryRef.current = [
        ...assistantHistoryRef.current,
        { role: 'assistant', content: aiReply },
      ];
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setError('');
    assistantHistoryRef.current = [];
    inputRef.current?.focus();
  };

  const showWelcome = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gray-50 px-4 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <p className="text-sm text-gray-500">WealthElements AI</p>
        </div>
        {messages.length > 0 ? (
          <button
            onClick={handleReset}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="New conversation"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Messages / Welcome */}
      <div className="flex-1 overflow-y-auto px-5 py-2">

        {/* Welcome screen */}
        {showWelcome && (
          <div className="flex flex-col h-full">
            {/* Greeting */}
            <div className="flex-1 flex flex-col justify-center pb-4">
              <p className="text-4xl font-bold mb-1">
                <span className="text-indigo-500">Hello,</span>{' '}
                <span className="text-gray-900">{userName}</span>
              </p>
              <p className="text-3xl font-semibold text-gray-300 leading-snug mt-1">
                What can I help<br />you with?
              </p>
              {(monthlyIncome > 0 || totalNetWorth !== 0) && (
                <p className="text-xs text-gray-400 mt-4">
                  {monthlyIncome > 0 && `₹${(monthlyIncome / 100000).toFixed(1)}L/mo · `}
                  {totalNetWorth !== 0 && `₹${Math.abs(totalNetWorth / 100000).toFixed(1)}L net worth · `}
                  Live data loaded
                </p>
              )}
            </div>

            {/* Suggestion chips — horizontal scroll */}
            <div className="pb-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="flex-shrink-0 text-sm px-4 py-3 bg-white border border-gray-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-gray-700 disabled:opacity-50 text-left"
                    style={{ maxWidth: '180px' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message history */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {isLoading && <ThinkingBubble />}

        {error && (
          <div className="mx-auto max-w-sm mt-2 mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 text-center">
            {error}
            <button onClick={() => setError('')} className="ml-2 underline text-red-500">
              Dismiss
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-50 px-4 pb-6 pt-2 flex-shrink-0">
        <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-3xl px-4 py-3 shadow-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent text-base text-gray-800 placeholder-gray-400 focus:outline-none leading-relaxed"
            style={{ minHeight: '28px', maxHeight: '120px' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-[10px] text-gray-300 text-center mt-2">
          WealthElements AI · Not professional financial advice
        </p>
      </div>

    </div>
  );
};

export default AIChat;
