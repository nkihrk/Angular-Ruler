const ghPages = require("gh-pages");

ghPages.publish(
  "dist",
  {
    message: "Auto-generated commit"
  },
  error => {
    if (error) {
      throw error;
    }
  }
);
