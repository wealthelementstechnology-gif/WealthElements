import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Send, Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import chatService from '../../services/chat.service';

const SUGGESTED_QUESTIONS = [
  'Am I saving enough every month?',
  'How healthy is my emergency fund?',
  'Should I pay off my loan or invest?',
  'What is my biggest financial risk right now?',
  'How long until I hit my home down payment goal?',
  'Which subscriptions should I cancel?',
];

const MessageBubble = ({ role, content }) => {
  const isAI = role === 'assistant';
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      {isAI && (
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAI
            ? 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm'
            : 'bg-indigo-600 text-white rounded-tr-sm'
        }`}
      >
        {isAI ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => <p className="font-bold text-base mt-3 mb-1 text-gray-900">{children}</p>,
              h3: ({ children }) => <p className="font-semibold text-sm mt-2 mb-0.5 text-gray-800">{children}</p>,
              strong: ({ children }) => <span className="font-semibold text-gray-900">{children}</span>,
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
              li: ({ children }) => <li className="text-gray-700">{children}</li>,
              code: ({ children }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">{children}</code>,
              pre: ({ children }) => <pre className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-2 mb-2 overflow-x-auto text-xs font-mono">{children}</pre>,
              hr: () => <hr className="border-gray-200 my-2" />,
              table: ({ children }) => (
                <div className="overflow-x-auto my-3 rounded-xl border border-gray-200">
                  <table className="w-full text-xs border-collapse">{children}</table>
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
  <div className="flex justify-start mb-4">
    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
      <Sparkles className="w-3.5 h-3.5 text-white" />
    </div>
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex gap-1 items-center h-4">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

const AIChat = () => {
  const navigate = useNavigate();
  const { profile } = useSelector(state => state.auth);
  const { totalNetWorth } = useSelector(state => state.networth);
  const { monthlySummary } = useSelector(state => state.transactions);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  // Only store assistant messages in history for API context
  const assistantHistoryRef = useRef([]);

  const userName = profile?.name || 'there';
  const monthlyIncome = monthlySummary?.totalIncome || 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    setInput('');
    setError('');

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setIsLoading(true);

    try {
      const { message: aiReply } = await chatService.sendMessage({
        message: messageText,
        history: assistantHistoryRef.current,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
      // Store assistant reply for next turn's context
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

  const showSuggestions = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">WealthElements AI</p>
            <p className="text-xs text-gray-400">Personal finance advisor</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            title="New conversation"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Persona context pill */}
      <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        <p className="text-xs text-indigo-700">
          <span className="font-medium">{userName}</span>
          {monthlyIncome > 0 && <> · ₹{(monthlyIncome / 100000).toFixed(1)}L/mo</>}
          {totalNetWorth !== 0 && <> · ₹{Math.abs(totalNetWorth / 100000).toFixed(1)}L net worth</>}
          {' · '}
          <span>Live data loaded</span>
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* Welcome + suggestions */}
        {showSuggestions && (
          <div className="mb-4">
            <MessageBubble
              role="assistant"
              content={`Hi ${userName}! I can see your full financial snapshot — net worth, accounts, spending, goals, and subscriptions. Ask me anything about your money.`}
            />
            <div className="ml-9 mt-1">
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Try asking</p>
              <div className="flex flex-col gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="text-left text-sm px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-gray-700 disabled:opacity-50"
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

        {/* Thinking indicator */}
        {isLoading && <ThinkingBubble />}

        {/* Error */}
        {error && (
          <div className="mx-auto max-w-sm mt-2 mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
            {error}
            <button onClick={() => setError('')} className="ml-2 underline text-red-500">
              Dismiss
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your money..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent max-h-32 leading-relaxed"
            style={{ minHeight: '44px' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-[10px] text-gray-300 text-center mt-2">
          AI answers are based on your WealthElements data · Not professional financial advice
        </p>
      </div>

    </div>
  );
};

export default AIChat;
