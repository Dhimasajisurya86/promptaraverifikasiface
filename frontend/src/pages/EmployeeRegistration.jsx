import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebcamCapture from '../components/WebcamCapture';
import { registerEmployee } from '../services/api';

/**
 * EmployeeRegistration Page
 * Form untuk mendaftarkan karyawan baru dengan foto wajah
 */
const EmployeeRegistration = () => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const [capturedImage, setCapturedImage] = useState(null);
    const [imageBlob, setImageBlob] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Handle input change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(null);
    };

    // Handle webcam capture
    const handleCapture = (imageSrc, blob) => {
        setCapturedImage(imageSrc);
        setImageBlob(blob);
        setError(null);
    };

    // Validate form
    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Nama wajib diisi');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email wajib diisi');
            return false;
        }
        if (!imageBlob) {
            setError('Foto wajah wajib diambil');
            return false;
        }
        return true;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // Prepare FormData
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('face_image', imageBlob, 'face.jpg');

            // Submit ke API
            const response = await registerEmployee(data);

            setSuccess(true);
            console.log('Registration successful:', response);

            // Redirect ke home setelah 2 detik
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Gagal mendaftarkan karyawan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-900 mb-2">
                        Registrasi Karyawan Baru
                    </h1>
                    <p className="text-gray-600">
                        Lengkapi data dan ambil foto wajah untuk verifikasi absensi
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">Registrasi berhasil! Mengalihkan...</span>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left Column - Form Fields */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                    Data Karyawan
                                </h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="Masukkan nama lengkap"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nomor Telepon
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                            </div>

                            {/* Right Column - Webcam */}
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                    Foto Wajah <span className="text-red-500">*</span>
                                </h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    Pastikan wajah terlihat jelas dan pencahayaan cukup
                                </p>
                                <WebcamCapture onCapture={handleCapture} />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8 flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="btn-secondary"
                                disabled={isSubmitting}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="inline-flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Memproses...
                                    </span>
                                ) : (
                                    'Daftarkan Karyawan'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployeeRegistration;
