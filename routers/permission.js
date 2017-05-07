function PermissionRouter(express, jwt, config, errors) {
    const resolvers = {
        'xml': promiseResolverXml,
        'json': promiseResolverJson
    };

    let router = express.Router();

    router.all('*', checkPermissions);
    router.all('*', resolveDataFormat);

    return router;

    function checkPermissions(req, res, next) {
        let freeAccessRoutes = ['/sessions', '/users'];
        let isFreeAccessRoute = freeAccessRoutes.some(elem => req.url == elem);
        let isUserSigned = req.signedCookies[config.cookies.tokenKey] ? true : false;
        
        if (isUserSigned) req.decodedToken = jwt.verify(req.signedCookies[config.cookies.tokenKey], config.jwt.secret);

        if (isFreeAccessRoute || isUserSigned) next();
        else res.error(errors.accessDenied);
    }

    function resolveDataFormat(req, res, next) {
        if (!req.headers.accept) req.headers.accept = [config.settings.return];

        const accept = req.headers.accept;

        if (accept.includes('json')) req.format = 'json';
        else if (accept.includes('xml')) req.format = 'xml';
        else req.format = config.settings.return;

        next();
    }

    function promiseResolverJson(promise, res, status) {
        promise.then((data) => {res.status(status); res.json(data);})
            .catch((err) => {res.error(err);});
    }

    function promiseResolverXml(promise, res, status) {
        promise.then((data) => {res.xml(status, 'data', data);})
            .catch((err) => {res.error(err);});
    }
}

module.exports = PermissionRouter;
