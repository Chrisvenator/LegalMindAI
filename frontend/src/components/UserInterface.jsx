import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, FileText, Briefcase, Calculator } from 'lucide-react';
import { askLegalQuestion } from '../services/apiService';
import '../index.css';

const LegalAdviserChat = () => {
    const [messages, setMessages] = useState([
        {
            text: "Hi! To start a small business in Austria, follow these key steps:\n1. Choose a Business Structure: Decide on a legal form (e.g., sole proprietorship, GmbH).\n2. Register Your Business: Register with the Commercial Register (Firmenbuch).\n3. Get Necessary Licenses: Obtain any required trade licenses (Gewerbeschein).\n4. Understand Tax Obligations: Register with the tax office and understand VAT requirements.\n\nFor detailed information, consult the Austrian Chamber of Commerce or a local attorney.",
            sender: 'bot'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        // Add user message
        const userMessage = { text: inputMessage, sender: 'user' };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        // Clear input
        setInputMessage('');

        // Set loading state
        setIsLoading(true);

        try {
            // Call the API service
            const response = await askLegalQuestion(inputMessage);

            // Add bot response
            setMessages(prevMessages => [...prevMessages, {
                text: response.answer || "I apologize, but I couldn't find a specific answer to your question. Please consult with a legal professional for personalized advice.",
                sender: 'bot'
            }]);
        } catch (error) {
            // Handle error
            setMessages(prevMessages => [...prevMessages, {
                text: "Sorry, there was an error processing your question. Please try again.",
                sender: 'bot'
            }]);
        } finally {
            // Reset loading state
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-red-700 text-white transition-all duration-300 overflow-hidden`}>
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Legal Adviser</h2>
                    <ul>
                        <li className="mb-2 p-2 bg-red-600 rounded flex items-center cursor-pointer">
                            <FileText className="mr-2" size={20} />
                            New Conversation
                        </li>
                        <li className="mb-2 p-2 hover:bg-red-600 rounded flex items-center cursor-pointer">
                            <Briefcase className="mr-2" size={20} />
                            Business Registration
                        </li>
                        <li className="mb-2 p-2 hover:bg-red-600 rounded flex items-center cursor-pointer">
                            <Calculator className="mr-2" size={20} />
                            Tax Obligations
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1">
                {/* Header */}
                <div className="bg-white p-4 flex items-center border-b">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="mr-4 text-gray-600 hover:text-gray-900"
                    >
                        <Menu />
                    </button>
                    <h1 className="text-xl font-semibold">Legal Adviser Chatbot</h1>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`max-w-[80%] p-3 rounded-lg ${
                                message.sender === 'user'
                                    ? 'bg-red-700 text-white ml-auto'
                                    : 'bg-gray-200 text-black mr-auto'
                            }`}
                        >
                            {message.text}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white p-4 flex items-center border-t">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a legal question..."
                        className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading}
                        className="bg-red-700 text-white p-2 rounded-r-lg hover:bg-red-600 disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : <Send size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalAdviserChat;