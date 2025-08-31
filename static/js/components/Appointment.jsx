function Appointment() {
    const { useState, useEffect } = React;
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    
    const [formData, setFormData] = useState({
        patient_name: '',
        patient_email: '',
        patient_phone: '',
        appointment_date: '',
        appointment_time: '',
        reason: ''
    });

    // Load doctors on component mount
    useEffect(() => {
        loadDoctors();
    }, []);

    // No longer needed - using SVG icons directly

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/doctors');
            setDoctors(response.data.doctors);
        } catch (error) {
            console.error('Failed to load doctors:', error);
            setMessage('Failed to load doctors. Please refresh the page.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedDoctor) {
            setMessage('Please select a doctor');
            setMessageType('error');
            return;
        }

        setSubmitting(true);
        setMessage('');

        try {
            const appointmentData = {
                ...formData,
                doctor_id: parseInt(selectedDoctor)
            };

            const response = await axios.post('/api/book', appointmentData);
            
            setMessage(`Appointment booked successfully with Dr. ${response.data.doctor_name} on ${response.data.appointment_date} at ${response.data.appointment_time}`);
            setMessageType('success');
            
            // Reset form
            setFormData({
                patient_name: '',
                patient_email: '',
                patient_phone: '',
                appointment_date: '',
                appointment_time: '',
                reason: ''
            });
            setSelectedDoctor('');
            
        } catch (error) {
            console.error('Booking error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to book appointment. Please try again.';
            setMessage(errorMessage);
            setMessageType('error');
        } finally {
            setSubmitting(false);
        }
    };

    // Get minimum date (today)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Generate time slots
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeStr);
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
                <div className="medical-gradient rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MediumIcon className="w-8 h-8 text-white">
                        <Icons.Calendar />
                    </MediumIcon>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
                <p className="text-gray-600">Schedule a consultation with our verified medical professionals</p>
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

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Doctor Selection */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            <i data-feather="users" className="w-5 h-5 inline mr-2"></i>
                            Select a Doctor
                        </h3>
                        
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Loading doctors...</p>
                            </div>
                        ) : doctors.length === 0 ? (
                            <div className="text-center py-8">
                                <i data-feather="user-x" className="w-12 h-12 text-gray-400 mx-auto mb-2"></i>
                                <p className="text-gray-500">No verified doctors available</p>
                                <button 
                                    onClick={loadDoctors}
                                    className="text-medical-600 hover:text-medical-700 text-sm mt-2"
                                >
                                    Refresh list
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {doctors.map(doctor => (
                                    <div
                                        key={doctor.id}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            selectedDoctor === doctor.id.toString()
                                                ? 'border-medical-500 bg-medical-50'
                                                : 'border-gray-200 hover:border-medical-300'
                                        }`}
                                        onClick={() => setSelectedDoctor(doctor.id.toString())}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                                                <p className="text-sm text-medical-600 mb-2">{doctor.specialization}</p>
                                                {doctor.bio && (
                                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{doctor.bio}</p>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">
                                                        {doctor.experience_years} years exp.
                                                    </span>
                                                    {doctor.consultation_fee > 0 && (
                                                        <span className="text-sm font-semibold text-health-600">
                                                            ₹{doctor.consultation_fee}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedDoctor === doctor.id.toString() && (
                                                <i data-feather="check-circle" className="w-5 h-5 text-medical-500 ml-2"></i>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Appointment Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            <i data-feather="edit-3" className="w-5 h-5 inline mr-2"></i>
                            Appointment Details
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Patient Information */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="patient_name"
                                        value={formData.patient_name}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="patient_email"
                                        value={formData.patient_email}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="patient_phone"
                                    value={formData.patient_phone}
                                    onChange={handleInputChange}
                                    className="form-input w-full px-4 py-3 rounded-lg"
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            {/* Appointment Date & Time */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Appointment Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="appointment_date"
                                        value={formData.appointment_date}
                                        onChange={handleInputChange}
                                        min={getMinDate()}
                                        required
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Appointment Time *
                                    </label>
                                    <select
                                        name="appointment_time"
                                        value={formData.appointment_time}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input w-full px-4 py-3 rounded-lg"
                                    >
                                        <option value="">Select time</option>
                                        {timeSlots.map(time => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Reason for Visit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Visit
                                </label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="form-input w-full px-4 py-3 rounded-lg resize-none"
                                    placeholder="Briefly describe your symptoms or reason for the appointment..."
                                ></textarea>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting || !selectedDoctor}
                                    className="btn-medical px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                            Booking Appointment...
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Calendar />
                                            <span className="ml-2">Book Appointment</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Appointment Guidelines */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                            <i data-feather="info" className="w-4 h-4 inline mr-2"></i>
                            Appointment Guidelines
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Please arrive 15 minutes early for your appointment</li>
                            <li>• Bring valid ID and insurance information</li>
                            <li>• You will receive a confirmation email with appointment details</li>
                            <li>• For cancellations, please notify us at least 24 hours in advance</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
