const { defineConfig } = require('cypress');
module.exports = defineConfig({
  e2e: {
    defaultCommandTimeout: 40000, // Aumenta timeout
    pageLoadTimeout: 60000
  }
});
