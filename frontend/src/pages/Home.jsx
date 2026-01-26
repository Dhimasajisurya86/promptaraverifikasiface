import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEmployees, getAttendances } from '../services/api';

/**
 * Home Page
 * Dashboard dengan statistik dan navigasi
 */
const Home = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        todayAttendance: 0,
    });
    const [recentAttendances, setRecentAttendances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load employees
            const employeesRes = await getEmployees();
            const employees = employeesRes.data || [];

            // Load recent attendances
            const attendancesRes = await getAttendances({ limit: 10 });
            const attendances = attendancesRes.data || [];

            // Count today's attendance
            const today = new Date().toDateString();
            const todayCount = attendances.filter(a => {
                const checkInDate = new Date(a.check_in_time).toDateString();
                return checkInDate === today && a.status === 'success';
            }).length;

            setStats({
                totalEmployees: employees.length,
                todayAttendance: todayCount,
            });

            setRecentAttendances(attendances.slice(0, 5));
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        📸 Promptara face verification system anjay
                    </h1>
                    <p className="text-gray-600 mt-1">Sistem Absensi dengan Verifikasi Wajah</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12">
                {/* Action Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Register Card */}
                    <Link to="/register" className="group">
                        <div className="card hover:shadow-2xl transition-shadow duration-300 h-full border-2 border-transparent group-hover:border-primary-400">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Registrasi Karyawan
                                    </h2>
                                    <p className="text-gray-600">
                                        Daftarkan karyawan baru dengan foto wajah untuk verifikasi absensi
                                    </p>
                                    <div className="mt-4 text-primary-600 font-semibold group-hover:text-primary-700">
                                        Mulai Registrasi →
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Check-In Card */}
                    <Link to="/checkin" className="group">
                        <div className="card hover:shadow-2xl transition-shadow duration-300 h-full border-2 border-transparent group-hover:border-green-400">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Check-In Absensi
                                    </h2>
                                    <p className="text-gray-600">
                                        Lakukan absensi dengan verifikasi wajah menggunakan kamera
                                    </p>
                                    <div className="mt-4 text-green-600 font-semibold group-hover:text-green-700">
                                        Check-In Sekarang →
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Statistics */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-primary-100 mb-1">Total Karyawan</p>
                                <p className="text-4xl font-bold">{stats.totalEmployees}</p>
                            </div>
                            <svg className="w-16 h-16 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 mb-1">Absensi Hari Ini</p>
                                <p className="text-4xl font-bold">{stats.todayAttendance}</p>
                            </div>
                            <svg className="w-16 h-16 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Recent Attendances */}
                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Absensi Terbaru
                    </h2>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Memuat data...</p>
                        </div>
                    ) : recentAttendances.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <p>Belum ada data absensi</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Waktu Check-In
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Similarity Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentAttendances.map((attendance) => (
                                        <tr key={attendance.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {attendance.user_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {new Date(attendance.check_in_time).toLocaleString('id-ID')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {(attendance.similarity_score * 100).toFixed(2)}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${attendance.status === 'success'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {attendance.status === 'success' ? '✓ Berhasil' : '✗ Gagal'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;
