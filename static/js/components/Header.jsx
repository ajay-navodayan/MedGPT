function Header({ currentView, setCurrentView, doctorSession, onDoctorLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'chat', label: 'Medical Chat', icon: 'message-circle' },
        { id: 'appointment', label: 'Book Appointment', icon: 'calendar' },
        { id: 'news', label: 'Medical News', icon: 'activity' },
    ];

    const doctorMenuItems = doctorSession ? [
        { id: 'doctor-dashboard', label: 'Dashboard', icon: 'user' }
    ] : [
        { id: 'doctor-register', label: 'Doctor Portal', icon: 'user-plus' }
    ];

    return (
        <header className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
                        <div className="medical-gradient rounded-lg w-10 h-10 flex items-center justify-center mr-3">
                            <i data-feather="heart" className="w-6 h-6 text-white"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">MedGPT</h1>
                            <p className="text-xs text-gray-500">Medical AI Assistant</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    currentView === item.id
                                        ? 'text-medical-600 bg-medical-50'
                                        : 'text-gray-700 hover:text-medical-600 hover:bg-gray-50'
                                }`}
                                onClick={() => setCurrentView(item.id)}
                            >
                                <i data-feather={item.icon} className="w-4 h-4 mr-2"></i>
                                {item.label}
                            </button>
                        ))}
                        
                        <div className="h-6 border-l border-gray-300"></div>
                        
                        {doctorMenuItems.map(item => (
                            <button
                                key={item.id}
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    currentView === item.id
                                        ? 'text-health-600 bg-health-50'
                                        : 'text-gray-700 hover:text-health-600 hover:bg-gray-50'
                                }`}
                                onClick={() => setCurrentView(item.id)}
                            >
                                <i data-feather={item.icon} className="w-4 h-4 mr-2"></i>
                                {item.label}
                            </button>
                        ))}
                        
                        {doctorSession && (
                            <button
                                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                onClick={onDoctorLogout}
                            >
                                <i data-feather="log-out" className="w-4 h-4 mr-2"></i>
                                Logout
                            </button>
                        )}
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-700 hover:text-medical-600 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <i data-feather={isMenuOpen ? 'x' : 'menu'} className="w-6 h-6"></i>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <div className="space-y-2">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        currentView === item.id
                                            ? 'text-medical-600 bg-medical-50'
                                            : 'text-gray-700 hover:text-medical-600 hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                        setCurrentView(item.id);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <i data-feather={item.icon} className="w-4 h-4 mr-3"></i>
                                    {item.label}
                                </button>
                            ))}
                            
                            <div className="border-t border-gray-200 my-2"></div>
                            
                            {doctorMenuItems.map(item => (
                                <button
                                    key={item.id}
                                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        currentView === item.id
                                            ? 'text-health-600 bg-health-50'
                                            : 'text-gray-700 hover:text-health-600 hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                        setCurrentView(item.id);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <i data-feather={item.icon} className="w-4 h-4 mr-3"></i>
                                    {item.label}
                                </button>
                            ))}
                            
                            {doctorSession && (
                                <button
                                    className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                    onClick={() => {
                                        onDoctorLogout();
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <i data-feather="log-out" className="w-4 h-4 mr-3"></i>
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Doctor Session Info */}
            {doctorSession && (
                <div className="bg-health-50 border-t border-health-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <i data-feather="user-check" className="w-4 h-4 text-health-600 mr-2"></i>
                                <span className="text-sm text-health-700">
                                    Logged in as Dr. {doctorSession.name}
                                </span>
                                {doctorSession.is_verified && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-health-100 text-health-800">
                                        <i data-feather="check-circle" className="w-3 h-3 mr-1"></i>
                                        Verified
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-health-600">
                                {doctorSession.specialization}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
