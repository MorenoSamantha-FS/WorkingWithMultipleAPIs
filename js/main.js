"use strict";

// Import functions from our other JavaScript modules
import { getBookData } from "./api.js";
import { saveBook, getSavedBook } from "./storage.js";

// Immediately Invoked Function Expression
(() => {
  // Select existing HTML elements
  const bookResults = document.querySelector("#book-results");
  const authorResults = document.querySelector("#author-results");
  const statusMessage = document.querySelector("#status-message");
  const searchForm = document.querySelector("#book-form");
  const searchInput = document.querySelector("#book-search");

  // Tracks the most recent search
  let searchCount = 0;

  // =====================================
  // DISPLAY BOOK INFORMATION
  // =====================================

  const displayBook = (book) => {
    // Create the main book card
    const bookCard = document.createElement("article");
    bookCard.classList.add("book-card");

    // Create a container for book text
    const bookInfo = document.createElement("div");
    bookInfo.classList.add("book-info");

    // Create book title
    const title = document.createElement("h3");
    title.textContent = book.title;

    // Create author information
    const author = document.createElement("p");
    author.textContent = `By ${book.author_name.join(", ")}`;

    // Create publication year
    const year = document.createElement("p");
    year.textContent = book.first_publish_year
      ? `First published: ${book.first_publish_year}`
      : "Publication year unavailable";

    // Group the text elements together
    bookInfo.appendChild(title);
    bookInfo.appendChild(author);
    bookInfo.appendChild(year);

    // Create book cover if available
    if (book.cover_i) {
      const cover = document.createElement("img");

      cover.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;

      cover.alt = `Cover of ${book.title}`;

      bookCard.appendChild(cover);
    }

    // Add text container to card
    bookCard.appendChild(bookInfo);

    // Display card on webpage
    bookResults.appendChild(bookCard);
  };

  // =====================================
  // DISPLAY AUTHOR INFORMATION
  // =====================================

  const displayAuthor = (authorData) => {
    // Create the author card
    const authorCard = document.createElement("article");
    authorCard.classList.add("author-card");

    // Create a container for author text
    const authorInfo = document.createElement("div");
    authorInfo.classList.add("author-info");

    // Create author name
    const name = document.createElement("h3");
    name.textContent = authorData.title;

    // Create author biography
    const biography = document.createElement("p");

    biography.textContent = authorData.extract || "No biography available.";

    // Group author text together
    authorInfo.appendChild(name);
    authorInfo.appendChild(biography);

    // Create portrait if available
    if (authorData.thumbnail?.source) {
      const portrait = document.createElement("img");

      portrait.src = authorData.thumbnail.source;
      portrait.alt = `Portrait of ${authorData.title}`;

      authorCard.appendChild(portrait);
    }

    // Add text container to card
    authorCard.appendChild(authorInfo);

    // Display card on webpage
    authorResults.appendChild(authorCard);
  };

  // =====================================
  // LOAD BOOK DATA
  // =====================================

  const loadBook = (title) => {
    // Give each search a unique number
    const currentSearch = ++searchCount;

    // Show loading message
    statusMessage.textContent = "Searching for your book...";

    // Clear previous results
    bookResults.replaceChildren();
    authorResults.replaceChildren();

    // Check localStorage first
    const savedData = getSavedBook(title);

    if (savedData) {
      displayBook(savedData.book);
      displayAuthor(savedData.author);

      statusMessage.textContent = "Book found! (Saved result)";

      // Stop here to avoid unnecessary API requests
      return;
    }

    // Fetch information from both APIs
    getBookData(title)
      .then((data) => {
        // Ignore outdated search results
        if (currentSearch !== searchCount) {
          return;
        }

        // Display both API responses
        displayBook(data.book);
        displayAuthor(data.author);

        // Save successful results
        saveBook(title, data);

        statusMessage.textContent = "Book found!";
      })
      .catch((error) => {
        // Ignore errors from outdated searches
        if (currentSearch !== searchCount) {
          return;
        }

        console.error("Book search failed:", error);

        // Display a helpful error message
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

  // =====================================
  // SEARCH FORM EVENT LISTENER
  // =====================================

  searchForm.addEventListener("submit", (event) => {
    // Prevent the form from reloading the page
    event.preventDefault();

    // Get the user's search text
    const searchTitle = searchInput.value.trim();

    // Search only if the input isn't empty
    if (searchTitle) {
      loadBook(searchTitle);
    }
  });

  // =====================================
  // INITIAL PAGE LOAD
  // =====================================

  // Automatically display a featured book
  loadBook("Frankenstein");
})();
