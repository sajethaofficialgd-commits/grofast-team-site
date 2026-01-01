import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    Camera,
    MapPin,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Smartphone,
    RefreshCw,
    ArrowLeft,
    Clock,
    Loader2
} from 'lucide-react';

export default function AttendancePage() {
    const { user } = useAuth();
    const { markAttendance, attendance } = useData();
    const navigate = useNavigate();

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [step, setStep] = useState('check'); // check, camera, location, confirm, success, already-marked
    const [stream, setStream] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState('');
    const [cameraReady, setCameraReady] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.find(a => a.date === today && a.employeeId === user?.id);

    // Check device and attendance status
    useEffect(() => {
        const checkDevice = () => {
            const userAgent = navigator.userAgent.toLowerCase();
            const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            setIsMobile(mobile);
            setDeviceInfo(userAgent);

            if (todayAttendance?.status === 'present') {
                setStep('already-marked');
            } else {
                // Allow attendance from any device
                setStep('camera');
            }
        };

        checkDevice();
    }, [todayAttendance]);

    // Camera is now initialized directly in useEffect below

    // Start camera when step changes to 'camera'
    useEffect(() => {
        let currentStream = null;

        if (step === 'camera') {
            const initCamera = async () => {
                setCameraReady(false);
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: 'user',
                            width: { ideal: 1280, min: 640 },
                            height: { ideal: 960, min: 480 },
                            frameRate: { ideal: 30 }
                        },
                        audio: false
                    });

                    currentStream = mediaStream;
                    setStream(mediaStream);

                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                        videoRef.current.onloadedmetadata = () => {
                            setCameraReady(true);
                        };
                    }
                } catch (error) {
                    console.error('Camera error:', error);
                    let errorMsg = 'Camera access denied. ';
                    if (error.name === 'NotAllowedError') {
                        errorMsg += 'Please allow camera access in your browser settings.';
                    } else if (error.name === 'NotFoundError') {
                        errorMsg += 'No camera found on this device.';
                    } else if (error.name === 'NotReadableError') {
                        errorMsg += 'Camera is in use by another application.';
                    } else {
                        errorMsg += 'Please check your camera permissions.';
                    }
                    setLocationError(errorMsg);
                }
            };

            initCamera();
        }

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [step]); // Only depend on step

    // Capture photo with mirror effect
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');

            // Mirror the image to match what user sees
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0);

            // Reset transform
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            const imageData = canvas.toDataURL('image/jpeg', 0.9); // Higher quality
            setPhoto(imageData);

            // Stop camera
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            setStep('location');
            getLocation();
        }
    };

    // Get location
    // Get location with better error handling
    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser. You can proceed without location.');
            setStep('confirm');
            return;
        }

        setIsLoading(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });

                // Reverse geocode to get address
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    setAddress(data.display_name || 'Location detected');
                } catch (e) {
                    setAddress('Location detected');
                }

                setIsLoading(false);
                setStep('confirm');
            },
            (error) => {
                setIsLoading(false);
                let errorMessage = 'Unable to get your location. ';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Location permission was denied. Please allow location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'Please enable location services.';
                }

                setLocationError(errorMessage);
                // Still allow proceeding to confirm step without location
                setStep('confirm');
            },
            {
                enableHighAccuracy: false, // Set to false for faster response
                timeout: 15000, // Increased timeout
                maximumAge: 60000 // Allow cached position up to 1 minute
            }
        );
    };

    // Skip location and proceed
    const skipLocation = () => {
        setAddress('Location not available');
        setLocationError(null);
        setStep('confirm');
    };

    // Submit attendance
    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            await markAttendance({
                photoUrl: photo,
                latitude: location?.latitude,
                longitude: location?.longitude,
                address: address,
                device: deviceInfo
            });

            setStep('success');
        } catch (error) {
            console.error('Attendance error:', error);
            setLocationError('Failed to mark attendance. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Retry photo
    const retryPhoto = () => {
        setPhoto(null);
        setLocation(null);
        setAddress('');
        setStep('camera');
    };

    // Render based on step
    const renderContent = () => {
        switch (step) {
            case 'already-marked':
                return (
                    <div className="attendance-capture">
                        <div style={{
                            width: 120,
                            height: 120,
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--success-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 'var(--space-5)'
                        }}>
                            <CheckCircle2 size={56} color="var(--success)" />
                        </div>

                        <h2 style={{ marginBottom: 'var(--space-2)' }}>Already Checked In</h2>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'var(--space-5)' }}>
                            You've already marked attendance for today at{' '}
                            {todayAttendance?.checkIn && new Date(todayAttendance.checkIn).toLocaleTimeString()}
                        </p>

                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/dashboard')}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                );

            case 'check':
                // This case is no longer used as we allow all devices
                return null;

            case 'camera':
                return (
                    <div className="attendance-capture">
                        <h2 style={{ marginBottom: 'var(--space-2)' }}>Take a Selfie</h2>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                            📸 Keep your face centered • Good lighting • Hold steady
                        </p>

                        <div className="camera-preview" style={{ position: 'relative' }}>
                            {/* Loading overlay */}
                            {!cameraReady && (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--bg-secondary)',
                                    zIndex: 2
                                }}>
                                    <div className="loading-spinner" style={{ width: 40, height: 40, marginBottom: 'var(--space-3)' }} />
                                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Starting camera...</p>
                                </div>
                            )}

                            {/* Face guide overlay */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                                zIndex: 1
                            }}>
                                <div style={{
                                    width: '70%',
                                    height: '60%',
                                    border: '3px dashed rgba(255,255,255,0.4)',
                                    borderRadius: '50%',
                                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
                                }} />
                            </div>

                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: 'scaleX(-1)' // Mirror effect for selfie
                                }}
                            />
                        </div>
                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                        <p style={{
                            color: 'var(--text-muted)',
                            fontSize: 'var(--text-xs)',
                            textAlign: 'center',
                            marginTop: 'var(--space-3)'
                        }}>
                            Align your face inside the oval guide
                        </p>

                        <button
                            className="btn btn-primary btn-lg"
                            onClick={capturePhoto}
                            disabled={!cameraReady}
                            style={{ marginTop: 'var(--space-4)' }}
                        >
                            <Camera size={24} />
                            {cameraReady ? 'Capture Photo' : 'Loading Camera...'}
                        </button>
                    </div>
                );

            case 'location':
                return (
                    <div className="attendance-capture">
                        <div className="loading-spinner" style={{ width: 48, height: 48, marginBottom: 'var(--space-5)' }} />
                        <h2 style={{ marginBottom: 'var(--space-2)' }}>Getting Location</h2>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'var(--space-5)' }}>
                            Please wait while we fetch your location...
                        </p>
                        <button
                            className="btn btn-ghost"
                            onClick={skipLocation}
                            style={{ fontSize: 'var(--text-sm)' }}
                        >
                            Skip location
                        </button>
                    </div>
                );

            case 'confirm':
                return (
                    <div className="attendance-capture">
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Confirm Attendance</h2>

                        {/* Photo preview */}
                        <div style={{
                            width: '100%',
                            maxWidth: 200,
                            aspectRatio: '3/4',
                            borderRadius: 'var(--radius-xl)',
                            overflow: 'hidden',
                            marginBottom: 'var(--space-4)',
                            border: '3px solid var(--success)'
                        }}>
                            <img
                                src={photo}
                                alt="Your photo"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>

                        {/* Location info */}
                        {location ? (
                            <div className="location-info success" style={{ marginBottom: 'var(--space-5)' }}>
                                <MapPin size={18} />
                                <span style={{ fontSize: 'var(--text-sm)' }}>
                                    {address.length > 60 ? address.substring(0, 60) + '...' : address}
                                </span>
                            </div>
                        ) : (
                            <div style={{
                                padding: 'var(--space-3)',
                                background: 'var(--warning-bg)',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--space-5)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)'
                            }}>
                                <AlertTriangle size={18} color="var(--warning)" />
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--warning)' }}>
                                    Location not available - Attendance will be recorded without location
                                </span>
                            </div>
                        )}

                        {/* Time */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            color: 'var(--text-secondary)',
                            marginBottom: 'var(--space-6)'
                        }}>
                            <Clock size={18} />
                            <span>{new Date().toLocaleTimeString()}</span>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-3)', width: '100%', maxWidth: 320 }}>
                            <button
                                className="btn btn-secondary"
                                onClick={retryPhoto}
                                style={{ flex: 1 }}
                            >
                                <RefreshCw size={18} />
                                Retry
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                style={{ flex: 1 }}
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Confirm
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <div className="attendance-capture">
                        <div style={{
                            width: 120,
                            height: 120,
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--success-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 'var(--space-5)',
                            animation: 'slideUp 300ms ease'
                        }}>
                            <CheckCircle2 size={56} color="var(--success)" />
                        </div>

                        <h2 style={{ marginBottom: 'var(--space-2)' }}>Attendance Marked!</h2>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                            Your attendance has been recorded successfully at {new Date().toLocaleTimeString()}
                        </p>

                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/dashboard')}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)'
            }}>
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="page-title">Mark Attendance</h1>
                    <p className="page-subtitle">{new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</p>
                </div>
            </div>

            {/* Error display */}
            {locationError && (
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'var(--error-bg)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--space-5)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)'
                }}>
                    <XCircle size={20} color="var(--error)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)' }}>{locationError}</p>
                        <button
                            className="btn btn-sm"
                            style={{ marginTop: 'var(--space-2)', color: 'var(--error)' }}
                            onClick={() => {
                                setLocationError(null);
                                if (step === 'location') {
                                    getLocation();
                                } else {
                                    startCamera();
                                }
                            }}
                        >
                            <RefreshCw size={14} /> Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="card">
                <div className="card-body">
                    {renderContent()}
                </div>
            </div>

            {/* Instructions */}
            <div style={{
                marginTop: 'var(--space-6)',
                padding: 'var(--space-5)',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
                    Attendance Requirements
                </h4>
                <ul style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)'
                }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Camera size={16} /> Live photo required (camera access needed)
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <MapPin size={16} /> Location must be enabled
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Smartphone size={16} /> Works on desktop, tablet, and mobile
                    </li>
                </ul>
            </div>
        </div>
    );
}
