import { useState } from 'react';

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

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const sessionId = localStorage.getItem('session_id') || null; // Retrieve session_id if available
    setLoading(true);

    try {
      const response = await axios.post<ChatbotResponse>('/api/send-message', {}, {
        params: {
          user_input: userInput,
          session_id: sessionId,
        },
      });

      const { user_message, bot_response, session_id } = response.data;

      // Save session_id for future requests
      if (session_id) localStorage.setItem('session_id', session_id);

      // Update chat history
      setChatHistory((prev) => [
        ...prev,
        { role: 'User', message: user_message },
        { role: 'Bot', message: bot_response },
      ]);
      setUserInput(''); // Clear input field
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-300">
      {/* Left Sidebar */}
      
      <div className="w-[15%] border-r border-gray-800 p-4 flex flex-col">
        <div className="flex gap-2 mb-4">
          <button className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-md flex-grow">
            <PlusCircle size={16} />
            New chat
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

        {/* <div className="space-y-2 mt-auto">
          <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-800 rounded-md">
            <Upload size={16} />
            Import data
          </button>
          <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-800 rounded-md">
            <Download size={16} />
            Export data
          </button>
          <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-800 rounded-md">
            <Settings size={16} />
            Settings
          </button>
          <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-800 rounded-md">
            <KeyRound size={16} />
            OpenAI API Key
          </button>
        </div> */}
      </div>

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
              <div className="text-center text-gray-500">Start a conversation...</div>
            )}
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
              className={`px-4 py-2 rounded-md ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      
        {/* <div className="flex gap-2 mb-4">
          <button className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-md flex-grow">
            <PlusCircle size={16} />
            New prompt
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-md">
            <ArrowRightCircle size={16} />
          </button>
        </div> */}

        {/* <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
        </div> */}

        {/* <div className="flex-grow flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p>No data.</p>
          </div>
        </div> */}
      
    </div>
  );
};

export default Chatbot;
