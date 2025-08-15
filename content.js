const KEY = "immo_seen_ids";

function loadSeenIds() {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function saveSeenIds(ids) {
  localStorage.setItem("immo_seen_ids", JSON.stringify(ids));
}

function unmarkAsSeen(listing) {
  const id = listing.getAttribute("data-obid");
  listing.classList.remove("immo-gesehen");
  const overlay = listing.querySelector(".immo-gesehen-overlay");
  if (overlay) {
    overlay.remove(); // besser als removeChild, funktioniert immer!
  }
  const ids = localStorage.getItem(KEY);
  let idsJson = JSON.parse(ids);
  idsJson = idsJson.filter((d) => d !== id);
  saveSeenIds(idsJson);
  addButtonForListing(listing, idsJson);
}

function markAsSeen(listing) {
  listing.classList.add("immo-gesehen");
  let overlay = listing.querySelector(".immo-gesehen-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.onclick = function (e) {
      e.stopPropagation();
      e.preventDefault();
      unmarkAsSeen(listing);
    };
    overlay.className = "immo-gesehen-overlay";
    overlay.textContent = "GESEHEN";
    listing.appendChild(overlay);
  }
}

function addButtonForListing(listing, seenIds) {
  const id = listing.getAttribute("data-obid");
  if (!id) return;

  // Verhindere Doppel-Buttons
  if (listing.querySelector(".immo-gesehen-btn")) return;

  // Button erstellen
  const btn = document.createElement("button");
  btn.className = "immo-gesehen-btn";
  btn.textContent = "Als gesehen markieren";
  btn.onclick = function (e) {
    e.stopPropagation();
    e.preventDefault();
    let ids = loadSeenIds();
    if (!ids.includes(id)) {
      ids.push(id);
      saveSeenIds(ids);
    }
    markAsSeen(listing);
    btn.remove();
  };

  listing.style.position = "relative"; // Für Overlay & Button
  listing.appendChild(btn);

  // Schon gesehene markieren
  if (seenIds.includes(id)) {
    markAsSeen(listing);
    btn.remove();
  }
}

function insertSeenButtons() {
  const listings = document.querySelectorAll(".listing-card[data-obid]");
  const seenIds = loadSeenIds();

  listings.forEach((listing) => {
    addButtonForListing(listing, seenIds);
  });
}

// Bei DOM-Änderungen reagieren (z.B. nachladen der Listings)
function observeListings() {
  const main = document.querySelector("main");
  if (!main) return;
  const observer = new MutationObserver(insertSeenButtons);
  observer.observe(main, { childList: true, subtree: true });
}

function triggerButtonsIfUrlChanged() {
  // Hier ggf. prüfen, ob der pagenumber-Parameter sich geändert hat.
  setTimeout(insertSeenButtons, 500);
}

// Original-Methoden speichern
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

// Methoden überschreiben
history.pushState = function () {
  alert("test");
  originalPushState.apply(this, arguments);
  window.dispatchEvent(new Event("immo-url-changed"));
};
history.replaceState = function () {
  alert("test");
  originalReplaceState.apply(this, arguments);
  window.dispatchEvent(new Event("immo-url-changed"));
};

// EventListener ergänzen
window.addEventListener("immo-url-changed", triggerButtonsIfUrlChanged);
window.addEventListener("popstate", triggerButtonsIfUrlChanged);

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    insertSeenButtons();
    observeListings();
  }, 1000);
});
window.addEventListener("load", () => {
  setTimeout(() => {
    insertSeenButtons();
    let oldHref = document.location.href;
    setInterval(() => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href;
        setTimeout(() => {
          insertSeenButtons();
        }, 1500);
      }
    }, 500);
  }, 1000);
});
