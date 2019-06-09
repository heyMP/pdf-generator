var assert = require('assert');
const pdfService = require('../index.js')

describe('general', function () {
  it('it should take make a pdf of screenshots', async function () {
    const screenshots = await pdfService(['https://google.com', 'https://google.com'])
    console.log('screenshots:', screenshots)
    done()
  })
});