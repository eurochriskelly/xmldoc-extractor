# xmldoc-extractor

Extracts XML-based documents on files system, queries manifest and recompresses
into XML document after modifications have been made to content.

## usage

    const XmlDocExtractor = require('xmldoc-extractor');
    const xde = new XmlDocExtractor('some-office-doc.pptx');
    xde.open()
       .then(r => {
           return xde.getPages();
       });