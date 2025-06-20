import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, FileText, Briefcase, Calculator, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askLegalQuestion } from '../services/apiService';
import '../index.css';

const LegalAdviserChat = () => {
    const [messages, setMessages] = useState([
        {
            text: "**Welcome to your digital legal advisory service**\n\n" +
                "- Competent\n" +
                "- Confidential\n" +
                "- Available 24/7\n\n" +
                "Whether *tenancy law*, *employment law* or *contract matters* – I’ll help you clarify your legal issues quickly and clearly. What can I do for you today?",
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
                text: response.answer || "**I apologize**, but I couldn't find a specific answer to your question. Please consult with a legal professional for personalized advice.",
                sender: 'bot'
            }]);
        } catch (error) {
            setMessages(prevMessages => [...prevMessages, {
                text: "**Sorry**, there was an error processing your question. Please try again.",
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
                            <FileText className="mr-2" size={20} />
                            Old Conversation
                        </li>
                        <li className="mb-2 p-2 rounded flex items-center cursor-pointer hover:bg-fbc-blue-60">
                            <FileText className="mr-2" size={20} />
                            Older Conversation
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
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-5xl mx-auto w-full">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`max-w-[80%] p-3 rounded-lg flex items-start ${
                                message.sender === 'user'
                                    ? 'bg-fbc-blue-70 text-fbc-white ml-auto'
                                    : 'bg-fbc-gray-20 text-fbc-primary-text mr-auto'
                            }`}
                        >
                            {message.sender === 'user' ? (
                                <User className="mr-2 mt-1 flex-shrink-0" size={20} />
                            ) : (
                                <Bot className="mr-2 mt-1 flex-shrink-0" size={20} />
                            )}
                            <div className={`markdown-content ${message.sender === 'user' ? 'text-fbc-white' : 'text-fbc-primary-text'}`}>
                                <ReactMarkdown
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-1" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                        em: ({node, ...props}) => <em className="italic" {...props} />
                                    }}
                                >
                                    {message.text}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 flex items-center border-t border-fbc-gray-20 max-w-5xl mx-auto w-full">
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