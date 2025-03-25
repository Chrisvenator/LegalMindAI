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

        const userMessage = { text: inputMessage, sender: 'user' };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await askLegalQuestion(inputMessage);
            setMessages(prevMessages => [...prevMessages, {
                text: response.answer || "I apologize, but I couldn't find a specific answer to your question. Please consult with a legal professional for personalized advice.",
                sender: 'bot'
            }]);
        } catch (error) {
            setMessages(prevMessages => [...prevMessages, {
                text: "Sorry, there was an error processing your question. Please try again.",
                sender: 'bot'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="flex h-screen bg-fbc-light-gray text-fbc-primary-text">
            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-fbc-blue-70 text-fbc-white transition-all duration-300 overflow-hidden`}>
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Legal Adviser</h2>
                    <ul>
                        <li className="mb-2 p-2 bg-fbc-blue-60 rounded flex items-center cursor-pointer hover:bg-fbc-blue-70">
                            <FileText className="mr-2" size={20} />
                            New Conversation
                        </li>
                        <li className="mb-2 p-2 rounded flex items-center cursor-pointer hover:bg-fbc-blue-60">
                            <Briefcase className="mr-2" size={20} />
                            Business Registration
                        </li>
                        <li className="mb-2 p-2 rounded flex items-center cursor-pointer hover:bg-fbc-blue-60">
                            <Calculator className="mr-2" size={20} />
                            Tax Obligations
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1">
                {/* Header */}
                <div className="bg-fbc-white p-4 flex items-center border-b border-fbc-gray-20">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="mr-4 text-fbc-secondary-text hover:text-fbc-primary-text"
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
                                    ? 'bg-fbc-blue-70 text-fbc-white ml-auto'
                                    : 'bg-fbc-gray-20 text-fbc-primary-text mr-auto'
                            }`}
                        >
                            {message.text}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-fbc-white p-4 flex items-center border-t border-fbc-gray-20">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a legal question..."
                        className="flex-1 p-2 border border-fbc-gray-20 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-fbc-blue-60"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading}
                        className="bg-fbc-blue-70 text-fbc-white p-2 rounded-r-lg hover:bg-fbc-blue-60 disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : <Send size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalAdviserChat;