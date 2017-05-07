function DbContext(Sequelize, config) {
  const options = {
    host: config.db.host,
    dialect: config.db.dialect,
    dialectOptions: { ssl: config.db.dialect === 'postgres' },
    logging: false,
    define: {
      timestamps: true,
      paranoid: true
    }
  };

  const sequelize = new Sequelize(config.db.name, config.db.user, config.db.pass, options);

  const People = require('../models/person')(Sequelize, sequelize);
  const PeopleData = require('../models/personData')(Sequelize, sequelize);
  const Teams = require('../models/team')(Sequelize, sequelize);

  People.hasOne(Teams, { foreignKey: 'teamId', as: 'team' });
  People.hasMany(PeopleData, { foreignKey: 'personId', as: 'personData' });

  //if (options.host !== 'localhost')
  sequelize.sync();

  return {
    people: People,
    peopleData: PeopleData,
    teams: Teams,

    sequelize: sequelize
  }
}

module.exports = DbContext;
