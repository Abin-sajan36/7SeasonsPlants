import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sprout, Loader2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
};

export const GardenerAIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'model', content: "Hi there! I'm Gardener AI. How can I help you with your plants today? 🌱\n\n*(You can also ask me for WhatsApp Support at any time!)*" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Format history for the API
      const history = messages
        .filter(m => m.id !== 'initial') // exclude initial if you want, or keep it to set tone
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history })
      });
      
      const data = await res.json();
      
      if (data.reply) {
        const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: data.reply };
        setMessages(prev => [...prev, modelMsg]);
      } else {
        throw new Error('No reply from server');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: "I'm having a little trouble connecting right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 w-14 h-14 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
            aria-label="Open Gardener AI Chat"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[380px] h-[500px] max-h-[calc(100vh-120px)] bg-white dark:bg-[#06120e] rounded-2xl shadow-2xl flex flex-col z-50 border border-emerald-900/10 dark:border-emerald-900 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-700 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-emerald-50" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Gardener AI</h3>
                  <p className="text-[10px] text-emerald-100/90 font-medium">Mannarathayil Nursery Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4FAF5] dark:bg-[#010a07] transition-colors duration-300">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-sm' 
                        : 'bg-white dark:bg-[#0a1f18] text-gray-800 dark:text-white shadow-sm border border-emerald-900/5 dark:border-emerald-900/40 rounded-bl-sm prose prose-sm prose-emerald prose-a:text-emerald-600 hover:prose-a:text-emerald-700 prose-p:leading-relaxed'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="markdown-body">
                        <Markdown
                          components={{
                            a: ({ node, ...props }) => (
                              <a {...props} target="_blank" rel="noopener noreferrer" className="font-bold underline text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-2 mb-1">
                                <Phone className="w-3.5 h-3.5" />
                                {props.children}
                              </a>
                            )
                          }}
                        >
                          {msg.content}
                        </Markdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-[#0a1f18] px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-emerald-900/5 dark:border-emerald-900/40 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-600/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-600/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-600/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-[#06120e] border-t border-emerald-900/10 dark:border-emerald-900 shrink-0 transition-colors duration-300">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-end gap-2"
              >
                <div className="flex-1 bg-gray-50 dark:bg-[#010a07] rounded-xl border border-gray-200 dark:border-emerald-900/60 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask about plant care..."
                    className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none resize-none min-h-[44px] max-h-[120px] dark:text-white"
                    rows={1}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:dark:bg-gray-700 text-white rounded-xl transition-colors shrink-0"
                >
                  {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
