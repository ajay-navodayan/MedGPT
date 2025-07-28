function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center mb-4">
                            <div className="medical-gradient rounded-lg w-8 h-8 flex items-center justify-center mr-3">
                                <i data-feather="heart" className="w-5 h-5 text-white"></i>
                            </div>
                            <h3 className="text-lg font-bold">MedGPT</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">
                            Your intelligent medical assistant providing professional healthcare guidance 
                            and connecting you with verified medical professionals.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-medical-400 transition-colors">
                                <i data-feather="facebook" className="w-5 h-5"></i>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-medical-400 transition-colors">
                                <i data-feather="twitter" className="w-5 h-5"></i>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-medical-400 transition-colors">
                                <i data-feather="linkedin" className="w-5 h-5"></i>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-medical-400 transition-colors">
                                <i data-feather="instagram" className="w-5 h-5"></i>
                            </a>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                            Services
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Medical AI Chat
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Doctor Appointments
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Health News
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Telemedicine
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* For Doctors */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                            For Doctors
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Doctor Registration
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Practice Management
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Patient Portal
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Medical Resources
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                            Support
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Medical Disclaimer */}
                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <i data-feather="alert-triangle" className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0"></i>
                            <div>
                                <h5 className="text-yellow-300 font-semibold text-sm mb-1">Medical Disclaimer</h5>
                                <p className="text-yellow-200 text-xs">
                                    MedGPT provides general medical information for educational purposes only. 
                                    This information is not intended as medical advice and should not be used as a 
                                    substitute for professional medical consultation, diagnosis, or treatment. 
                                    Always seek the advice of your physician or other qualified healthcare provider 
                                    with any questions you may have regarding a medical condition.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} MedGPT. All rights reserved.
                        </p>
                        <div className="flex items-center mt-4 md:mt-0">
                            <span className="text-gray-400 text-xs mr-4">
                                Powered by Advanced Medical AI
                            </span>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-health-500 rounded-full mr-2 pulse-slow"></div>
                                <span className="text-health-400 text-xs">System Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
