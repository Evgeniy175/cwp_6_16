function Person(Sequelize, sequelize) {
  return sequelize.define('people', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    realName: Sequelize.STRING,
    teamId: Sequelize.INTEGER
  });
}

module.exports = Person;
