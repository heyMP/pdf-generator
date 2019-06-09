const puppeteer = require('puppeteer')
const path = require('path')
const Case = require('case')
const URL = require('url')
const Minio = require('minio')
const memoryStreams = require('memory-streams');
const hummus = require('hummus');
const uuid = require('uuid/v1');

var minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9001,
  useSSL: false,
  accessKey: 'minio',
  secretKey: 'minio123'
})

/**
 * list of urls to snapshot
 * @param {array} urls
 * @param {object} options
 */
module.exports = async (urls, options = {}) => {
  const title = options.title || uuid()
  const snapshots = await Promise.all(urls.map(url => takeScreenshot(url)))
  const pdfBuffer = await combinePDFBuffers(snapshots)
  try {
    const minioupload = minioClient.putObject('general', `pdf-snapshot-${title}.pdf`, pdfBuffer)
    return minioupload
  } catch (error) {
    return error
  }
}

/**
 * Navigate to a page, take a screenshot and return a 
 * @param {string} url 
 */
const takeScreenshot = async (url, options = {}) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  buffer = await page.pdf({ fullPage: true });
  await browser.close();
  return buffer
}

/**
 * Concatenate multiple PDFs in Buffers
 * @param {array}<Buffer> - an array of buffers
 * @returns {Buffer} - a Buffer containing the concactenated PDFs
 */
const combinePDFBuffers = (buffers) => {
  var outStream = new memoryStreams.WritableStream();
  try {
    const pdfStreams = buffers.map(b => new hummus.PDFRStreamForBuffer(b))
    let pdfWriter = null
    pdfStreams.forEach(stream => {
      if (!pdfWriter) {
        pdfWriter = hummus.createWriterToModify(stream, new hummus.PDFStreamForResponse(outStream));
      }
      else {
        pdfWriter.appendPDFPagesFromPDF(stream);
      }
    });
    pdfWriter.end();
    var newBuffer = outStream.toBuffer();
    outStream.end();
    return newBuffer;
  }
  catch (e) {
    outStream.end();
    throw new Error('Error during PDF combination: ' + e.message);
  }
};