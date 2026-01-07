// Attendance JavaScript - Live Photo + Geo Location
// MOBILE ONLY - Desktop blocked for security (no accurate GPS)
// Includes geofencing to verify user is at office location

let stream = null;
let capturedPhotoData = null;
let locationData = null;

// Office/Work Location Configuration - SET YOUR OFFICE COORDINATES HERE
const OFFICE_LOCATIONS = [
    {
        name: 'Grofast Office',
        latitude: 13.0827,  // Chennai default - CHANGE TO YOUR OFFICE LOCATION
        longitude: 80.2707,
        radiusMeters: 500   // Allowed radius in meters (500m = ~5 min walk)
    }
    // Add more office locations if needed:
    // { name: 'Branch Office', latitude: XX.XXXX, longitude: XX.XXXX, radiusMeters: 300 }
];

// Allow attendance from any location? Set to true for testing, false for production
const REQUIRE_OFFICE_LOCATION = false; // Set to true to enable geofencing

document.addEventListener('DOMContentLoaded', async () => {
    if (!auth.requireAuth()) return;

    // Set current date
    document.getElementById('currentDate').textContent = formatDate(new Date());

    // Check device type
    const deviceType = getDeviceType();
    const desktopWarning = document.getElementById('desktopWarning');
    const attendanceFlow = document.getElementById('attendanceFlow');

    // BLOCK DESKTOP - Require mobile for accurate GPS
    if (deviceType === 'desktop') {
        if (desktopWarning) {
            desktopWarning.innerHTML = `
                <div class="notice-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                </div>
                <div class="notice-content">
                    <h3>📱 Mobile Device Required</h3>
                    <p>Attendance requires <strong>GPS location verification</strong> which is only available on mobile devices.</p>
                    <ul>
                        <li>• Desktop browsers cannot provide accurate GPS location</li>
                        <li>• Please use your <strong>mobile phone</strong> to mark attendance</li>
                        <li>• Enable GPS/Location Services on your phone</li>
                    </ul>
                </div>
            `;
            desktopWarning.style.display = 'flex';
            desktopWarning.style.flexDirection = 'column';
            desktopWarning.style.background = 'rgba(239, 68, 68, 0.1)';
            desktopWarning.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            desktopWarning.style.color = '#fca5a5';
        }
        if (attendanceFlow) {
            attendanceFlow.style.display = 'none';
        }
        // Load history even on desktop
        await syncAndLoadHistory();
        return; // Stop here for desktop
    }

    // Show mobile info
    if (desktopWarning) {
        desktopWarning.innerHTML = `
            <div class="notice-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>
            <p>✓ Mobile device detected. GPS location will be used for verification.</p>
        `;
        desktopWarning.style.display = 'flex';
        desktopWarning.style.background = 'rgba(16, 185, 129, 0.1)';
        desktopWarning.style.borderColor = 'rgba(16, 185, 129, 0.2)';
        desktopWarning.style.color = '#10b981';
    }

    // Check if already marked today
    if (checkTodayMarked()) {
        showAlreadyMarked();
        return;
    }

    // Load attendance history
    await syncAndLoadHistory();

    // Event listeners
    document.getElementById('startBtn')?.addEventListener('click', startCheckin);
    document.getElementById('captureBtn')?.addEventListener('click', capturePhoto);
    document.getElementById('retakeBtn')?.addEventListener('click', retakePhoto);
    document.getElementById('confirmBtn')?.addEventListener('click', confirmCheckin);
});

function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet'; // Tablets are allowed (they have GPS)
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
}

