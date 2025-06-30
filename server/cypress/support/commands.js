Cypress.Commands.add('loginWithGoogle', () => {
  cy.visit('/login');
  cy.get('[data-cy=google-login]').click();
  
  // Usa cy.origin() para dominios cruzados (Cypress 10+)
  cy.origin('https://accounts.google.com', () => {
    cy.get('input[type="email"]').type(Cypress.env('TEST_EMAIL'));
    cy.get('button:contains("Siguiente")').click();
    cy.get('input[type="password"]').type(Cypress.env('TEST_PWD'), { log: false });
    cy.get('button:contains("Siguiente")').click();
  });
});