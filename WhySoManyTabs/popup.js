const powerBtn = document.getElementById("powerBtn");
const powerText = document.getElementById("powerText");
const options = document.getElementById("options");

const limitSelect = document.getElementById("limit");
const customRow = document.getElementById("customLimitRow");
const customInput = document.getElementById("customLimit");
const autoCloseToggle = document.getElementById("autoClose");
const notifyToggle = document.getElementById("notify");
const tabCountEl = document.getElementById("tabCount");

/* INIT */
chrome.storage.sync.get(
  ["enabled", "tabLimit", "autoClose", "notify"],
  (data) => {

    const enabled = data.enabled ?? true;
    setPower(enabled);

    autoCloseToggle.checked = data.autoClose ?? false;
    notifyToggle.checked = data.notify ?? true;

    const limit = data.tabLimit || 10;
    if ([5,10,15,20].includes(limit)) {
      limitSelect.value = limit;
    } else {
      limitSelect.value = "custom";
      customRow.classList.remove("hidden");
      customInput.value = limit;
    }

    updateTabCount();
  }
);

/* POWER BUTTON */
powerBtn.addEventListener("click", () => {
  chrome.storage.sync.get(["enabled"], (res) => {
    const newState = !res.enabled;
    chrome.storage.sync.set({ enabled: newState });
    setPower(newState);
  });
});

function setPower(on) {
  powerBtn.classList.toggle("on", on);
  powerBtn.classList.toggle("off", !on);
  powerText.textContent = on ? "ON" : "OFF";
  options.style.display = on ? "block" : "none";
}

/* LIMIT */
limitSelect.addEventListener("change", () => {
  if (limitSelect.value === "custom") {
    customRow.classList.remove("hidden");
  } else {
    customRow.classList.add("hidden");
    chrome.storage.sync.set({ tabLimit: Number(limitSelect.value) });
    updateTabCount();
  }
});

customInput.addEventListener("change", () => {
  chrome.storage.sync.set({ tabLimit: Number(customInput.value) });
  updateTabCount();
});

/* TOGGLES */
autoCloseToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ autoClose: autoCloseToggle.checked });
});

notifyToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ notify: notifyToggle.checked });
});

/* LIVE COUNT */
function updateTabCount() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    chrome.storage.sync.get(["tabLimit"], (data) => {
      const limit = data.tabLimit || 10;
      tabCountEl.textContent = `${tabs.length} / ${limit}`;
    });
  });
}

chrome.tabs.onCreated.addListener(updateTabCount);
chrome.tabs.onRemoved.addListener(updateTabCount);
