"use strict";
// Reusable function for retrieving book and author data
export const getBookData = (title) => {

  // Build the Open Library search URL
  const bookURL = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1&fields=key,title,author_name,first_publish_year,cover_i`;

  // First API request: Open Library
  return fetch(bookURL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Open Library error: ${response.status}`);
      }

      return response.json();
    })
    .then((bookData) => {
      const book = bookData.docs[0];

      if (!book) {
        throw new Error("No book found with that title.");
      }

      if (!book.author_name || book.author_name.length === 0) {
        throw new Error("No author information available.");
      }

      // Get the first author from the author array
      const author = book.author_name[0];

      // Build the Wikipedia URL using the author's name
      const wikiURL =
        "https://en.wikipedia.org/api/rest_v1/page/summary/" +
        encodeURIComponent(author.replaceAll(" ", "_"));

      // Second API request: Wikipedia
      return fetch(wikiURL)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Wikipedia error: ${response.status}`);
                    }

                    return response.json();
                })
                .then(authorData => {

      // Return information from BOTH APIs
      return {
        book: book,
        author: authorData
      };
      });
    })
    .catch(error => {
      console.error("Error fetching book data:", error);
      throw error;
    });
};
