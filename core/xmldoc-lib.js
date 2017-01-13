/**
 * XPS
 */
'use strict';

const fs        = require('fs');
const path      = require('path');
const os        = require('os');
const unzip     = require('unzip');
const FolderZip = require('folder-zip');
const ndir      = require('node-dir');

class XmlDoc {
    
    constructor (filename) {
        if (!filename) throw new Error('Must provided presentation file!');
        this.filename = path.resolve(filename);
        this.unique = `xmldoc-${(new Date()).valueOf()}`;
        this.tmpPath = path.resolve(os.tmpdir(),this.unique) ;
        this.files  = [];
        this.slides = [];
        return this;
    }

    // extract into folder
    open () {
        return new Promise((resolve, reject) => {
            fs.createReadStream(this.filename)
                .pipe(unzip.Extract({ path: this.tmpPath }))
                .on('close', resolve)
                .on('error', reject)
            ;
        });
    }

    // save the contents of temp folder into file
    save (filename) {
        if (!filename) throw new Error('Please provide filename to save');
        return new Promise((resolve, reject) => {
            var zip = new FolderZip();
            const options =  {
                excludeParentFolder: true
            }
            zip.zipFolder(this.tmpPath, options, e => {
                if (e) reject (e);
                zip.writeToFileSync(path.resolve(filename));
                resolve();
            });
        });
    }

    // read contents of a slide
    readSlide(fname) {
        return new Promise((resolve, reject) => {
            this._slideExists(fname);
            fs.readFile(fname, (e, content) => {
                if (e) reject (e);
                resolve(content.toString());
            });
        });
    }
    getSlides () {
        return new Promise((resolve, reject) => {
            var run = () => {
                this.slides = this.files.filter(f => {
                    return path.extname(f) === '.xml'
                        && f.split('/').indexOf('slides') > -1;
                });
                resolve(this.slides);
            };

            if (!this.files) {
                this.getPages().then(run);
            } else {
                run();
            }
        });
    }

    updateSlide (slide, contents) {
        return new Promise((resolve, reject) => {
            this._slideExists(slide);
            fs.writeFile(slide, contents, e => {
                if (e) reject(e);
                resolve();
            });
        });
    }
    // returns temporary pages
    getPages () {
        var files = [];
        return new Promise((resolve, reject) => {
            ndir.files(this.tmpPath, (e, files) => {
                if (e) reject(e);
                this.files = files;
                resolve(files);
            });
        });
    }

    _slideExists (slide) {
        if (!slide) throw new Error('must provide slide to search for');
        const slideFound = this.slides.filter(f => f === slide).length;
        if (!slideFound) {
            throw new Error('cannot update slide that does not exist', slideFound);
        }
    }
}

module.exports = XmlDoc;
