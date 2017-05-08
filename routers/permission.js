function PermissionRouter(express, config) {
  const router = express.Router();

  router.all('*', resolveDataFormat);

  return router;

  function resolveDataFormat(req, res, next) {
    if (!req.headers.accept) req.headers.accept = [config.settings.return];

    const accept = req.headers.accept;

    if (accept.includes('json')) req.format = 'json';
    else if (accept.includes('xml')) req.format = 'xml';
    else req.format = config.settings.return;

    next();
  }

  function promiseResolverJson(promise, res, status) {
    promise.then(data => {res.status(status); res.json(data);})
    .catch(err => {res.error(err);});
  }

  function promiseResolverXml(promise, res, status) {
    promise.then(data => {res.xml(status, 'data', data);})
    .catch(err => {res.error(err);});
  }
}

module.exports = PermissionRouter;
