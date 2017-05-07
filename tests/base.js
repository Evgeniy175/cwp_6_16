class TestsBase {
	static generateTeam() {
    return {
      name: `team_${TestsBase.getRandomNumber()}`
		};
	}

  static generatePerson(teamId) {
    return {
      realName: `person_${TestsBase.getRandomNumber()}`,
      teamId: teamId
    };
  }

  static generatePersonData(personId) {
    return {
      personId: personId,
      name: `fake_${TestsBase.getRandomNumber()}`,
      phone: `+${TestsBase.getRandomNumber()}`,
      workTime: `${TestsBase.getRandomNumber(24)}h/day`
    };
  }

  static getRandomNumber(max) {
    return Math.floor(Math.random() * (max || 1000000));
  }
}

module.exports = TestsBase;
