import { useState, useEffect } from "react";

/**
 * useDocumentTitle — sets the page title.
 */
const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | Foodie` : "Foodie — Delicious Food Delivered Fast";
  }, [title]);
};

export default useDocumentTitle;
