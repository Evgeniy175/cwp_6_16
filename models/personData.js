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
    workStarts: {
      type: Sequelize.TIME,
      allowNull: false
    },
    workTime: {
      type: Sequelize.TIME,
      allowNull: false
    },
    timezone: {
      type: Sequelize.STIRNG,
      allowNull: false
    }
  });
}

module.exports = PersonData;
