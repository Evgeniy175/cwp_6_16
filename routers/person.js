function PeopleRouter(express, peopleService) {
  const resolvers = {
    'xml': promiseResolverXml,
    'json': promiseResolverJson
  };

  const router = express.Router();

  router.post('/', create);
  router.get('/:id', read);
  router.get('/', readMany);
  router.put('/:id', update);
  router.delete('/:id', remove);

  return router;

  function create(req, res) {
    resolvers[req.format](peopleService.create(req.body.message), res, 201);
  }

  function read(req, res) {
    resolvers[req.format](peopleService.read(req.params.id), res, 200);
  }

  function readMany(req, res) {
    resolvers[req.format](peopleService.readMany(req.query), res, 200);
  }

  function update(req, res) {
    resolvers[req.format](peopleService.update(req.params.id, req.body.message), res, 200);
  }

  function remove(req, res) {
    resolvers[req.format](peopleService.remove(req.params.id), res, 200);
  }

  function promiseResolverJson(promise, res, status) {
    promise.then((data) => {res.status(status); res.json(data);})
    .catch((err) => {res.error(err);});
  }

  function promiseResolverXml(promise, res, status) {
    promise.then((data) => { res.xml(status, "data", data);})
    .catch((err) => {res.error(err);});
  }
}

module.exports = PeopleRouter;
