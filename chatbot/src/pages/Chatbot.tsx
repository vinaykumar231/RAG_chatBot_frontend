import { useState, useRef, useEffect } from 'react';
import { ArrowLeftCircle, PlusCircle, Search } from 'lucide-react';
import axios from '../helper/axios';

interface ChatMessage {
  role: 'User' | 'Bot';
  message: string;
}

interface ChatbotResponse {
  user_message: string;
  bot_response: string;
  session_id: string;
}

const Chatbot = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [botTyping, setBotTyping] = useState<string>(''); 

  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, botTyping]);

  const typeResponse = (response: string) => {
    setBotTyping('');
    let index = 0;

    const typingInterval = setInterval(() => {
      setBotTyping((prev) => prev + response.charAt(index));
      index++;
      if (index === response.length) clearInterval(typingInterval);
    }, 10); 
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const sessionId = localStorage.getItem('session_id') || null; 
    setLoading(true);

    try {
      const response = await axios.post<ChatbotResponse>('/api/send-message', {}, {
        params: {
          user_input: userInput,
          session_id: sessionId,
        },
      });

      const { user_message, bot_response, session_id } = response.data;

      if (session_id) localStorage.setItem('session_id', session_id);

      setChatHistory((prev) => [
        ...prev,
        { role: 'User', message: user_message },
      ]);


      typeResponse(bot_response);

      setTimeout(() => {
        setChatHistory((prev) => [
          ...prev,
          { role: 'Bot', message: bot_response },
        ]);
        setBotTyping('');
      }, bot_response.length * 50 + 100); 
      setUserInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory((prev) => [
        ...prev,
        { role: 'Bot', message: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-300">
      {/* Left Sidebar */}
      <div className="w-[15%] border-r border-gray-800 p-4 flex flex-col">
        <div className="flex gap-2 mb-4">
          <button
            className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-md flex-grow"
            onClick={() => setChatHistory([])}
          >
            <PlusCircle size={16} />
            New Chat
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-md">
            <ArrowLeftCircle size={16} />
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>

        <div className="flex-grow flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p>No data.</p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-grow w-[80%] flex flex-col items-center justify-between p-8">
        <div className="w-full flex flex-col h-full">
          <div className="flex-grow overflow-y-auto bg-gray-800 rounded-md p-4">
            {chatHistory.length > 0 ? (
              chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`mb-4 p-2 rounded-md ${
                    chat.role === 'User'
                      ? 'bg-blue-600 text-right text-white'
                      : 'bg-gray-700 text-left text-gray-300'
                  }`}
                >
                  <p>{chat.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                Hi! I'm your assistant. How can I help you today?
              </div>
            )}
            {/* Show typing effect */}
            {botTyping && (
              <div className="bg-gray-700 text-left text-gray-300 mb-4 p-2 rounded-md">
                <p>{botTyping}</p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-grow bg-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className={`px-4 py-2 rounded-md flex items-center justify-center ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {loading ? <div className="loader w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
