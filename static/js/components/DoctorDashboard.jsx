function DoctorDashboard({ doctor, onLogout }) {
    const { useState, useEffect } = React;
    const [activeTab, setActiveTab] = useState('overview');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [editingProfile, setEditingProfile] = useState(false);
    
    const [profileData, setProfileData] = useState({
        name: doctor.name || '',
        phone: '',
        bio: '',
        experience_years: 0,
        consultation_fee: 0.00
    });

    const [stats, setStats] = useState({
        totalAppointments: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        completedAppointments: 0
    });

    useEffect(() => {
        loadDoctorProfile();
        loadAppointments();
    }, []);

    // Initialize Feather icons after component renders
    useEffect(() => {
        if (window.feather) {
            window.feather.replace();
        }
    }, [activeTab, appointments]);

    const loadDoctorProfile = async () => {
        try {
            const response = await axios.get(`/api/doctor/profile/${doctor.id}`);
            const doctorProfile = response.data.doctor;
            
            setProfileData({
                name: doctorProfile.name,
                phone: doctorProfile.phone || '',
                bio: doctorProfile.bio || '',
                experience_years: doctorProfile.experience_years || 0,
                consultation_fee: doctorProfile.consultation_fee || 0.00
            });
        } catch (error) {
            console.error('Failed to load doctor profile:', error);
        }
    };

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/appointments?doctor_id=${doctor.id}`);
            const appointmentData = response.data.appointments;
            
            setAppointments(appointmentData);
            
            // Calculate stats
            const stats = {
                totalAppointments: appointmentData.length,
                pendingAppointments: appointmentData.filter(apt => apt.status === 'pending').length,
                confirmedAppointments: appointmentData.filter(apt => apt.status === 'confirmed').length,
                completedAppointments: appointmentData.filter(apt => apt.status === 'completed').length
            };
            setStats(stats);
            
        } catch (error) {
            console.error('Failed to load appointments:', error);
            setMessage('Failed to load appointments');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const updateAppointmentStatus = async (appointmentId, status, notes = '') => {
        try {
            await axios.put(`/api/appointments/${appointmentId}`, {
                status,
                notes
            });
            
            setMessage(`Appointment ${status} successfully`);
            setMessageType('success');
            
            // Reload appointments
            loadAppointments();
            
        } catch (error) {
            console.error('Failed to update appointment:', error);
            setMessage('Failed to update appointment');
            setMessageType('error');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.put(`/api/doctor/profile/${doctor.id}`, profileData);
            
            setMessage('Profile updated successfully');
            setMessageType('success');
            setEditingProfile(false);
            
        } catch (error) {
            console.error('Profile update error:', error);
            setMessage('Failed to update profile');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const upcomingAppointments = appointments
        .filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed')
        .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
        .slice(0, 5);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, Dr. {doctor.name}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {doctor.specialization} • {doctor.is_verified ? 'Verified' : 'Pending Verification'}
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                        <div className="flex items-center">
                            {doctor.is_verified ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <i data-feather="check-circle" className="w-4 h-4 mr-1"></i>
                                    Verified
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                    <i data-feather="clock" className="w-4 h-4 mr-1"></i>
                                    Pending Verification
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onLogout}
                            className="text-red-600 hover:text-red-700 font-medium"
                        >
                            <i data-feather="log-out" className="w-4 h-4 mr-1 inline"></i>
                            Logout
                        </button>
                    </div>
                </div>
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
                        <button
                            onClick={() => setMessage('')}
                            className="ml-auto"
                        >
                            <i data-feather="x" className="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'overview', label: 'Overview', icon: 'home' },
                        { id: 'appointments', label: 'Appointments', icon: 'calendar' },
                        { id: 'profile', label: 'Profile', icon: 'user' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-medical-500 text-medical-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <i data-feather={tab.icon} className="w-4 h-4 mr-2"></i>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* Stats Cards */}
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center">
                                <div className="bg-medical-100 rounded-lg p-3">
                                    <i data-feather="calendar" className="w-6 h-6 text-medical-600"></i>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 rounded-lg p-3">
                                    <i data-feather="clock" className="w-6 h-6 text-yellow-600"></i>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center">
                                <div className="bg-green-100 rounded-lg p-3">
                                    <i data-feather="check-circle" className="w-6 h-6 text-green-600"></i>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Confirmed</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.confirmedAppointments}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center">
                                <div className="bg-blue-100 rounded-lg p-3">
                                    <i data-feather="check" className="w-6 h-6 text-blue-600"></i>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.completedAppointments}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            <i data-feather="calendar" className="w-5 h-5 inline mr-2"></i>
                            Upcoming Appointments
                        </h3>
                        
                        {upcomingAppointments.length === 0 ? (
                            <div className="text-center py-8">
                                <i data-feather="calendar" className="w-12 h-12 text-gray-400 mx-auto mb-2"></i>
                                <p className="text-gray-500">No upcoming appointments</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingAppointments.map(appointment => (
                                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{appointment.patient_name}</h4>
                                            <p className="text-sm text-gray-600">{appointment.patient_email}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {formatDate(appointment.appointment_date)} at {appointment.appointment_time}
                                            </p>
                                            {appointment.reason && (
                                                <p className="text-sm text-gray-600 mt-1">Reason: {appointment.reason}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'appointments' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                            <i data-feather="calendar" className="w-5 h-5 inline mr-2"></i>
                            All Appointments
                        </h3>
                        <button
                            onClick={loadAppointments}
                            disabled={loading}
                            className="btn-medical px-4 py-2 rounded-lg font-medium"
                        >
                            <i data-feather="refresh-cw" className={`w-4 h-4 mr-2 inline ${loading ? 'animate-spin' : ''}`}></i>
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Loading appointments...</p>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="text-center py-8">
                            <i data-feather="calendar" className="w-12 h-12 text-gray-400 mx-auto mb-2"></i>
                            <p className="text-gray-500">No appointments found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map(appointment => (
                                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">{appointment.patient_name}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status}
                                                </span>
                                            </div>
                                            
                                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <p><strong>Email:</strong> {appointment.patient_email}</p>
                                                    {appointment.patient_phone && (
                                                        <p><strong>Phone:</strong> {appointment.patient_phone}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p><strong>Date:</strong> {formatDate(appointment.appointment_date)}</p>
                                                    <p><strong>Time:</strong> {appointment.appointment_time}</p>
                                                </div>
                                            </div>
                                            
                                            {appointment.reason && (
                                                <div className="mt-2">
                                                    <p className="text-sm"><strong>Reason:</strong> {appointment.reason}</p>
                                                </div>
                                            )}
                                            
                                            {appointment.notes && (
                                                <div className="mt-2">
                                                    <p className="text-sm"><strong>Notes:</strong> {appointment.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {appointment.status === 'pending' && (
                                        <div className="mt-4 flex space-x-2">
                                            <button
                                                onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                                className="btn-health px-3 py-1 rounded text-sm"
                                            >
                                                <i data-feather="check" className="w-3 h-3 mr-1 inline"></i>
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                <i data-feather="x" className="w-3 h-3 mr-1 inline"></i>
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                    
                                    {appointment.status === 'confirmed' && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                <i data-feather="check-circle" className="w-3 h-3 mr-1 inline"></i>
                                                Mark Complete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                            <i data-feather="user" className="w-5 h-5 inline mr-2"></i>
                            Doctor Profile
                        </h3>
                        <button
                            onClick={() => setEditingProfile(!editingProfile)}
                            className="btn-medical px-4 py-2 rounded-lg font-medium"
                        >
                            <i data-feather={editingProfile ? 'x' : 'edit'} className="w-4 h-4 mr-2 inline"></i>
                            {editingProfile ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {editingProfile ? (
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleProfileChange}
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleProfileChange}
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        name="experience_years"
                                        value={profileData.experience_years}
                                        onChange={handleProfileChange}
                                        min="0"
                                        max="50"
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Consultation Fee ($)
                                    </label>
                                    <input
                                        type="number"
                                        name="consultation_fee"
                                        value={profileData.consultation_fee}
                                        onChange={handleProfileChange}
                                        min="0"
                                        step="0.01"
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Professional Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={profileData.bio}
                                    onChange={handleProfileChange}
                                    rows={6}
                                    className="form-input w-full px-4 py-3 rounded-lg resize-none"
                                    placeholder="Tell patients about your background, expertise, and approach to care..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingProfile(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-medical px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900">Personal Information</h4>
                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <label className="text-sm text-gray-600">Full Name</label>
                                            <p className="font-medium">{profileData.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Email</label>
                                            <p className="font-medium">{doctor.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Phone</label>
                                            <p className="font-medium">{profileData.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900">Professional Details</h4>
                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <label className="text-sm text-gray-600">Specialization</label>
                                            <p className="font-medium">{doctor.specialization}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Experience</label>
                                            <p className="font-medium">{profileData.experience_years} years</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Consultation Fee</label>
                                            <p className="font-medium">${profileData.consultation_fee}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {profileData.bio && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Professional Bio</h4>
                                    <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
