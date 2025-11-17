import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import MainLayout from '../layouts/MainLayout.jsx';

const AICoach = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Coach. I can help you analyze your progress, provide motivation, recommend habits, and forecast risks. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { t } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Simple keyword-based routing to different AI endpoints
      const lowerInput = input.toLowerCase();
      let response;

      if (lowerInput.includes('analyze') || lowerInput.includes('progress')) {
        response = await api.post('/ai/analyzeProgress');
        response = response.analysis;
      } else if (lowerInput.includes('motivation') || lowerInput.includes('motivate')) {
        response = await api.post('/ai/getMotivation');
        response = response.motivation;
      } else if (lowerInput.includes('recommend') || lowerInput.includes('suggest')) {
        response = await api.post('/ai/recommendHabits');
        response = Array.isArray(response.recommendations)
          ? response.recommendations.map(r => `${r.name}: ${r.reason || ''}`).join('\n')
          : JSON.stringify(response.recommendations);
      } else if (lowerInput.includes('risk') || lowerInput.includes('forecast')) {
        response = await api.post('/ai/forecastStreakRisk');
        response = JSON.stringify(response.forecast, null, 2);
      } else {
        // Default: analyze progress
        response = await api.post('/ai/analyzeProgress');
        response = response.analysis?.motivation || JSON.stringify(response.analysis);
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: typeof response === 'string' ? response : JSON.stringify(response) },
      ]);
    } catch (error) {
      toast.error('Failed to get AI response');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'analyze':
          response = await api.post('/ai/analyzeProgress');
          response = response.analysis;
          break;
        case 'motivation':
          response = await api.post('/ai/getMotivation');
          response = response.motivation;
          break;
        case 'recommend':
          response = await api.post('/ai/recommendHabits');
          response = Array.isArray(response.recommendations)
            ? response.recommendations.map(r => `${r.name}: ${r.reason || ''}`).join('\n')
            : JSON.stringify(response.recommendations);
          break;
        case 'forecast':
          response = await api.post('/ai/forecastStreakRisk');
          response = JSON.stringify(response.forecast, null, 2);
          break;
        default:
          return;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: typeof response === 'string' ? response : JSON.stringify(response) },
      ]);
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <SparklesIcon className="h-8 w-8 mr-2 text-blue-600 dark:text-blue-400" />
            {t('aiCoach.aiCoach')}
          </h1>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => handleQuickAction('analyze')}
            disabled={loading}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 text-sm font-medium disabled:opacity-50"
          >
            {t('aiCoach.analyzeProgress')}
          </button>
          <button
            onClick={() => handleQuickAction('motivation')}
            disabled={loading}
            className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 text-sm font-medium disabled:opacity-50"
          >
            {t('aiCoach.getMotivation')}
          </button>
          <button
            onClick={() => handleQuickAction('recommend')}
            disabled={loading}
            className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 text-sm font-medium disabled:opacity-50"
          >
            {t('aiCoach.recommendHabits')}
          </button>
          <button
            onClick={() => handleQuickAction('forecast')}
            disabled={loading}
            className="px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 text-sm font-medium disabled:opacity-50"
          >
            {t('aiCoach.forecastRisk')}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('aiCoach.askQuestion')}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AICoach;







