const fileInput = document.getElementById("file-input");
const tocElement = document.getElementById("toc");
let book, rendition;

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  book = ePub(url);

  rendition = book.renderTo("viewer", {
    width: "100%",
    height: "100%",
  });

  rendition.display();

  book.loaded.navigation.then(nav => {
    tocElement.innerHTML = "";
    nav.toc.forEach(chapter => {
      const li = document.createElement("li");
      li.textContent = chapter.label;
      li.addEventListener("click", () => {
        rendition.display(chapter.href);
      });
      tocElement.appendChild(li);
    });
  });
});
