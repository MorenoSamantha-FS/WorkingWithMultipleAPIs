"use strict";

import { getBookData } from "./api.js";
import { saveBook, getSavedBook } from "./storage.js";

(() => {
  const bookResults = document.querySelector("#book-results");
  const authorResults = document.querySelector("#author-results");
  const statusMessage = document.querySelector("#status-message");
  const searchForm = document.querySelector("#book-form");
  const searchInput = document.querySelector("#book-search");

  // Create and display the book information
  const displayBook = (book) => {
    const bookCard = document.createElement("article");
    bookCard.classList.add("book-card");

    const title = document.createElement("h3");
    title.textContent = book.title;

    const author = document.createElement("p");
    author.textContent = `By ${book.author_name.join(", ")}`;

    const year = document.createElement("p");
    year.textContent = book.first_publish_year
      ? `First published: ${book.first_publish_year}`
      : "Publication year unavailable";

    bookCard.appendChild(title);
    bookCard.appendChild(author);
    bookCard.appendChild(year);

    if (book.cover_i) {
      const cover = document.createElement("img");
      cover.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
      cover.alt = `Cover of ${book.title}`;

      bookCard.prepend(cover);
    }

    bookResults.appendChild(bookCard);
  };

  // Create and display the author information
  const displayAuthor = (authorData) => {
    const authorCard = document.createElement("article");
    authorCard.classList.add("author-card");

    const name = document.createElement("h3");
    name.textContent = authorData.title;

    const biography = document.createElement("p");
    biography.textContent = authorData.extract || "No biography available.";

    authorCard.appendChild(name);
    authorCard.appendChild(biography);

    if (authorData.thumbnail?.source) {
      const portrait = document.createElement("img");
      portrait.src = authorData.thumbnail.source;
      portrait.alt = `Portrait of ${authorData.title}`;

      authorCard.prepend(portrait);
    }

    authorResults.appendChild(authorCard);
  };

  // Fetch the data and display it

  const loadBook = (title) => {
    statusMessage.textContent = "Searching for your book...";

    bookResults.replaceChildren();
    authorResults.replaceChildren();

    // Check localStorage first
    const savedData = getSavedBook(title);

    if (savedData) {
      displayBook(savedData.book);
      displayAuthor(savedData.author);

      statusMessage.textContent = "Book found! (Saved result)";
      return;
    }

    // Fetch from both APIs if no saved result exists
    getBookData(title)
      .then((data) => {
        displayBook(data.book);
        displayAuthor(data.author);

        // Save the successful result
        saveBook(title, data);

        statusMessage.textContent = "Book found!";
      })
      .catch((error) => {
        console.error("Book search failed:", error);

        if (error.message === "No book found with that title.") {
          statusMessage.textContent =
            "No books found. Please try another title.";
        } else if (error.message.startsWith("Wikipedia error: 404")) {
          statusMessage.textContent =
            "We found a book, but could not find information about its author. Try another title.";
        } else {
          statusMessage.textContent = "Something went wrong. Please try again.";
        }
      });
  };

  // Handle form submission
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchTitle = searchInput.value.trim();

    if (searchTitle) {
      loadBook(searchTitle);
    }
  });

  // Load a featured book automatically
  loadBook("Frankenstein");
})();
