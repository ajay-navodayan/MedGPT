function ChatBot() {
    const { useState, useRef, useEffect } = React;
    // aded a comt 
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: 'Hello! I\'m MedGPT, your medical AI assistant. I can help answer your health questions, provide medical information, and guide you on when to seek professional care. How can I assist you today?',
            timestamp: new Date().toISOString()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // No longer needed - using SVG icons directly

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/chat', {
                message: userMessage.content,
                session_id: sessionId
            });

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: response.data.response,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment. If this persists, please check your internet connection or contact support.',
                timestamp: new Date().toISOString(),
                isError: true
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const clearChat = () => {
        setMessages([{
            id: 1,
            type: 'bot',
            content: 'Chat history cleared. How can I help you today?',
            timestamp: new Date().toISOString()
        }]);
    };

    const formatMessage = (content) => {
        // Simple formatting for medical content
        return content
            .split('\n')
            .map((line, index) => (
                <p key={index} className={index > 0 ? 'mt-2' : ''}>
                    {line}
                </p>
            ));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Chat Header */}
                <div className="medical-gradient px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                                <i data-feather="message-square" className="w-6 h-6 text-white"></i>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">MedGPT Assistant</h2>
                                <p className="text-blue-100 text-sm">
                                    AI-powered medical guidance • Available 24/7
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
                                <div className="w-2 h-2 bg-green-300 rounded-full mr-2 pulse-slow"></div>
                                <span className="text-white text-xs">Online</span>
                            </div>
                            <button
                                onClick={clearChat}
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
                                title="Clear chat"
                            >
                                <i data-feather="trash-2" className="w-4 h-4 text-white"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
                        >
                            <div className={`flex max-w-xs md:max-w-md lg:max-w-lg ${
                                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 ${
                                    message.type === 'user' ? 'ml-3' : 'mr-3'
                                }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        message.type === 'user' 
                                            ? 'bg-medical-500' 
                                            : message.isError 
                                                ? 'bg-red-500' 
                                                : 'bg-health-500'
                                    }`}>
                                        <i data-feather={
                                            message.type === 'user' 
                                                ? 'user' 
                                                : message.isError 
                                                    ? 'alert-circle' 
                                                    : 'message-square'
                                        } className="w-5 h-5 text-white"></i>
                                    </div>
                                </div>

                                {/* Message Bubble */}
                                <div className={`rounded-2xl px-4 py-3 ${
                                    message.type === 'user'
                                        ? 'bg-medical-500 text-white'
                                        : message.isError
                                            ? 'bg-red-50 text-red-800 border border-red-200'
                                            : 'bg-gray-100 text-gray-800'
                                } ${message.type === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                                    <div className="text-sm">
                                        {formatMessage(message.content)}
                                    </div>
                                    <div className={`text-xs mt-2 ${
                                        message.type === 'user' 
                                            ? 'text-blue-100' 
                                            : 'text-gray-500'
                                    }`}>
                                        {new Date(message.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex justify-start message-enter">
                            <div className="flex">
                                <div className="w-8 h-8 rounded-full bg-health-500 flex items-center justify-center mr-3">
                                    <i data-feather="message-square" className="w-5 h-5 text-white"></i>
                                </div>
                                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-200 p-4">
                    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
                        <div className="flex-1">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me about symptoms, medications, health conditions, or general medical questions..."
                                className="form-input w-full px-4 py-3 rounded-xl resize-none"
                                rows="1"
                                disabled={isLoading}
                                style={{
                                    minHeight: '48px',
                                    maxHeight: '120px'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="btn-medical p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <i data-feather="send" className="w-5 h-5"></i>
                        </button>
                    </form>
                    
                    {/* Disclaimer */}
                    <div className="mt-3 flex items-start text-xs text-gray-500">
                        <i data-feather="info" className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0"></i>
                        <p>
                            This AI provides general medical information only. For emergencies, call emergency services. 
                            Always consult healthcare professionals for proper diagnosis and treatment.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid md:grid-cols-3 gap-4">
                <button
                    onClick={() => setInputValue('What are the symptoms of the flu?')}
                    className="card-hover bg-white p-4 rounded-xl shadow-lg text-left"
                    disabled={isLoading}
                >
                    <div className="flex items-center mb-2">
                        <i data-feather="thermometer" className="w-5 h-5 text-medical-500 mr-2"></i>
                        <span className="font-semibold text-gray-900">Symptoms</span>
                    </div>
                    <p className="text-sm text-gray-600">Ask about common symptoms</p>
                </button>

                <button
                    onClick={() => setInputValue('Tell me about preventive healthcare measures')}
                    className="card-hover bg-white p-4 rounded-xl shadow-lg text-left"
                    disabled={isLoading}
                >
                    <div className="flex items-center mb-2">
                        <i data-feather="shield" className="w-5 h-5 text-health-500 mr-2"></i>
                        <span className="font-semibold text-gray-900">Prevention</span>
                    </div>
                    <p className="text-sm text-gray-600">Learn about preventive care</p>
                </button>

                <button
                    onClick={() => setInputValue('When should I see a doctor?')}
                    className="card-hover bg-white p-4 rounded-xl shadow-lg text-left"
                    disabled={isLoading}
                >
                    <div className="flex items-center mb-2">
                        <i data-feather="user-check" className="w-5 h-5 text-gray-500 mr-2"></i>
                        <span className="font-semibold text-gray-900">When to See Doctor</span>
                    </div>
                    <p className="text-sm text-gray-600">Get guidance on seeking care</p>
                </button>
            </div>
        </div>
    );
}
