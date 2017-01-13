"use strict";

const fs   = require('fs');
const os   = require('os');
const path = require('path');

const sut = require('./xmldoc-lib');
const SAMPLE_PPTX = 'data/Sample.pptx';

describe('handle xml presentation format', () => {
    
    describe('extraction abilities', () => {
        it ('check that file can be opened', done => {
            const xps = new sut(SAMPLE_PPTX);
            xps.open()
                .then(r => {
                    return xps.getPages();
                })
                .then(pages => {
                    expect(pages).toHaveLength(42);
                    return pages;
                })
                .then(done);
        });

        it('gets slides', done => {
            const xps = new sut(SAMPLE_PPTX);
            getSlides(xps).then(slides => {
                expect(slides).toHaveLength(2);
                done();
            });
        });

    });

    describe ('content reading ability', () => {
        it ('gets slide data', done => {
            const xps = new sut(SAMPLE_PPTX);
            const obj = getSlides(xps);
            obj
                .then(slides => {
                    return xps.readSlide(slides[1]);
                })
                .then(content => {
                    expect(content).toHaveLength(2089);
                    done();
                });
        });
    });

    describe ('insertion abilities', () => {
        it ('cannot update a non-existing slide' , done => {
            const xps = new sut(SAMPLE_PPTX);
            const obj = getSlides(xps);
            obj
                .then(slides => {
                    return xps.updateSlide('abc', `<xml>
                      <works></works>
                    </xml>`);
                })
                // should throw error
                .catch(done);
        });
        it ('update an existing slide' , done => {
            const xps = new sut(SAMPLE_PPTX);
            const obj = getSlides(xps);
            obj
                .then(slides => {
                    return xps.updateSlide(slides[0], `<xml>
                      <works></works>
                    </xml>`);
                })
                // should throw error
                .then(done);
        });
        it ('updates existing presentation slides' , done => {
            const xps = new sut(SAMPLE_PPTX);
            const newKeyword = 'FFFaster';
            const obj = getSlides(xps);
            var slide;
            obj
                .then(slides => {
                    slide = slides[1];
                    return xps.readSlide(slide);
                })
                .then(content => {
                    var newContent = content.replace(/Sample/g, newKeyword);
                    return xps.updateSlide(slide, newContent);
                })
                // check data contains new keyword
                .then(r => {
                    fs.readFile(slide, (e, data) => {
                        if (data.toString().indexOf(newKeyword)) {
                            done();
                        }
                    });
                });
        });
        it ('creates a new presentation' , done => {
            const xps = new sut(SAMPLE_PPTX);
            const newKeyword = 'SimpleSimon met a pieman';
            const obj = getSlides(xps);
            var slide;
            obj
                .then(slides => {
                    slide = slides[1];
                    return xps.readSlide(slide);
                })
                .then(content => {
                    var newContent = content.replace(/Sample/g, newKeyword);
                    return xps.updateSlide(slide, newContent);
                })
                // save to disk
                .then(r => {
                    return xps.save(path.resolve(os.tmpdir(), 're-exported.pptx'));
                })
                .then(done);
        });
    });


    function getSlides (xps) {
        return xps.open()
            .then(r => {return xps.getPages();})
            .then(r => {return xps.getSlides();});
    }
    
});
