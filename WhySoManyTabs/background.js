const NOTIF_ID = "wsmt-live";

/* 32 GOOFY (BUT SAFE) MESSAGES */
const goofyMessages = [
  "Bro. Tabs. Why.",
  "This is a LOT of tabs.",
  "One tab opened… then chaos.",
  "You sure you need all these?",
  "Tabs are multiplying.",
  "This escalated quickly.",
  "Okay now it’s suspicious.",
  "Browser crying internally.",
  "Tabs said ‘bring friends’.",
  "Productivity left the chat.",
  "That’s… impressive.",
  "Tabs everywhere.",
  "This feels illegal.",
  "You opened ONE more again.",
  "Even Chrome is confused.",
  "Just one tab… right?",
  "Tabs said copy–paste.",
  "Minimalism failed.",
  "This was avoidable.",
  "Deep research or chaos?",
  "You lost count, didn’t you?",
  "Tabs doing mitosis.",
  "This is not normal.",
  "We talked about limits.",
  "Your RAM remembers this.",
  "This wasn’t the plan.",
  "You blinked. More tabs.",
  "This is how it starts.",
  "Focused? Not really.",
  "Tabs went brrr.",
  "We crossed the line.",
  "This got out of hand."
];

function randomMessage() {
  return goofyMessages[Math.floor(Math.random() * goofyMessages.length)];
}

function checkTabs(windowId) {
  if (!windowId || windowId < 0) return;

  chrome.windows.get(windowId, { populate: true }, (win) => {
    if (chrome.runtime.lastError || !win || win.type !== "normal") return;

    chrome.storage.sync.get(
      ["tabLimit", "enabled", "autoClose", "notify"],
      (data) => {
        if (data.enabled === false) {
          chrome.notifications.clear(NOTIF_ID);
          return;
        }

        const limit = data.tabLimit || 10;
        const tabs = win.tabs.filter(t => !t.pinned);

        if (tabs.length > limit) {
          const message =
            `${randomMessage()} (${tabs.length}/${limit})`;

          if (data.notify !== false) {
            chrome.notifications.update(
              NOTIF_ID,
              {
                type: "basic",
                iconUrl: "icon128.png",
                title: "WhySoManyTabs",
                message
              },
              (updated) => {
                if (!updated) {
                  chrome.notifications.create(NOTIF_ID, {
                    type: "basic",
                    iconUrl: "icon128.png",
                    title: "WhySoManyTabs",
                    message
                  });
                }
              }
            );
          }

          /* AUTO-KILL (SAFE) */
          if (data.autoClose) {
            const oldestTab = tabs[0];
            if (oldestTab) {
              chrome.tabs.remove(oldestTab.id);
            }
          }

        } else {
          chrome.notifications.clear(NOTIF_ID);
        }
      }
    );
  });
}

/* EVENTS */
chrome.tabs.onCreated.addListener(tab => checkTabs(tab.windowId));
chrome.tabs.onRemoved.addListener((_, info) => checkTabs(info.windowId));
chrome.windows.onRemoved.addListener(() => chrome.notifications.clear(NOTIF_ID));

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-wsmt") {
    chrome.storage.sync.get(["enabled"], (res) => {
      const newState = !res.enabled;
      chrome.storage.sync.set({ enabled: newState });
    });
  }
});
