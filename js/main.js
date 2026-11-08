"use strict";

import { getBookData } from "./api.js";

(() => {
  const bookResults = document.querySelector("#book-results");
  const authorResults = document.querySelector("#author-results");
  const statusMessage = document.querySelector("#status-message");

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

    getBookData(title)
      .then((data) => {
        // Clear previous results
        bookResults.replaceChildren();
        authorResults.replaceChildren();

        displayBook(data.book);
        displayAuthor(data.author);

        statusMessage.textContent = "Book found!";
      })
      .catch((error) => {
        statusMessage.textContent = `Unable to load book information: ${error.message}`;
      });
  };

  // Load a featured book automatically
  loadBook("Frankenstein");
})();
