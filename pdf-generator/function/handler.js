"use strict"

const generator = require('./generator.js')
const cors = require('cors')

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
        this.app.use(bodyParser.json({ type: "*/*" }));
        this.app.use(cors())
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
      const body = req.body || {}
      const query = req.query || {}
      const options = Object.assign({}, body, query)

      if (typeof options.urls !== 'undefined') {
        let url = options.urls
        // if the url is a string then we need to convert
        // to an array
        if (typeof url === 'string') {
          url = url.split(',').map(i => i.trim())
        }
        if (url.length > 0) {
          try {
            const pdfBuffer = await generator(url)
            res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfBuffer.length })
            res.send(pdfBuffer);
          } catch (error) {
            res.send('Unable to generator pdf.')
          }
        }
        else {
          res.send('No urls found.');
        }
      }
      else {
        res.send('No urls found.');
      }
    }
}