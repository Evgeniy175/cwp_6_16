class TeamService {
  constructor(teamsRepository, bcrypt, config, errors) {
    this.teamsRepository = teamsRepository;
    this.bcrypt = bcrypt;
    this.config = config;
    this.errors = errors;

    this.defaultOptions = {
      readMany: {
        limit: 10,
        page: 1,
        order: 'asc',
        orderField: 'id'
      }
    };
  }

  create(team) {
    const validationErrors = this._getValidationErrors(team);

    return new Promise((resolve, reject) => {
      if (validationErrors !== '') {
        reject(validationErrors);
        return;
      }
      
      this.teamsRepository.create(team)
      .then(data => {
        team.id = data.dataValues.id;
        resolve({ success: true });
      })
      .catch(reject);
    });
  }

  read(id) {
    id = parseInt(id);

    return new Promise((resolve, reject) => {
      if (isNaN(id)) {
        reject(this.errors.invalidId);
        return;
      }

      this.teamsRepository.findById(id)
      .then(res => {
        if (res) resolve(res.dataValues);
        else reject(this.errors.notFound);
      })
      .catch(reject);
    });
  }

  readMany(params = {}) {
    if (!params.page) params.page = 1;
    
    let findOptions = this._getReadManyOptions(params);

    return new Promise((resolve, reject) => {
      this.teamsRepository
      .findAndCountAll(findOptions)
      .then(data => resolve(this._getReadManyResults(params, findOptions, data)))
      .catch(reject);
    });
  }

  _getReadManyOptions(params) {
    params = Object.assign({}, this.defaultOptions.readMany, params);

    let limit = parseInt(params.limit);
    let page = parseInt(params.page);

    return {
      limit: limit,
      offset: (page - 1) * limit,
      order: [[params.orderField, params.order.toUpperCase()]],
      raw: true
    };
  }

  _getReadManyResults(params, findOptions, data) {
    return {
      portionNumber: params.page,
      nOfPortions: Math.ceil(data.count / findOptions.limit),
      rows: data.rows
    };
  }

  update(id, newTeam) {
    let team = {
      name: newTeam.name
    };

    const validationErrors = this._getValidationErrors(team);
    
    return new Promise((resolve, reject) => {
      if (validationErrors.length > 0) {
        reject(validationErrors);
        return;
      }

      if (!id) {
        reject(this.errors.invalidEntity);
        return;
      }

      newTeam.id = id;

      return this.teamsRepository.update(team, { where: { id }, limit: 1 })
      .then(data => resolve({ success: true }))
      .catch(reject);
    });
  }

  remove(id) {
    return new Promise((resolve, reject) => {
      this.teamsRepository.destroy({ where: { id } })
      .then(data => resolve({ success: true }))
      .catch(reject);
    });
  }

  _getValidationErrors(team) {
    let validationErrors = this.validate(team).join('; ');

    if (validationErrors.length === 0) return '';

    let rc = this.errors.invalidEntity;
    rc.message = rc.message + ': ' + validationErrors;
    return rc;
  }

  validate(team) {
    let rc = [];

    if (!team) return ['Task data is wrong'];

    if (!team.name || team.name === '') rc.push('Name not set');

    return rc;
  }
}

module.exports = TeamService;
