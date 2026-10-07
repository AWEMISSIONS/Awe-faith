(() => {
  const script = document.currentScript;
  const appId = script?.dataset.appId || "awe-faith";
  const endpoint = "https://ueethdfucapmdwuananu.supabase.co/functions/v1/awe-analytics";
  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZXRoZGZ1Y2FwbWR3dWFuYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMDU1NjYsImV4cCI6MjEwNjY4MTU2Nn0.CgKfrE5ADlSJiH6m9Ra81fraeel2NHVDSBunamAPbqQ";
  const idKey = "awe.analytics." + appId + ".device";
  const optOutKey = "awe.analytics." + appId + ".off";
  const sessionKey = "awe.analytics." + appId + ".open";
  const appIds = new Set(["awe-faith", "365-one-year-in-word", "bible-journey", "church-challenge", "kingdom-builders", "hidden-in-my-heart", "bible-verse-sprint"]);
  if (!appIds.has(appId)) return;

  const optedOut = () => {
    try { return localStorage.getItem(optOutKey) === "true"; } catch { return true; }
  };
  const deviceId = (create = true) => {
    try {
      let id = localStorage.getItem(idKey);
      if (!id && create && !optedOut()) {
        id = crypto.randomUUID();
        localStorage.setItem(idKey, id);
      }
      return id;
    } catch { return null; }
  };
  async function send(payload) {
    try {
      return await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          "apikey": anonKey,
          "Authorization": "Bearer " + anonKey
        },
        body: JSON.stringify({ app_id: appId, device_id: deviceId(false), ...payload })
      });
    } catch { return null; }
  }
  function track(eventName, resourceId) {
    if (optedOut() || !deviceId()) return Promise.resolve(null);
    const payload = { event_name: eventName };
    if (resourceId) payload.resource_id = resourceId;
    return send(payload);
  }
  window.AWEAnalytics = { track };
  document.addEventListener("click", event => {
    const link = event.target.closest?.("a[data-analytics-resource]");
    if (link) track("resource_open", link.dataset.analyticsResource);
  });

  const toggle = document.getElementById("analyticsToggle");
  const reset = document.getElementById("analyticsReset");
  const status = document.getElementById("analyticsStatus");
  const refreshControls = () => {
    if (!toggle || !status) return;
    toggle.textContent = optedOut() ? "Turn on analytics" : "Turn off analytics";
    status.textContent = optedOut()
      ? "Usage analytics are off for this browser and this app."
      : "Usage analytics are on for this browser.";
  };
  toggle?.addEventListener("click", () => {
    try {
      if (optedOut()) {
        localStorage.removeItem(optOutKey);
        try { sessionStorage.removeItem(sessionKey); } catch {}
        refreshControls();
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, "1");
          track("app_open");
        }
      } else {
        localStorage.setItem(optOutKey, "true");
        refreshControls();
      }
    } catch { if (status) status.textContent = "This browser could not save the analytics setting."; }
  });
  reset?.addEventListener("click", async () => {
    const id = deviceId(false);
    if (!id) {
      if (status) status.textContent = "There is no saved ID for this app in this browser.";
      return;
    }
    if (!window.confirm("Remove this app’s saved analytics ID and its event records from this browser?")) return;
    if (status) status.textContent = "Removing this app’s analytics history…";
    const response = await send({ action: "erase" });
    if (!response?.ok) {
      if (status) status.textContent = "Could not reset while offline. Please try again when connected.";
      return;
    }
    try {
      localStorage.removeItem(idKey);
      try { sessionStorage.removeItem(sessionKey); } catch {}
      if (status) status.textContent = "This app’s ID and event records were removed. The next visit will count as new.";
    } catch {
      if (status) status.textContent = "The server records were removed, but this browser could not clear its saved ID.";
    }
  });

  refreshControls();
  if (!optedOut() && deviceId()) {
    let alreadySent = false;
    try {
      alreadySent = sessionStorage.getItem(sessionKey) === "1";
      if (!alreadySent) sessionStorage.setItem(sessionKey, "1");
    } catch {}
    if (!alreadySent) track("app_open");
  }
})();