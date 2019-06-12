# OpenFaaS pdf-generator

This takes a screenshot of urls and returns a pdf.

## Usage

```bash
$ curl -X POST -H "Content-Type: text/plain" --data '{ "urls" : "https://www.hategrenade.com" }' -o screenshot.pdf http://localhost:8080/function/pdf-generator
```
