var colors = {
    "-1": "#22c55e", // Safe - Green
    "0": "#facc15",  // Suspicious - Yellow
    "1": "#ef4444"   // Phishing - Red
};

const featureList = document.getElementById("features");
const riskLevel = document.getElementById("risk_level");
const siteMsg = document.getElementById("site_msg");

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.storage.local.get(['results', 'legitimatePercents', 'isPhish'], function (items) {
        const result = items.results[tabs[0].id];
        const isPhish = items.isPhish[tabs[0].id];
        let legitimatePercent = parseInt(items.legitimatePercents[tabs[0].id]);

        // Render feature tags with color
        if (result) {
            for (let key in result) {
                const tag = document.createElement("li");
                tag.textContent = key;
                tag.style.backgroundColor = colors[result[key]];
                featureList.appendChild(tag);
            }
        }

        // Handle NaN case
        if (isNaN(legitimatePercent)) {
            riskLevel.textContent = "No Risk Detected";
            riskLevel.style.color = "#22c55e";
            siteMsg.textContent = "✅ This website appears safe.";
            siteMsg.style.color = "#22c55e";
            return;
        }

        const phishingPercent = Math.max(0, 100 - legitimatePercent);

        // Set Risk Level display
        let levelText = '';
        let levelColor = '';

        if (phishingPercent < 30) {
            levelText = `${phishingPercent}% (Low)`;
            levelColor = "#22c55e"; // Green
        } else if (phishingPercent < 70) {
            levelText = `${phishingPercent}% (Moderate)`;
            levelColor = "#eab308"; // Yellow
        } else {
            levelText = `${phishingPercent}% (High)`;
            levelColor = "#dc2626"; // Red
        }

        // Update DOM
        riskLevel.textContent = levelText;
        riskLevel.style.color = levelColor;

        if (isPhish) {
            siteMsg.textContent = "⚠️ Warning! This site may be phishing.";
            siteMsg.style.color = "#dc2626";
        } else {
            siteMsg.textContent = "✅ This website is safe to use.";
            siteMsg.style.color = "#22c55e";
        }
    });
});
