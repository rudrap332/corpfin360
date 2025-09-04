
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { getFundraisingAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

const FundraisingAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your AI fundraising advisor. How can I help you with your funding strategy today? Ask me about pitch decks, term sheets, or finding investors.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Improved scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Scroll to bottom when loading state changes
  useEffect(() => {
    if (loading) {
      scrollToBottom();
    }
  }, [loading, scrollToBottom]);

  // Scroll to bottom on mount
  useEffect(() => {
    scrollToBottom('auto');
  }, [scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await getFundraisingAdvice(input);
      const modelMessage: ChatMessage = { role: 'model', text: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[75vh] max-h-[600px]">
      <h2 className="text-2xl font-bold text-brand-dark mb-4 border-b pb-4">AI Fundraising Advisor</h2>
      
      {/* Chat Messages Container */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-brand-primary text-white' 
                : 'bg-slate-200 text-brand-dark'
            }`}>
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-2 rounded-lg bg-slate-200 text-brand-dark flex items-center">
              <LoadingSpinner />
              <span className="ml-2">Thinking...</span>
            </div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 border-t pt-4 mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a fundraising question..."
          className="flex-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          Send
        </Button>
      </form>
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </Card>
  );
};

export default FundraisingAdvisor;
