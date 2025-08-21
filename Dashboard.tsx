import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Answer from './Answer';
import History from './History';
import Settings from './settings';
import { Settings as SettingsIcon } from 'lucide-react';
import type { ChatMessage, ChatSession } from 'remoteApp/services';

export const Dashboard: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const [services, setServices] = useState<null | {
    getAllChats: () => ChatSession[];
    loadChat: (id: string) => ChatSession | null;
    saveChat: (id: string, messages: ChatMessage[]) => void;
    askQuestionAPI: (
      input: string,
      history: ChatMessage[],
      sessionId: string
    ) => Promise<ChatMessage[]>;
  }>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load remote services
  useEffect(() => {
    (async () => {
      try {
        const remote = await import('remoteApp/services'); // named imports
        setServices({
          getAllChats: remote.getAllChats,
          loadChat: remote.loadChat,
          saveChat: remote.saveChat,
          askQuestionAPI: remote.askQuestionAPI,
        });
        console.log(' Remote services loaded');
      } catch (error) {
        console.error(' Failed to load remote services:', error);
      }
    })();
  }, []);

  // Initialize session & load current chat
  useEffect(() => {
    console.log("services: ", services);

    if (!services) return;

    let chatSessionId = sessionStorage.getItem('chat_session_id');
    if (!chatSessionId) {
      chatSessionId = uuidv4();
      sessionStorage.setItem('chat_session_id', chatSessionId);
    }
    setSessionId(chatSessionId);

    const allChats = services.getAllChats();
    const current = allChats.find((chat) => chat.id === chatSessionId);
    setMessages(current ? current.messages : []);
    
  }, [services]);

 const askQuestion = async () => {
  console.log("Ask button clicked ");   // Debug log

  if (!query.trim()) {
    console.log("Query is empty ");
    return;
  }

  if (!services) {
    console.log("Services not loaded ");
    return;
  }

  console.log("Calling remote askQuestionAPI...");

  try {
    const finalMessages = await services.askQuestionAPI(
      query,
      messages,
      sessionId
    );

    console.log("Got response from remote :", finalMessages);

    setMessages(finalMessages);
    services.saveChat(sessionId, finalMessages);
    setQuery('');
  } catch (error) {
    console.error("Error calling askQuestionAPI :", error);
  }
};


  const loadChatHandler = (chatId: string) => {
    if (!services) return;
    const chat = services.loadChat(chatId);
    if (chat) {
      setMessages(chat.messages);
      sessionStorage.setItem('chat_session_id', chatId);
      setSessionId(chatId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') askQuestion();
  };

  const clearChat = () => {
    setMessages([]);
    if (services) services.saveChat(sessionId, []); // Clear in remote too
  };

  const clearHistory = () => {
    localStorage.setItem('chat_sessions', JSON.stringify([]));
    setMessages([]);
  };

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const sessions =
    services?.getAllChats().map((session) => ({
      id: session.id,
      question: session.title,
      answer: '',
    })) || [];

  return (
    <div className="flex h-screen bg-white text-white">
      <div className="flex-1 flex flex-col">
        {/* Chat messages */}
        <div
          className="flex-1 overflow-y-auto p-4 pb-24 space-y-4 bg-black"
          ref={containerRef}
        >
          {messages.map((msg, index) => (
            <div key={`message-${index}`} className="space-y-3">
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl bg-zinc-700 text-white p-3 rounded-2xl rounded-tr-sm shadow-lg">
                    {msg.message || ''}
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl bg-gray-600 text-white p-4 rounded-2xl rounded-tl-sm shadow-lg whitespace-pre-wrap">
                    {(msg.message || '').split('\n').map((line, i) => (
                      <Answer key={`ans-${index}-${i}`} ans={line} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-gray-300 p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Me"
              className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={askQuestion}
              className="bg-zinc-600 hover:bg-zinc-900 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
              disabled={!query.trim()}
            >
              Ask
            </button>
            <button
              onClick={clearChat}
              className="bg-zinc-600 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              Clear
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="bg-zinc-600 hover:bg-zinc-800 text-white p-3 rounded-xl transition-colors duration-200 flex items-center justify-center"
              title="Settings"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="w-64 bg-gray-900 border-l border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold ml-2">History</h2>
          <button
            onClick={clearHistory}
            className="text-sm text-white bg-red-600 hover:bg-red-800 px-2 py-1 rounded"
            title="Clear History"
          >
            ✕
          </button>
        </div>
        <History
          items={sessions}
          onSelect={(index) => loadChatHandler(sessions[index].id)}
        />
      </div>

      {/* Settings modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default Dashboard;
