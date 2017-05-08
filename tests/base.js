const moment = require('moment-timezone');

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
	  const timezones = moment.tz.names();
	  const idx = TestsBase.getRandomNumber(timezones.length);

    return {
      personId: personId,
      name: `fake_${TestsBase.getRandomNumber()}`,
      phone: `+${TestsBase.getRandomNumber()}`,
      workStarts: TestsBase.generateTime(),
      workTime: TestsBase.generateTime(),
      timezone: timezones[idx]
    };
  }

  static generateTime() {
	  const h = TestsBase.getRandomNumber(10);
	  const m = TestsBase.getRandomNumber(60);
	  return `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}`;
  }

  static getRandomNumber(max) {
    return Math.floor(Math.random() * (max || 1000000));
  }
}

module.exports = TestsBase;