// Calculate distance between two coordinates (Haversine formula)
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of Earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Check if location is within any allowed office geofence
function isWithinOfficeLocation(latitude, longitude) {
    for (const office of OFFICE_LOCATIONS) {
        const distance = getDistanceFromLatLonInMeters(
            latitude, longitude,
            office.latitude, office.longitude
        );
        if (distance <= office.radiusMeters) {
            return { allowed: true, office: office.name, distance: Math.round(distance) };
        }
    }
    // Find nearest office
    let nearestOffice = OFFICE_LOCATIONS[0];
    let minDistance = getDistanceFromLatLonInMeters(
        latitude, longitude,
        nearestOffice.latitude, nearestOffice.longitude
    );
    for (const office of OFFICE_LOCATIONS) {
        const distance = getDistanceFromLatLonInMeters(
            latitude, longitude,
            office.latitude, office.longitude
        );
        if (distance < minDistance) {
            minDistance = distance;
            nearestOffice = office;
        }
    }
    return {
        allowed: false,
        office: nearestOffice.name,
        distance: Math.round(minDistance),
        required: nearestOffice.radiusMeters
    };
}

function checkTodayMarked() {
    const user = auth.getCurrentUser();
    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
    const today = new Date().toDateString();
    return attendance.find(a =>
        a.userId === user.id && new Date(a.timestamp).toDateString() === today
    );
}

