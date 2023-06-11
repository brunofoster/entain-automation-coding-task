class races {
   get raceCategory() {
      return cy.get('[data-testid="category-filter-checkbox"]');
   }

   get pageTitle() {
      return cy.get('[data-testid="page-title"]');
   }

   get raceNames() {
      return cy.get('.race-name');
   }
   getRaceNumber(index) {
      return cy.get(':nth-child(' + index + ') > .race-name > .race-number');
   }

   getRaceLocation(index) {
      return cy.get(':nth-child(' + index + ') > .race-name > p');
   }

   getTimeToJump(index) {
      return cy.get('.race-name ~ p').eq(index);
   }

   uncheckCategory(category) {
      cy.get('[data-testid="category-filter-' + category + '"] > [data-testid="category-filter-checkbox"]').uncheck();
   }

   checkCategory(category) {
      cy.get('[data-testid="category-filter-' + category + '"] > [data-testid="category-filter-checkbox"]').check();
   }

   getSortedRaces(interception, category = 'All') {
      let nextRace: { advertised_start: string; category_id: string, race_id: string, race_number: string; meeting_name: string; };
      type raceDet = [string, string, string, string, string];
      let raceDetails: raceDet;
      let allRaces: raceDet[] = [];

      for (let i = 0; i < 15; i++) {
         nextRace = interception.response?.body.race_summaries[Object.keys(interception.response?.body.race_summaries)[i]];
         raceDetails = [nextRace.advertised_start, nextRace.race_id, nextRace.category_id, nextRace.race_number, nextRace.meeting_name];
         if (category == 'All' || category == nextRace.category_id) {
            allRaces.push(raceDetails);
         }
      }
      return allRaces.sort();
   }

   addMinutes(date, minutes, seconds) {
      return new Date(date.getTime() + minutes * 60000 + seconds * 1000);
   }
}

export default new races;