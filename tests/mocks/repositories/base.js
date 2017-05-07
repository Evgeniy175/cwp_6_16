class Repository {
  constructor() {
    this.objects = [];
  }

  findAll() {
    return Promise.resolve(this.objects.map(elem => ({ dataValues: elem })));
  }

  findById(id) {
    const result = this.objects.find(object => object.id === id);
    return Promise.resolve(result ? { dataValues: result } : null);
  }

  findOne(params) {
    const where = params.where;
    const keys = Object.keys(where);
    const results = this.objects.find(object => keys.every(key => object[key] === where[key]));
    return Promise.resolve({ dataValues: results });
  }

  find(params) {
    return this.findOne(params);
  }

  findAndCountAll(params) {
    const limit = params.limit;
    const offset = params.offset;
    const rows = this.objects.splice(offset, limit);
    const count = this.objects.length;
    return Promise.resolve({ rows, count });
  }

  create(object) {
    const random = Math.random() * 1000000;
    object.id = Math.floor(random);
    this.objects.push(object);
    return Promise.resolve({ dataValues: object });
  }

  update(object, params) {
    const idx = this.objects.findIndex(elem => elem.id === params.where.id);

    if (idx !== -1) {
      this.objects[idx] = object;
      this.objects[idx].id = params.where.id;
    }
    
    return Promise.resolve();
  }

  destroy(params) {
    const idx = this.objects.findIndex(elem => elem.id === params.where.id);
    
    if (idx === -1) return Promise.resolve(0);

    this.objects.splice(idx, 1);
    return Promise.resolve(1);
  }

  mockClear() {
    this.objects = [];
  }
}

module.exports = Repository;
