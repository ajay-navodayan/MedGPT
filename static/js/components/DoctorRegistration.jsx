function DoctorRegistration({ onLogin }) {
    const { useState, useEffect } = React;
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        specialization: '',
        license_number: '',
        phone: '',
        bio: '',
        experience_years: '',
        consultation_fee: ''
    });

    const specializations = [
        'General Medicine', 'Cardiology', 'Dermatology', 'Endocrinology',
        'Gastroenterology', 'Neurology', 'Oncology', 'Orthopedics',
        'Pediatrics', 'Psychiatry', 'Pulmonology', 'Radiology',
        'Surgery', 'Urology', 'Ophthalmology', 'ENT (Otolaryngology)',
        'Gynecology', 'Anesthesiology', 'Emergency Medicine', 'Family Medicine'
    ];

    // Initialize Feather icons after component renders
    useEffect(() => {
        if (window.feather) {
            window.feather.replace();
        }
    }, [isLoginMode, message]);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post('/api/doctor/login', loginData);
            
            setMessage('Login successful! Redirecting to dashboard...');
            setMessageType('success');
            
            // Call the onLogin callback with doctor data
            setTimeout(() => {
                onLogin(response.data.doctor);
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
            setMessage(errorMessage);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Validate passwords match
        if (registerData.password !== registerData.confirmPassword) {
            setMessage('Passwords do not match');
            setMessageType('error');
            setLoading(false);
            return;
        }

        // Validate password strength
        if (registerData.password.length < 8) {
            setMessage('Password must be at least 8 characters long');
            setMessageType('error');
            setLoading(false);
            return;
        }

        try {
            const registrationData = {
                ...registerData,
                experience_years: parseInt(registerData.experience_years) || 0,
                consultation_fee: parseFloat(registerData.consultation_fee) || 0.00
            };
            delete registrationData.confirmPassword;

            const response = await axios.post('/api/doctor/register', registrationData);
            
            setMessage('Registration successful! Your account is pending verification. You can now log in.');
            setMessageType('success');
            
            // Reset form and switch to login mode
            setRegisterData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                specialization: '',
                license_number: '',
                phone: '',
                bio: '',
                experience_years: '',
                consultation_fee: ''
            });
            
            setTimeout(() => {
                setIsLoginMode(true);
                setMessage('');
            }, 3000);

        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
            setMessage(errorMessage);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
                <div className="medical-gradient rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <i data-feather="user-plus" className="w-8 h-8 text-white"></i>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Portal</h1>
                <p className="text-gray-600">
                    {isLoginMode ? 'Access your medical practice dashboard' : 'Join our network of verified medical professionals'}
                </p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    messageType === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    <div className="flex items-center">
                        <i data-feather={messageType === 'success' ? 'check-circle' : 'alert-circle'} 
                           className="w-5 h-5 mr-2"></i>
                        {message}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Toggle Tabs */}
                <div className="flex">
                    <button
                        className={`fl$ex-1 py-4 px-6 text-center font-semibold transition-colors {
                            isLoginMode 
                                ? 'bg-medical-500 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => {
                            setIsLoginMode(true);
                            setMessage('');
                        }}
                    >
                        <i data-feather="log-in" className="w-4 h-4 mr-2 inline"></i>
                        Doctor Login
                    </button>
                    <button
                        className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                            !isLoginMode 
                                ? 'bg-health-500 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => {
                            setIsLoginMode(false);
                            setMessage('');
                        }}
                    >
                        <i data-feather="user-plus" className="w-4 h-4 mr-2 inline"></i>
                        Register as Doctor
                    </button>
                </div>

                <div className="p-8">
                    {isLoginMode ? (
                        /* Login Form */
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    required
                                    className="form-input w-full px-4 py-3 rounded-lg"
                                    placeholder="Enter your email address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    required
                                    className="form-input w-full px-4 py-3 rounded-lg"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-medical w-full py-3 rounded-lg font-semibold disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <i data-feather="log-in" className="w-4 h-4 mr-2 inline"></i>
                                        Sign In to Dashboard
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Registration Form */
                        <form onSubmit={handleRegister} className="space-y-6">
                            {/* Personal Information */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={registerData.name}
                                        onChange={handleRegisterChange}
                                        required
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                        placeholder="Dr. John Smith"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={registerData.email}
                                        onChange={handleRegisterChange}
                                        required
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                        placeholder="doctor@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password Fields */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={registerData.password}
                                        onChange={handleRegisterChange}
                                        required
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                        placeholder="Minimum 8 characters"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={registerData.confirmPassword}
                                        onChange={handleRegisterChange}
                                        required
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                        placeholder="Re-enter password"
                                    />
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Specialization *
                                    </label>
                                    <select
                                        name="specialization"
                                        value={registerData.specialization}
                                        onChange={handleRegisterChange}
                                        required
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                    >
                                        <option value="">Select specialization</option>
                                        {specializations.map(spec => (
                                            <option key={spec} value={spec}>{spec}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        License Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="license_number"
                                        value={registerData.license_number}
                                        onChange={handleRegisterChange}
                                        required
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                        placeholder="Medical license number"
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={registerData.phone}
                                    onChange={handleRegisterChange}
                                    className="form-input w-full px-4 py-3 rounded-lg"
                                    placeholder="(555) 123-4567"
                                />
                            </div>

                            {/* Professional Details */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        name="experience_years"
                                        value={registerData.experience_years}
                                        onChange={handleRegisterChange}
                                        min="0"
                                        max="50"
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Consultation Fee (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="consultation_fee"
                                        value={registerData.consultation_fee}
                                        onChange={handleRegisterChange}
                                        min="0"
                                        step="0.01"
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Professional Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={registerData.bio}
                                    onChange={handleRegisterChange}
                                    rows={4}
                                    className="form-input w-full px-4 py-3 rounded-lg resize-none"
                                    placeholder="Brief description of your medical background, expertise, and approach to patient care..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-health w-full py-3 rounded-lg font-semibold disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <i data-feather="user-check" className="w-4 h-4 mr-2 inline"></i>
                                        Register as Doctor
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Verification Notice */}
                {!isLoginMode && (
                    <div className="bg-yellow-50 border-t border-yellow-200 p-6">
                        <div className="flex items-start">
                            <i data-feather="shield-check" className="w-5 h-5 text-yellow-600 mr-3 mt-0.5"></i>
                            <div>
                                <h4 className="font-semibold text-yellow-800 mb-1">Verification Process</h4>
                                <p className="text-sm text-yellow-700">
                                    After registration, your credentials will be verified by our medical team. 
                                    This process typically takes 24-48 hours. You'll receive an email confirmation 
                                    once your account is verified and you can start accepting appointments.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Benefits Section */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
                <div className="text-center p-6">
                    <div className="bg-medical-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <i data-feather="users" className="w-6 h-6 text-medical-600"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Expand Your Practice</h3>
                    <p className="text-sm text-gray-600">
                        Connect with patients seeking quality medical care and grow your practice online.
                    </p>
                </div>

                <div className="text-center p-6">
                    <div className="bg-health-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <i data-feather="calendar" className="w-6 h-6 text-health-600"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Easy Scheduling</h3>
                    <p className="text-sm text-gray-600">
                        Manage appointments efficiently with our intuitive scheduling system.
                    </p>
                </div>

                <div className="text-center p-6">
                    <div className="bg-medical-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <i data-feather="shield" className="w-6 h-6 text-medical-600"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Verified Network</h3>
                    <p className="text-sm text-gray-600">
                        Join a trusted network of verified medical professionals committed to quality care.
                    </p>
                </div>
            </div>
        </div>
    );
}