function showAlreadyMarked() {
    const record = checkTodayMarked();
    document.getElementById('attendanceFlow').style.display = 'none';
    document.getElementById('alreadyMarked').style.display = 'block';
    document.getElementById('markedTime').textContent = 'Today at ' + formatTime(record.timestamp);

    document.getElementById('markedDetails').innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Time</span>
            <span class="detail-value">${formatTime(record.timestamp)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Location</span>
            <span class="detail-value">${record.location?.address || 'Location recorded'}</span>
        </div>
    `;

    syncAndLoadHistory();
}

async function startCheckin() {
    showStep(2);
    await startCamera();
}

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
            audio: false
        });
        document.getElementById('cameraPreview').srcObject = stream;
    } catch (error) {
        toast.error('Camera access denied. Please allow camera access to mark attendance.');
        showStep(1);
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

function capturePhoto() {
    const video = document.getElementById('cameraPreview');
    const canvas = document.getElementById('photoCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror the image
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    // Add timestamp watermark
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.fillStyle = 'white';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(new Date().toLocaleString('en-IN'), 10, canvas.height - 15);

    capturedPhotoData = canvas.toDataURL('image/jpeg', APP_CONFIG.attendance.photoQuality);

    document.getElementById('capturedPhoto').src = capturedPhotoData;
    stopCamera();
    showStep(3);

    // Get location
    getLocation();
}

function retakePhoto() {
    capturedPhotoData = null;
    showStep(2);
    startCamera();
}

async function getLocation() {
    const locationInfo = document.getElementById('locationInfo');
    document.getElementById('confirmBtn').disabled = true;

    locationInfo.innerHTML = `
        <div class="location-loading">
            <div class="loading-spinner"></div>
            <span>Getting precise location...</span>
        </div>
    `;

    try {
        // Try to get high accuracy location with multiple attempts
        let bestPosition = null;
        let attempts = 0;
        const maxAttempts = 3;

        const getPosition = () => new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            });
        });

        // Try multiple times to get best accuracy
        while (attempts < maxAttempts) {
            try {
                const position = await getPosition();
                if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
                    bestPosition = position;
                }
                // If accuracy is good enough (under 50 meters), stop trying
                if (position.coords.accuracy < 50) {
                    break;
                }
                attempts++;
                if (attempts < maxAttempts) {
                    locationInfo.innerHTML = `
                        <div class="location-loading">
                            <div class="loading-spinner"></div>
                            <span>Improving accuracy... (attempt ${attempts + 1}/${maxAttempts})</span>
                        </div>
                    `;
                    await new Promise(r => setTimeout(r, 1000));
                }
            } catch (e) {
                attempts++;
                if (attempts >= maxAttempts && !bestPosition) {
                    throw e;
                }
            }
        }

        if (!bestPosition) {
            throw new Error('Could not get location');
        }

        locationData = {
            latitude: bestPosition.coords.latitude,
            longitude: bestPosition.coords.longitude,
            accuracy: Math.round(bestPosition.coords.accuracy),
            altitude: bestPosition.coords.altitude,
            altitudeAccuracy: bestPosition.coords.altitudeAccuracy,
            heading: bestPosition.coords.heading,
            speed: bestPosition.coords.speed,
            timestamp: bestPosition.timestamp
        };

        // Get detailed address using OpenStreetMap Nominatim
        let address = 'Location captured';
        let fullAddress = '';
        let city = '';
        let state = '';
        let country = '';

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${locationData.latitude}&lon=${locationData.longitude}&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'en'
                    }
                }
            );
            const data = await response.json();

            if (data.address) {
                const addr = data.address;
                // Build address components
                const streetParts = [
                    addr.house_number,
                    addr.road || addr.street,
                    addr.neighbourhood || addr.suburb
                ].filter(Boolean);

                city = addr.city || addr.town || addr.village || addr.municipality || '';
                state = addr.state || addr.province || '';
                country = addr.country || '';

                address = streetParts.length > 0 ? streetParts.join(', ') : (city || 'Location captured');
                fullAddress = data.display_name || '';
            } else {
                address = data.display_name?.split(',').slice(0, 3).join(', ') || 'Location captured';
            }

            locationData.address = address;
            locationData.fullAddress = fullAddress;
            locationData.city = city;
            locationData.state = state;
            locationData.country = country;
        } catch (e) {
            console.log('Geocoding failed, using coordinates only');
            locationData.address = `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`;
        }

        // Display accurate location info
        const isIPBased = locationData.accuracy > 1000; // IP-based location is usually > 1km accuracy
        const accuracyClass = locationData.accuracy < 20 ? 'excellent' :
            locationData.accuracy < 50 ? 'good' :
                locationData.accuracy < 100 ? 'fair' :
                    locationData.accuracy < 1000 ? 'poor' : 'ip-based';

        const accuracyLabel = locationData.accuracy < 20 ? 'Excellent (GPS)' :
            locationData.accuracy < 50 ? 'Good (GPS)' :
                locationData.accuracy < 100 ? 'Fair' :
                    locationData.accuracy < 1000 ? 'Low Accuracy' : 'IP-Based (Not Precise)';

        // Format accuracy for display
        const accuracyDisplay = locationData.accuracy >= 1000
            ? `±${(locationData.accuracy / 1000).toFixed(1)}km`
            : `±${locationData.accuracy}m`;

        // Check geofence if required
        let geofenceResult = { allowed: true };
        if (REQUIRE_OFFICE_LOCATION) {
            geofenceResult = isWithinOfficeLocation(locationData.latitude, locationData.longitude);
            locationData.geofence = geofenceResult;
        }

        let locationHTML = `
            <div class="location-success ${!geofenceResult.allowed ? 'location-blocked' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                <div class="location-details">
                    <div class="location-address">${address}</div>
                    ${city && state ? `<div class="location-city">${city}, ${state}</div>` : ''}
                    <div class="location-coords">
                        📍 ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}
                    </div>
                    <div class="location-accuracy ${accuracyClass}">
                        ⚡ Accuracy: ${accuracyDisplay} (${accuracyLabel})
                    </div>
                </div>
            </div>
        `;

        // Check if user is outside allowed geofence
        if (REQUIRE_OFFICE_LOCATION && !geofenceResult.allowed) {
            const distanceKm = (geofenceResult.distance / 1000).toFixed(1);
            locationHTML += `
                <div class="geofence-warning">
                    <div class="warning-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>Not at Office Location</span>
                    </div>
                    <p>You are <strong>${distanceKm}km away</strong> from ${geofenceResult.office}.</p>
                    <p>You must be within <strong>${geofenceResult.required}m</strong> of the office to mark attendance.</p>
                    <div class="warning-actions">
                        <button class="btn-secondary btn-sm" onclick="getLocation()">
                            🔄 Refresh Location
                        </button>
                    </div>
                </div>
            `;
            document.getElementById('confirmBtn').disabled = true;
        } else if (REQUIRE_OFFICE_LOCATION && geofenceResult.allowed) {
            // User is within geofence
            locationHTML += `
                <div class="geofence-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>✓ At ${geofenceResult.office} (${geofenceResult.distance}m from office)</span>
                </div>
            `;
            document.getElementById('confirmBtn').disabled = false;
        } else {
            // No geofencing required
            document.getElementById('confirmBtn').disabled = false;
        }

        locationInfo.innerHTML = locationHTML;

    } catch (error) {
        console.error('Location error:', error);
        let errorMessage = 'Location access denied';

        if (error.code === 1) {
            errorMessage = 'Please allow location access to mark attendance';
        } else if (error.code === 2) {
            errorMessage = 'Location unavailable. Please check your GPS/location settings';
        } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please try again';
        }

        locationInfo.innerHTML = `
            <div class="location-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div>
                    <p style="margin-bottom: 8px;">${errorMessage}</p>
                    <button class="btn-secondary btn-sm" onclick="getLocation()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }
}

