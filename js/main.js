const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
let editingBookId = null; // Menyimpan ID buku yang sedang diedit

document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("bookForm");
  const element = document.querySelector("#bookFormSubmit span");
  const isComplete = document.getElementById("bookFormIsComplete");

  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (editingBookId) {
      updateBook();
    } else {
      addBook();
    }
  });

  isComplete.addEventListener("click", () => {
    element.innerText = isComplete.checked
      ? "Selesai di baca"
      : "Belum selesai dibaca";
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function generateUniqueId() {
  return `_${Math.random().toString(36).slice(2, 9)}`;
}

function addBook() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = parseInt(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const bookObject = {
    id: generateUniqueId(),
    title,
    author,
    year,
    isComplete,
  };
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  resetForm();
}

function updateBook() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = parseInt(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const book = books.find((b) => b.id === editingBookId);
  if (book) {
    book.title = title;
    book.author = author;
    book.year = year;
    book.isComplete = isComplete;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    resetForm();
  }
}

document.addEventListener(RENDER_EVENT, () => {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");
  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  books.forEach((book) => {
    const bookElement = makeBook(book);
    book.isComplete
      ? completeBookList.append(bookElement)
      : incompleteBookList.append(bookElement);
  });
});

function makeBook(book) {
  const bookTitle = document.createElement("h3");
  bookTitle.setAttribute("data-testid", "bookItemTitle");
  bookTitle.innerText = book.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.setAttribute("data-testid", "bookItemAuthor");
  bookAuthor.innerText = `Penulis: ${book.author}`;

  const bookYear = document.createElement("p");
  bookYear.setAttribute("data-testid", "bookItemYear");
  bookYear.innerText = `Tahun: ${book.year}`;

  const statusButton = createButton(
    "status",
    book.isComplete ? "Belum selesai di Baca" : "Selesai dibaca",
    () => {
      toggleBookComplete(book.id);
    }
  );
  statusButton.setAttribute("data-testid", "bookItemIsStatusButton");

  const deleteButton = createButton("delete", "Hapus buku", () => {
    const modal = document.getElementById("alert-modal");
    modal.style.display = "block";

    document.querySelector(".titleBookDelete").innerText = `${book.title}`;

    const close = document.querySelector(".modal .modal-content .close");
    const removeYes = document.querySelector(
      ".modal .modal-content .action #yes"
    );
    const removeNo = document.querySelector(
      ".modal .modal-content .action #no"
    );

    close.onclick = () => {
      modal.style.display = "none";
    };

    removeYes.onclick = () => {
      modal.style.display = "none";
      removeBook(book.id);
    };

    removeNo.onclick = () => {
      modal.style.display = "none";
    };
  });
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");

  const editButton = createButton("edit", "Edit buku", () => {
    startEditing(book);
  });
  editButton.setAttribute("data-testid", "bookItemEditButton");

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action");
  actionContainer.append(statusButton, deleteButton, editButton);

  const bookItem = document.createElement("article");
  bookItem.classList.add("book_item");
  bookItem.setAttribute("id", `book-${book.id}`);
  bookItem.append(bookTitle, bookAuthor, bookYear, actionContainer);

  return bookItem;
}

function startEditing(book) {
  editingBookId = book.id;
  document.getElementById("bookFormTitle").value = book.title;
  document.getElementById("bookFormAuthor").value = book.author;
  document.getElementById("bookFormYear").value = book.year;
  document.getElementById("bookFormIsComplete").checked = book.isComplete;
  document.querySelector("#bookFormSubmit span").innerText = `Simpan perubahan ${book.title}`;
}

function resetForm() {
  editingBookId = null;
  document.getElementById("bookForm").reset();

  const isComplete = document.getElementById("bookFormIsComplete").checked;
  document.querySelector("#bookFormSubmit span").innerText = isComplete
    ? "Selesai di baca"
    : "Belum selesai dibaca";
}

function createButton(buttonClass, text, eventListener) {
  const button = document.createElement("button");
  button.classList.add(buttonClass);
  button.innerText = text;
  button.addEventListener("click", eventListener);
  return button;
}

function toggleBookComplete(bookId) {
  const book = books.find((b) => b.id === bookId);
  if (book) {
    book.isComplete = !book.isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function removeBook(bookId) {
  const bookIndex = books.findIndex((b) => b.id === bookId);
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

document.getElementById("searchBook").addEventListener("submit", (event) => {
  event.preventDefault();
  const searchQuery = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  document.querySelectorAll(".book_item").forEach((book) => {
    const title = book.querySelector("h3").innerText.toLowerCase();
    book.style.display = title.includes(searchQuery) ? "block" : "none";
  });
});

function isStorageExist() {
  return typeof Storage !== "undefined";
}

function saveData() {
  if (isStorageExist()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (data) {
    books.push(...data);
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}
