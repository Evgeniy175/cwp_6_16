function PersonData(Sequelize, sequelize) {
  return sequelize.define('peopleData', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    personId: Sequelize.INTEGER,
    name: Sequelize.STRING,
    phone: Sequelize.STRING,
    workTime: Sequelize.STRING
  });
}

module.exports = PersonData;
