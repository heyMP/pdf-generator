"use strict"

const generator = require('./generator.js')

module.exports = async (config) => {
    const routing = new Routing(config.app);
    routing.configure();
    routing.bind(routing.handle);
}

class Routing {
    constructor(app) {
        this.app = app;
    }

    configure() {
        const bodyParser = require('body-parser')
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.raw());
        this.app.use(bodyParser.text({ type : "text/*" }));
        this.app.disable('x-powered-by');        
    }

    bind(route) {
        this.app.post('/*', route);
        this.app.get('/*', route);
        this.app.patch('/*', route);
        this.app.put('/*', route);
        this.app.delete('/*', route);
    }

    async handle(req, res) {
      if (req.body && typeof req.body !== 'undefined') {
        if (typeof req.body === 'string') {
          const body = req.body
          const urls = body.split(',').map(i => i.trim())
          if (urls.length > 0) {
            const pdfBuffer = await generator(urls)
            res.send(pdfBuffer);
          }
        }
        else {
          res.send('No urls were found.')
        }
      }
    }
}
