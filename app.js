const fileInput = document.getElementById("file-input");
const tocElement = document.getElementById("toc");
const viewer = document.getElementById("viewer");
const toggleTheme = document.getElementById("toggle-theme");
const searchBox = document.getElementById("search-box");
const saveBookmark = document.getElementById("save-bookmark");
const gotoBookmark = document.getElementById("goto-bookmark");

let book, rendition, currentLocation;

// --- Load last theme preference ---
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

// --- Theme toggle ---
toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// --- Drag-and-drop support ---
document.addEventListener("dragover", (e) => e.preventDefault());
document.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith(".epub")) {
    loadBook(URL.createObjectURL(file));
  }
});

// --- File picker support ---
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file && file.name.endsWith(".epub")) {
    loadBook(URL.createObjectURL(file));
  }
});

// --- Load EPUB book ---
function loadBook(url) {
  book = ePub(url);
  rendition = book.renderTo("viewer", { width: "100%", height: "100%" });

  // Restore last location
  const lastCfi = localStorage.getItem("lastCfi");
  if (lastCfi) {
    rendition.display(lastCfi);
  } else {
    rendition.display();
  }

  // Track current location
  rendition.on("relocated", (location) => {
    currentLocation = location.start.cfi;
    localStorage.setItem("lastCfi", currentLocation);
  });

  // Load TOC
  book.loaded.navigation.then((nav) => {
    tocElement.innerHTML = "";
    nav.toc.forEach((chapter) => {
      const li = document.createElement("li");
      li.textContent = chapter.label;
      li.addEventListener("click", () => rendition.display(chapter.href));
      tocElement.appendChild(li);
    });
  });

  // Search
  searchBox.addEventListener("change", () => {
    const query = searchBox.value.toLowerCase();
    if (!query) return;

    book.loaded.spine.then((spineItems) => {
      spineItems.forEach(item => {
        item.load(book.load.bind(book)).then(() => {
          const text = item.document.body.textContent.toLowerCase();
          if (text.includes(query)) {
            rendition.display(item.href);
          }
          item.unload();
        });
      });
    });
  });
}

// --- Bookmarking ---
saveBookmark.addEventListener("click", () => {
  if (currentLocation) {
    localStorage.setItem("bookmarkCfi", currentLocation);
    alert("Bookmark saved.");
  }
});

gotoBookmark.addEventListener("click", () => {
  const bookmarkCfi = localStorage.getItem("bookmarkCfi");
  if (bookmarkCfi) {
    rendition.display(bookmarkCfi);
  } else {
    alert("No bookmark saved.");
  }
});
