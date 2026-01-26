import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

/**
 * WebcamCapture Component
 * Reusable component untuk mengakses kamera browser dan capture foto
 * 
 * @param {Function} onCapture - Callback function yang dipanggil saat foto di-capture
 *                                Menerima parameter: imageSrc (base64 string), imageBlob (Blob)
 */
const WebcamCapture = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    // Video constraints untuk webcam
    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: 'user', // Front camera
    };

    // Handler saat kamera ready
    const handleUserMedia = () => {
        setIsCameraReady(true);
    };

    // Capture foto dari webcam
    const capture = useCallback(() => {
        if (!webcamRef.current) return;

        // Ambil screenshot sebagai base64 string
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);

        // Convert base64 ke Blob untuk upload
        fetch(imageSrc)
            .then((res) => res.blob())
            .then((blob) => {
                // Call callback function dengan data
                if (onCapture) {
                    onCapture(imageSrc, blob);
                }
            });
    }, [webcamRef, onCapture]);

    // Retake photo
    const retake = () => {
        setImgSrc(null);
        if (onCapture) {
            onCapture(null, null);
        }
    };

    return (
        <div className="webcam-container">
            {!imgSrc ? (
                <div className="relative">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        onUserMedia={handleUserMedia}
                        className="w-full rounded-lg shadow-md"
                    />

                    {/* Camera status indicator */}
                    {!isCameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
                            <div className="text-white text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                <p>Mengakses kamera...</p>
                            </div>
                        </div>
                    )}

                    {/* Capture button */}
                    {isCameraReady && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={capture}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                Ambil Foto
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {/* Preview captured image */}
                    <img
                        src={imgSrc}
                        alt="Captured"
                        className="w-full rounded-lg shadow-md"
                    />

                    {/* Retake button */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={retake}
                            className="btn-secondary inline-flex items-center gap-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Ambil Ulang
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebcamCapture;
