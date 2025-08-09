var results = {};
var legitimatePercents = {};
var isPhish = {};

// 🔐 Google Safe Browsing API Key
const GOOGLE_SAFE_BROWSING_API_KEY = 'AIzaSyAlxAJ6vMCVo7N72Cw0CFXQvarpOrYAGxE';

function fetchLive(callback) {
  fetch('https://raw.githubusercontent.com/picopalette/phishing-detection-plugin/master/static/classifier.json', {
    method: 'GET'
  })
    .then(function (response) {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then(function (data) {
      chrome.storage.local.set({ cache: data, cacheTime: Date.now() }, function () {
        callback(data);
      });
    });
}

function fetchCLF(callback) {
  chrome.storage.local.get(['cache', 'cacheTime'], function (items) {
    if (items.cache && items.cacheTime) {
      return callback(items.cache);
    }
    fetchLive(callback);
  });
}

// 🔍 Google Safe Browsing API Check
function checkGoogleSafeBrowsing(url, callback) {
  const body = {
    client: {
      clientId: "phishtor-extension",
      clientVersion: "1.0.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "POTENTIALLY_HARMFUL_APPLICATION"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url: url }]
    }
  };

  fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`, {
    method: 'POST',
    body: JSON.stringify(body)
  })
    .then(response => response.json())
    .then(data => {
      if (data && data.matches && data.matches.length > 0) {
        callback(true); // flagged by Google
      } else {
        callback(false); // safe according to Google
      }
    })
    .catch(err => {
      console.error("Safe Browsing error:", err);
      callback(false); // fail-safe
    });
}

function classify(tabId, result) {
  let legitimateCount = 0;
  let suspiciousCount = 0;
  let phishingCount = 0;

  for (var key in result) {
    if (result[key] == "1") phishingCount++;
    else if (result[key] == "0") suspiciousCount++;
    else legitimateCount++;
  }

  legitimatePercents[tabId] = legitimateCount / (phishingCount + suspiciousCount + legitimateCount) * 100;

  // Get current tab's URL
  chrome.tabs.get(tabId, function (tab) {
    const currentUrl = tab.url;

    // 🛡️ Step 1: Check with Google Safe Browsing
    checkGoogleSafeBrowsing(currentUrl, function (isUnsafe) {
      if (isUnsafe) {
        isPhish[tabId] = true;
        chrome.storage.local.set({ results, legitimatePercents, isPhish });
        chrome.tabs.sendMessage(tabId, { action: "alert_user" });
      } else {
        // 🤖 Step 2: Use ML Classifier
        const X = [[]];
        for (let key in result) {
          X[0].push(parseInt(result[key]));
        }

        fetchCLF(function (clf) {
          const rf = random_forest(clf);
          const y = rf.predict(X);
          isPhish[tabId] = y[0][0] ? true : false;

          chrome.storage.local.set({ results, legitimatePercents, isPhish });

          if (isPhish[tabId]) {
            chrome.tabs.sendMessage(tabId, { action: "alert_user" });
          }
        });
      }
    });
  });
}

// 🔄 Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const tabId = sender.tab.id;
  results[tabId] = request;
  classify(tabId, request);
  sendResponse({ received: "result" });
});