async function confirmCheckin() {
    const user = auth.getCurrentUser();
    const btn = document.getElementById('confirmBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;"></div> Saving...';

    const attendanceRecord = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userField: user.field,
        photo: capturedPhotoData,
        location: locationData,
        timestamp: new Date().toISOString(),
        device: navigator.userAgent
    };

    try {
        // Initialize Supabase if available
        if (typeof initSupabase === 'function') initSupabase();

        // 1. Save to Supabase (this also handles local storage internally via addAttendanceToDB)
        if (typeof addAttendanceToDB === 'function') {
            await addAttendanceToDB({
                ...attendanceRecord,
                date: new Date().toISOString().split('T')[0]
            });
        } else {
            // Manual fallback if supabase.js is missing
            const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
            attendance.unshift(attendanceRecord);
            localStorage.setItem('gf_attendance', JSON.stringify(attendance.slice(0, 50)));
        }

        toast.success('Attendance marked successfully!');
        showAlreadyMarked();
    } catch (error) {
        console.error('Save Error:', error);
        toast.error('Failed to save attendance. Please try again.');
        btn.disabled = false;
        btn.innerHTML = 'Confirm Check-in';
    }
}

// Added sync function for standalone page
async function syncAndLoadHistory() {
    if (typeof initSupabase === 'function') {
        initSupabase();
        if (typeof getAttendanceFromDB === 'function') {
            const user = auth.getCurrentUser();
            const attendance = await getAttendanceFromDB({ userId: user.id });
            if (attendance) {
                const mapped = attendance.map(a => ({
                    ...a,
                    userId: a.user_id,
                    userName: a.user_name,
                    timestamp: a.created_at || new Date(a.date).toISOString(),
                    photo: a.photo_url || a.photo
                }));
                localStorage.setItem('gf_attendance', JSON.stringify(mapped));
            }
        }
    }
    loadAttendanceHistory();
}

function showStep(stepNum) {
    document.querySelectorAll('.flow-step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step${stepNum}`).classList.add('active');
}

function loadAttendanceHistory() {
    const user = auth.getCurrentUser();
    const attendance = JSON.parse(localStorage.getItem('gf_attendance') || '[]');
    const userAttendance = attendance.filter(a => a.userId === user.id).slice(0, 7);

    const historyList = document.getElementById('historyList');

    if (userAttendance.length === 0) {
        historyList.innerHTML = '<div class="no-history">No attendance records yet</div>';
        return;
    }

    historyList.innerHTML = userAttendance.map(record => `
        <div class="history-item">
            <img src="${record.photo || 'data:image/svg+xml,...'}" alt="Photo" class="history-photo">
            <div class="history-info">
                <div class="history-date">${formatDate(record.timestamp)}</div>
                <div class="history-time">${formatTime(record.timestamp)}</div>
            </div>
            <div class="history-status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </div>
        </div>
    `).join('');
}
