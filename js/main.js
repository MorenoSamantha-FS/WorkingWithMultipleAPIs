"use strict";

import { getBookData } from "./api.js";

(() => {
  getBookData("Frankenstein")
    .then((data) => {
      console.log("COMBINED API DATA:", data);
    })
    .catch((error) => {
      console.error("MAIN.JS ERROR:", error);
    });
})();
