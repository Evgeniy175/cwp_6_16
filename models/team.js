function Team(Sequelize, sequelize) {
  return sequelize.define('teams', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: Sequelize.STRING
  });
}

module.exports = Team;
