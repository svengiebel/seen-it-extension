const KEY = "immo_seen_ids";
const extensionStorage =
  globalThis.browser?.storage?.local ?? globalThis.chrome?.storage?.local;

function loadLegacySeenIds() {
  const data = localStorage.getItem(KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function loadSeenIds() {
  if (!extensionStorage) return loadLegacySeenIds();

  const data = await extensionStorage.get(KEY);
  if (Array.isArray(data?.[KEY])) return data[KEY];

  // Migrate legacy values written into website localStorage.
  const legacyIds = loadLegacySeenIds();
  if (legacyIds.length > 0) {
    await extensionStorage.set({ [KEY]: legacyIds });
    localStorage.removeItem(KEY);
  }
  return legacyIds;
}

async function saveSeenIds(ids) {
  if (extensionStorage) {
    await extensionStorage.set({ [KEY]: ids });
    return;
  }
  localStorage.setItem(KEY, JSON.stringify(ids));
}

async function unmarkAsSeen(listing) {
  const id = listing.getAttribute("data-obid");
  listing.classList.remove("immo-gesehen");
  const overlay = listing.querySelector(".immo-gesehen-overlay");
  if (overlay) {
    overlay.remove();
  }
  const ids = await loadSeenIds();
  const idsJson = ids.filter((d) => d !== id);
  await saveSeenIds(idsJson);
  await addButtonForListing(listing, idsJson);
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

async function addButtonForListing(listing, seenIds) {
  const id = listing.getAttribute("data-obid");
  if (!id) return;

  // Verhindere Doppel-Buttons
  if (listing.querySelector(".immo-gesehen-btn")) return;

  // Button erstellen
  const btn = document.createElement("button");
  btn.className = "immo-gesehen-btn";
  btn.textContent = "Als gesehen markieren";
  btn.onclick = async function (e) {
    e.stopPropagation();
    e.preventDefault();
    const ids = await loadSeenIds();
    if (!ids.includes(id)) {
      ids.push(id);
      await saveSeenIds(ids);
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

async function insertSeenButtons() {
  const listings = document.querySelectorAll(".listing-card[data-obid]");
  const seenIds = await loadSeenIds();

  for (const listing of listings) {
    await addButtonForListing(listing, seenIds);
  }
}

// Bei DOM-Änderungen reagieren (z.B. nachladen der Listings)
function observeListings() {
  const main = document.querySelector("main");
  if (!main) return;
  const observer = new MutationObserver(() => {
    void insertSeenButtons();
  });
  observer.observe(main, { childList: true, subtree: true });
}

function triggerButtonsIfUrlChanged() {
  // Hier ggf. prüfen, ob der pagenumber-Parameter sich geändert hat.
  setTimeout(() => {
    void insertSeenButtons();
  }, 500);
}

// EventListener ergänzen
window.addEventListener("popstate", triggerButtonsIfUrlChanged);

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    void insertSeenButtons();
    observeListings();
  }, 1000);
});
window.addEventListener("load", () => {
  setTimeout(() => {
    void insertSeenButtons();
    let oldHref = document.location.href;
    setInterval(() => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href;
        setTimeout(() => {
          void insertSeenButtons();
        }, 1500);
      }
    }, 500);
  }, 1000);
});
