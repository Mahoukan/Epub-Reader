const fileInput = document.getElementById('file-input');
const viewer = document.getElementById('viewer');
let book, rendition;

fileInput.addEventListener('change', function() {
  const file = fileInput.files[0];
  if (!file) return;

  const bookUrl = URL.createObjectURL(file);
  book = ePub(bookUrl);

  rendition = book.renderTo("viewer", {
    width: "100%",
    height: "100%"
  });

  rendition.display();

  // Optional: handle chapter navigation
  book.loaded.navigation.then(function(toc) {
    console.log("Table of Contents", toc);
  });
});
