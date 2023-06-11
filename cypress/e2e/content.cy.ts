/// <reference types="Cypress" />

import races from "../support/pages/races";

describe('Page Content', () => {

  beforeEach(() => {
    cy.window().then((win) => {
      win.location.href = 'about:blank';
    })
  });

  // This test is failing as it seems the page isn't handling 500 errors
  it('Should handle a failed API call with 500 response', () => {
    cy.fixture('mock-500.json').then((json) => {
      cy.intercept('GET', '**/v2/racing/next-races-category-group*', { statusCode: 500, body: json }).as('noData');
      cy.visit('/');
      cy.wait('@noData', { timeout: 60000 }).then(() => {
        cy.reload();
        races.raceNames.should('have.length', 0);
      });
    });
  });

  // This test is failing as it seems the page isn't handling 400 errors
  it('Should handle a failed API call with 400 response', () => {
    cy.fixture('mock-400.json').then((json) => {
      cy.intercept('GET', '**/v2/racing/next-races-category-group*', { statusCode: 400, body: json }).as('noData');
      cy.visit('/');
      cy.wait('@noData', { timeout: 60000 }).then(() => {
        cy.reload();
        races.raceNames.should('have.length', 0);
      });
    });
  });

  it('Should correctly display page title', () => {
    // Next To Go Races
    cy.visit('/');
    races.pageTitle.should('contain.text', 'Next To Go Races');
  });

  it('Should display expected values for race row contents', () => {
    // Race number, venue name, time to jump
    cy.intercept('GET', '**/v2/racing/next-races-category-group*').as('raceCheck');
    cy.visit('/');
    cy.wait('@raceCheck', { timeout: 60000 }).then((interception) => {
      // Sort API results so the display order can be checked
      let allRaces = races.getSortedRaces(interception);
      let now = Math.floor(new Date().getTime() / 1000) * 1000;
      cy.clock(now);
      for (let i = 0; i < 5; i++) {
        let diff = new Date(allRaces[i][0]).getTime() - now;
        let mins = Math.trunc(diff / 60000);
        let sec = Math.round((diff - (mins * 60000)) / 1000);
        let timerText = (mins == 0) ? sec + 's' : (mins < 5 ? mins + 'm ' + Math.abs(sec) + 's' : mins + "m");
        races.getTimeToJump(i).should('contain.text', timerText);
        races.getRaceNumber(i + 1).should('contain.text', 'R' + allRaces[i][3]);
        races.getRaceLocation(i + 1).should('contain.text', allRaces[i][4]);
      }
      cy.clock().invoke('restore');
    });
  });

});
