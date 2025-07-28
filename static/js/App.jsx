const { useState, useEffect } = React;

function App() {
    const [currentView, setCurrentView] = useState('home');
    const [doctorSession, setDoctorSession] = useState(null);

    // No longer needed - using SVG icons directly

    // Check for existing doctor session on app load
    useEffect(() => {
        const savedSession = localStorage.getItem('doctorSession');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                setDoctorSession(session);
            } catch (error) {
                console.error('Invalid doctor session data:', error);
                localStorage.removeItem('doctorSession');
            }
        }
    }, []);

    const handleDoctorLogin = (doctorData) => {
        setDoctorSession(doctorData);
        localStorage.setItem('doctorSession', JSON.stringify(doctorData));
        setCurrentView('doctor-dashboard');
    };

    const handleDoctorLogout = () => {
        setDoctorSession(null);
        localStorage.removeItem('doctorSession');
        setCurrentView('home');
    };

    const renderContent = () => {
        switch (currentView) {
            case 'chat':
                return <ChatBot />;
            case 'appointment':
                return <Appointment />;
            case 'news':
                return <NewsFeed />;
            case 'doctor-register':
                return <DoctorRegistration onLogin={handleDoctorLogin} />;
            case 'doctor-dashboard':
                return doctorSession ? 
                    <DoctorDashboard 
                        doctor={doctorSession} 
                        onLogout={handleDoctorLogout} 
                    /> : <DoctorRegistration onLogin={handleDoctorLogin} />;
            default:
                return <HomePage setCurrentView={setCurrentView} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header 
                currentView={currentView} 
                setCurrentView={setCurrentView}
                doctorSession={doctorSession}
                onDoctorLogout={handleDoctorLogout}
            />
            
            <main className="flex-1">
                {renderContent()}
            </main>
            
            <Footer />
        </div>
    );
}

function HomePage({ setCurrentView }) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <div className="medical-gradient rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    <MediumIcon className="w-12 h-12 text-white">
                        <Icons.Heart />
                    </MediumIcon>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                    Welcome to <span className="text-medical-600">MedGPT</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                    Your intelligent medical assistant providing professional healthcare guidance, 
                    appointment booking, and real-time medical news updates.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button 
                        className="btn-medical px-8 py-3 rounded-lg font-semibold text-lg"
                        onClick={() => setCurrentView('chat')}
                    >
                        <SmallIcon className="w-5 h-5 mr-2 inline">
                            <Icons.MessageSquare />
                        </SmallIcon>
                        Start Medical Chat
                    </button>
                    <button 
                        className="btn-health px-8 py-3 rounded-lg font-semibold text-lg"
                        onClick={() => setCurrentView('appointment')}
                    >
                        <SmallIcon className="w-5 h-5 mr-2 inline">
                            <Icons.Calendar />
                        </SmallIcon>
                        Book Appointment
                    </button>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="card-hover bg-white p-8 rounded-xl shadow-lg">
                    <div className="medical-icon text-center mb-6">
                        <LargeIcon className="w-16 h-16 mx-auto text-health-500">
                            <Icons.MessageSquare />
                        </LargeIcon>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">AI Medical Assistant</h3>
                    <p className="text-gray-600 text-center">
                        Get instant medical guidance powered by advanced AI. Ask about symptoms, 
                        treatments, and general health questions.
                    </p>
                </div>

                <div className="card-hover bg-white p-8 rounded-xl shadow-lg">
                    <div className="medical-icon text-center mb-6">
                        <LargeIcon className="w-16 h-16 mx-auto text-medical-500">
                            <Icons.UserMd />
                        </LargeIcon>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Expert Doctors</h3>
                    <p className="text-gray-600 text-center">
                        Connect with verified medical professionals. Book appointments with 
                        specialists in various medical fields.
                    </p>
                </div>

                <div className="card-hover bg-white p-8 rounded-xl shadow-lg">
                    <div className="medical-icon text-center mb-6">
                        <LargeIcon className="w-16 h-16 mx-auto text-health-500">
                            <Icons.News />
                        </LargeIcon>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Medical News</h3>
                    <p className="text-gray-600 text-center">
                        Stay updated with the latest medical research, health news, and 
                        breakthrough treatments from trusted sources.
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="medical-gradient-light rounded-2xl p-8 mb-16">
                <div className="grid md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-3xl font-bold text-medical-700 mb-2">24/7</div>
                        <div className="text-gray-600">AI Assistant Available</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-medical-700 mb-2">100+</div>
                        <div className="text-gray-600">Verified Doctors</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-medical-700 mb-2">50+</div>
                        <div className="text-gray-600">Medical Specialties</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-medical-700 mb-2">Live</div>
                        <div className="text-gray-600">Medical News Feed</div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Ready to Get Started?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                    Choose how you'd like to begin your medical journey with MedGPT
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                    <button 
                        className="bg-white text-medical-600 border-2 border-medical-600 px-6 py-3 rounded-lg font-semibold hover:bg-medical-50 transition-colors"
                        onClick={() => setCurrentView('chat')}
                    >
                        Ask Medical Questions
                    </button>
                    <button 
                        className="bg-white text-health-600 border-2 border-health-600 px-6 py-3 rounded-lg font-semibold hover:bg-health-50 transition-colors"
                        onClick={() => setCurrentView('appointment')}
                    >
                        Find a Doctor
                    </button>
                    <button 
                        className="bg-white text-gray-600 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        onClick={() => setCurrentView('news')}
                    >
                        Read Medical News
                    </button>
                </div>
            </div>
        </div>
    );
}

// Initialize Feather icons after component render
const observer = new MutationObserver(() => {
    if (window.feather) {
        feather.replace();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Render the App
ReactDOM.render(<App />, document.getElementById('root'));
