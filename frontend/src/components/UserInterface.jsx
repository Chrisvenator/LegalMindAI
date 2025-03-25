import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu } from 'lucide-react';
import { askLegalQuestion } from '../services/apiService';

const LegalAdviserChat = () => {
    const [messages, setMessages] = useState([
        {
            text: "Hi! To start a small business in Austria, follow these key steps:\n1. Choose a Business Structure: Decide on a legal form (e.g., sole proprietorship, GmbH).\n2. Register Your Business: Register with the Commercial Register (Firmenbuch).\n3. Get Necessary Licenses: Obtain any required trade licenses (Gewerbeschein).\n4. Understand Tax Obligations: Register with the tax office and understand VAT requirements.\n\nFor detailed information, consult the Austrian Chamber of Commerce or a local attorney.",
            sender: 'bot'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
            {/* [Rest of the previous component remains the same] */}

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
    );
};

export default LegalAdviserChat;