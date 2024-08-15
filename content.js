const KEY = "immoscout_hidden_ids";
function handlerFunction(id) {
  let currentHiddenIds = localStorage.getItem(KEY);
  if (currentHiddenIds) {
    let hiddenIdsArray = JSON.parse(currentHiddenIds);
    localStorage.setItem(KEY, JSON.stringify([...hiddenIdsArray, id]));
  } else {
    localStorage.setItem(KEY, JSON.stringify([id]));
  }
  updateView();
}
function removeId(id) {
  let currentHiddenIds = localStorage.getItem(KEY);
  if (currentHiddenIds) {
    let hiddenIdsArray = JSON.parse(currentHiddenIds);
    localStorage.setItem(
      KEY,
      JSON.stringify(hiddenIdsArray.filter((i) => i !== id)),
    );
  }
}
function updateView() {
  let currentHiddenIds = localStorage.getItem(KEY);
  if (currentHiddenIds) {
    let hiddenIdsArray = JSON.parse(currentHiddenIds);
    Array.from(document.getElementsByClassName("result-list__listing")).map(
      (e) => {
        let attrId = e.getAttribute("data-id");
        if (hiddenIdsArray.includes(String(attrId))) {
          const gridElement = e.querySelector(".grid.grid-flex");
          const showButton = e.querySelector(".show-button");
          if (showButton) {
            return false;
          }
          gridElement.style.display = "none";
          e.style.maxHeight = "50px"; // Set max-height to 200 pixels
          e.style.overflowY = "auto"; // Enable vertical scrolling if content exceeds max-height
          e.style.backgroundColor = "rgba(252, 217, 162, 0.2)"; // Example of setting another style property
          e.style.overflow = "hidden";
          const data = e.getElementsByClassName(
            "result-list-entry__primary-criterion",
          );
          const location = e.getElementsByClassName(
            "result-list-entry__map-link",
          );
          gridElement.insertAdjacentHTML(
            "afterend",
            `
            <div id="replace-box-${attrId}" style="display: flex; justify-content: space-between; flex-direction: row; width: 100%; flex: 1;">
              <div>
              ${Array.from(data)
                .map((d) => d.firstChild.textContent)
                .join("  -  ")} | ${location.item(0).textContent}
              </div>
              <button class="link-text right show-button" hidden-id="${attrId}">
               Einblenden</button>
            </div>
            `,
          );
        }
      },
    );
    Array.from(document.getElementsByClassName("show-button")).map((e) => {
      e.addEventListener("click", function (b) {
        const id = e.getAttribute("hidden-id");
        removeId(id);
        let showElement = document.querySelector(`[data-id="${id}"]`);
        const gridElement = showElement.querySelector(".grid.grid-flex");
        gridElement.style.display = "flex";
        showElement.style.overflow = "auto";
        showElement.style.maxHeight = "none";
        showElement.style.backgroundColor = "white";
        document.querySelector(`#replace-box-${id}`).remove();
      });
    });
  } else {
    return;
  }
}
updateView();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "RESET_LOCAL_STORAGE") {
    // Get all items from setLocalStorage
    localStorage.setItem(KEY, "[]");
    // Send the data back to the popup
    sendResponse(true);
  }
  if (message.type === "URL_CHANGED") {
    Array.from(document.getElementsByClassName("result-list__listing")).map(
      (e) => {
        const id = e.getAttribute("data-id");
        const gridElement = e.querySelector(".grid.grid-flex");
        // Now you can work with gridElement
        // Create the button element
        const button = document.createElement("button");

        // Set the button text
        button.textContent = "Ausblenden";

        // Add the onclick event handler
        button.onclick = () => handlerFunction(id);
        button.classList.add("button", "button-small");

        // Append the button to the parent element
        gridElement.appendChild(button);
        return gridElement; // if you want to create an array of these elements
      },
    );
    updateView();
  }
});
