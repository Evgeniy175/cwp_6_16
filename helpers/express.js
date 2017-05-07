function ExpressExtensions(express, config, js2xml) {
  express.response.error = function(error) {
    if (!error.code) {
      error = {

        message: error.toString(),
        code: 'server_error',
        status: 500
      };
    }

    this.status(error.status);

    if (config.settings.return == 'xml') { this.xml(error.status, 'data', error); }
    else { this.json(error); }
  };

  express.response.xml = function(status, name, data) {
    this.set('Content-Type', 'text/xml');
    this.status(status);
    this.end(js2xml.parse(name, data));
  };
}

module.exports = ExpressExtensions;
