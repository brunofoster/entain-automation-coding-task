import races from "../support/pages/races";

describe('Countdown Timer', () => {

  it('Should validate that timer is ticking down', () => {
    // Handle this deterministically through mocking race jump times
    cy.fixture('mock-greyhound.json').then((json) => {
      const now = new Date();
      // Set race time to 4 minutes from now
      // Note - countdown only starts at 5 mins before the jump for a race
      json.race_summaries['greyhound1'].advertised_start = races.addMinutes(now, 4, 0).toISOString();
      cy.intercept('GET', '**/v2/racing/next-races-category-group*', json).as('dummyData');
      cy.wait(1000);
      cy.visit('/');
      cy.wait('@dummyData', { timeout: 60000 }).then(() => {
        races.raceNames.should('have.length', 1);
        cy.clock(now);
        races.getTimeToJump(1).should('have.text', '4m');
        cy.tick(1000);
        races.getTimeToJump(1).should('have.text', '3m 59s');
        cy.tick(1000);
        races.getTimeToJump(1).should('have.text', '3m 58s');
        cy.clock().invoke('restore');
      });
    });
  });

  it('Should validate that race time sign swaps to negative when expected jump time is exceeded', () => {
    // Handle this deterministically through mocking race jump times
    cy.fixture('mock-greyhound.json').then((json) => {
      const now = new Date();
      // Set race time to 5 minutes from now
      json.race_summaries['greyhound1'].advertised_start = races.addMinutes(now, 5, 0).toISOString();
      cy.intercept('GET', '**/v2/racing/next-races-category-group*', json).as('dummyData');
      cy.visit('/');
      cy.wait('@dummyData', { timeout: 60000 }).then(() => {
        races.raceNames.should('have.length', 1);
        cy.clock(now);
        races.getTimeToJump(1).should('not.include.text', '-');
        // Set timer to 1 second past jump
        cy.tick(301000);
        races.getTimeToJump(1).should('include.text', '-');
        cy.clock().invoke('restore');
      });
    });
  });

  it('Should validate that races do not display after 5 minutes past the jump', () => {
    // Handle this deterministically through mocking race jump times
    cy.fixture('mock-greyhound.json').then((json) => {
      const now = new Date();
      // Set race time to 4 mins 55 seconds ago
      json.race_summaries['greyhound1'].advertised_start = races.addMinutes(now, -4, -55).toISOString();
      cy.intercept('GET', '**/v2/racing/next-races-category-group*', json).as('dummyData');
      cy.visit('/');
      cy.wait('@dummyData', { timeout: 60000 }).then(() => {
        races.raceNames.should('have.length', 1);
        races.getTimeToJump(1).should('include.text', '-4m 5');
        // Wait 5 seconds to exceed 5 mins since jump
        cy.wait(5000);
        // Reload to get API call to run again to update page display
        // Note - Race does not disappear instantly after 5 mins, happens after next API call
        cy.reload();
        races.raceNames.should('have.length', 0);
        cy.wait(1000);
      });
    });
  });

  it('Should display nothing if all races are more than 5 minutes in the past', () => {
    cy.fixture('mock-greyhound.json').then((json) => {
      const now = new Date();
      // Set race time to 5 minutes and 1 second in the past
      json.race_summaries['greyhound1'].advertised_start = races.addMinutes(now, -5, -1).toISOString();
      cy.intercept('GET', '**/v2/racing/next-races-category-group*', json).as('dummyData');
      cy.visit('/');
      cy.wait('@dummyData', { timeout: 60000 }).then(() => {
        races.raceNames.should('have.length', 0);
        cy.wait(2000);
        races.raceNames.should('have.length', 0);
      });
    });
  });
});
