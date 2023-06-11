import races from "../support/pages/races";
import { RACING_CATEGORIES } from "../config/constants";

describe('Category Filters', () => {

  beforeEach(() => {
    cy.window().then((win) => {
      win.location.href = 'about:blank';
    })
  });

  it('Should validate checkboxes filter correctly when only one record is displayed', () => {
    cy.fixture('mock-greyhound.json').then((json) => {
      json.race_summaries['greyhound1'].advertised_start = new Date().toISOString();
      cy.intercept('GET', '**/v2/racing/next-races-category-group*', json).as('dummyData');
      cy.visit('/');
      cy.wait('@dummyData', { timeout: 60000 }).then(() => {
        races.getRaceNumber(1).should('have.text', 'R' + json.race_summaries['greyhound1'].race_number);
        races.getRaceLocation(1).should('have.text', json.race_summaries['greyhound1'].meeting_name);
        races.raceNames.should('have.length', 1);
        races.uncheckCategory(RACING_CATEGORIES[1].categoryId);
        races.raceNames.should('have.length', 0);
      });
    });
  });

  it('Should validate checkboxes do not error when no data displayed', () => {
    cy.fixture('mock-greyhound.json').then((json) => {
      cy.intercept('GET', '**/v2/racing/next-races-category-group*', json).as('dummyData');
      cy.visit('/');
      cy.wait('@dummyData', { timeout: 60000 }).then(() => {
        for (let i = 0; i < 3; i++) {
          races.raceNames.should('have.length', 0);
          races.uncheckCategory(RACING_CATEGORIES[i].categoryId);
          races.raceNames.should('have.length', 0);
          races.checkCategory(RACING_CATEGORIES[i].categoryId);
        }
      });
    });
  });

  it('Should validate that all checkboxes are checked by default', () => {
    cy.visit('/');
    races.raceCategory.each(($el) => {
      expect($el).to.be.checked;
    });
  });

  it('Should validate that checkboxes filter content appropriately', () => {
    // Compare against intercepted real data
    cy.intercept('GET', '**/v2/racing/next-races-category-group*').as('raceCheck');
    cy.visit('/');
    cy.wait('@raceCheck', { timeout: 60000 }).then((interception) => {
      for (let j = 0; j < 3; j++) {
        let box1 = j == 2 ? 1 : j + 1;
        let box2 = j == 0 ? 2 : 0;
        races.uncheckCategory(RACING_CATEGORIES[box1].categoryId);
        races.uncheckCategory(RACING_CATEGORIES[box2].categoryId);
        let allRaces = races.getSortedRaces(interception, RACING_CATEGORIES[j].categoryId);
        for (let i = 0; i < 5; i++) {
          races.getRaceNumber(i + 1).should('contain.text', 'R' + allRaces[i][3]);
          races.getRaceLocation(i + 1).should('contain.text', allRaces[i][4]);
        }
        races.uncheckCategory(RACING_CATEGORIES[j].categoryId);
      }
    });
  });

  it('Should validate that unchecking all checkboxes re-enables all', () => {
    cy.visit('/');
    races.raceCategory.uncheck();
    races.raceCategory.each((checkbox) => {
      expect(checkbox).to.be.checked;
    });
  });

});
