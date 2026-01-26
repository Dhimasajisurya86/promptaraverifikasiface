import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WebcamCapture from '../components/WebcamCapture';
import { checkIn, getEmployees } from '../services/api';

/**
 * CheckIn Page
 * Interface untuk karyawan melakukan check-in dengan face verification
 */
const CheckIn = () => {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [capturedImage, setCapturedImage] = useState(null);
    const [imageBlob, setImageBlob] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    // Load employees saat component mount
    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            const response = await getEmployees();
            setEmployees(response.data || []);
        } catch (err) {
            console.error('Error loading employees:', err);
            setError('Gagal memuat data karyawan');
        }
    };

    // Handle webcam capture
    const handleCapture = (imageSrc, blob) => {
        setCapturedImage(imageSrc);
        setImageBlob(blob);
        setError(null);
        setResult(null);
    };

    // Validate form
    const validateForm = () => {
        if (!selectedEmployee) {
            setError('Pilih karyawan terlebih dahulu');
            return false;
        }
        if (!imageBlob) {
            setError('Ambil foto selfie terlebih dahulu');
            return false;
        }
        return true;
    };

    // Handle check-in submit
    const handleCheckIn = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setError(null);
        setResult(null);

        try {
            const response = await checkIn(selectedEmployee, imageBlob);

            setResult(response.data);
            console.log('Check-in result:', response);

            // Auto redirect jika berhasil
            if (response.data.verification) {
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }

        } catch (err) {
            console.error('Check-in error:', err);
            setError(err.response?.data?.message || 'Gagal melakukan check-in. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-green-900 mb-2">
                        Check-In Absensi
                    </h1>
                    <p className="text-gray-600">
                        Pilih nama Anda dan ambil foto selfie untuk verifikasi wajah
                    </p>
                </div>

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

                {/* Verification Result */}
                {result && (
                    <div className={`mb-6 p-6 rounded-lg ${result.verification
                            ? 'bg-green-100 border border-green-400 text-green-800'
                            : 'bg-red-100 border border-red-400 text-red-800'
                        }`}>
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                {result.verification ? (
                                    <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-2">
                                    {result.verification ? '✅ Verifikasi Berhasil!' : '❌ Verifikasi Gagal'}
                                </h3>
                                <p className="mb-3">{result.message}</p>
                                <div className="space-y-1 text-sm">
                                    <p><strong>Karyawan:</strong> {result.attendance.user_name}</p>
                                    <p><strong>Waktu Check-In:</strong> {new Date(result.attendance.check_in_time).toLocaleString('id-ID')}</p>
                                    <p><strong>Similarity Score:</strong> {(result.similarity_score * 100).toFixed(2)}%</p>
                                    <p><strong>Threshold:</strong> {(result.threshold * 100).toFixed(2)}%</p>
                                </div>
                                {result.verification && (
                                    <p className="mt-3 text-sm italic">Mengalihkan ke halaman utama...</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Check-In Form */}
                <div className="card">
                    <form onSubmit={handleCheckIn}>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left Column - Employee Selection */}
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                    Pilih Karyawan
                                </h2>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Karyawan <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedEmployee}
                                        onChange={(e) => {
                                            setSelectedEmployee(e.target.value);
                                            setError(null);
                                            setResult(null);
                                        }}
                                        className="input-field"
                                    >
                                        <option value="">-- Pilih Karyawan --</option>
                                        {employees.map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name} ({emp.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedEmployee && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h3 className="font-semibold text-blue-900 mb-2">Informasi:</h3>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>✓ Pastikan wajah terlihat jelas</li>
                                            <li>✓ Gunakan pencahayaan yang cukup</li>
                                            <li>✓ Hadap langsung ke kamera</li>
                                            <li>✓ Jangan gunakan kacamata hitam/masker</li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Webcam */}
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                    Ambil Foto Selfie <span className="text-red-500">*</span>
                                </h2>
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
                                Kembali
                            </button>
                            <button
                                type="submit"
                                className="btn-success"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="inline-flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Memverifikasi...
                                    </span>
                                ) : (
                                    'Check-In Sekarang'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckIn;
