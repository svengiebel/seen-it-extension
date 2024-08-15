const KEY = "immoscout_hidden_ids";
console.log("Popup script is running");
document.addEventListener("DOMContentLoaded", function () {
  console.log("dom loaded");
  document.getElementById("reset").addEventListener("click", function (e) {
    console.log("click");
    e.preventDefault();

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "RESET_LOCAL_STORAGE" },
        function (response) {
          // Process the localStorage data received from content script
          console.log("LocalStorage Data:", response);
          chrome.tabs.reload(activeTab.id, function () {
            console.log("Tab reloaded:", activeTab.url);
          });
        },
      );
    });
  });
});
