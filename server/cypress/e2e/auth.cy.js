describe('Google Auth', () => {
  it('Login exitoso', () => {
    cy.loginWithGoogle(); // Usa tu custom command
    
    // Assertions
    cy.url().should('include', '/dashboard');
    cy.getCookie('session').should('exist');
    cy.contains('Bienvenido').should('be.visible');
  });
});