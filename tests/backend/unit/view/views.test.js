/**
 * Unit tests for get view
 * @author Jeyhun Gurbanov
 */

var chai = require("chai");
chai.use(require("chai-http"));
var expect = chai.expect;

var host = "http://localhost:8080";

describe("Make sure views can be retrieved/loaded", function(){
    /**
     * Check that Public pages are loaded (return 200)
     */
    describe("Check that Public pages are loaded (return 200)", function(){
        it("'/catalog/liqour/' should redirect to '/catalog/liquor/beer'", function(done){
            chai.request(host).get('/catalog/liquor')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/liquor/beer");
                    done();
                });
        });

        it("'/catalog/liquor/beer' should return 200", function(done){
            chai.request(host).get('/catalog/liquor/beer')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/liquor/beer");
                    done();
                });
        });

        it("'/catalog/liquor/wine' should return 200", function(done){
            chai.request(host).get('/catalog/liquor/wine')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/liquor/wine");
                    done();
                });
        });

        it("'/catalog/liquor/spirit' should return 200", function(done){
            chai.request(host).get('/catalog/liquor/spirit')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/liquor/spirit");
                    done();
                });
        });

        it("'/catalog/liquor/beer' should return 200", function(done){
            chai.request(host).get('/catalog/liquor/beer')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/liquor/beer");
                    done();
                });
        });

        it("'/catalog/snackvendor/' should redirect to ", function(done){
            chai.request(host).get('/catalog/snackvendor')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/snackvendor/all");
                    done();
                });
        });

        it("'/catalog/snackvendor/all' should return 200", function(done){
            chai.request(host).get('/catalog/snackvendor/all')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/snackvendor/all");
                    done();
                });
        });

        it("'/checkout' should return 200", function(done){
            chai.request(host).get('/checkout')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/checkout");
                    done();
                });
        });

        it("'/sifarish01' (csr_login) should return 200", function(done){
            chai.request(host).get('/sifarish01')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/sifarish01");
                    done();
                });
        });

        it("'/main' should return 200", function(done){
            chai.request(host).get('/main')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/main");
                    done();
                });
        });
    }); // end Check public pages

    /**
     * Check that invalid paths are recognized (return 404)
     */
    describe("Check that invalid paths are recognized (return 404)", function(){
        var page_404 = "/404";
        it("'/invalidPath' should return 404 page", function(done){
            chai.request(host).get('/invalidPath')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(404); 
                    //expect(res.req.path).to.equal(page_404); //TODO name of 404 page
                    done();
                });
        });

        it("'/main/notexpected' should return 404 page", function(done){
            chai.request(host).get('/main/notexpected')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(404); 
                    //expect(res.req.path).to.equal(page_404); //TODO name of 404 page
                    done();
                });
        });

        it("'/invalidpath/main' should return 404 page", function(done){
            chai.request(host).get('/invalidpath/main')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(404); 
                    //expect(res.req.path).to.equal(page_404); //TODO name of 404 page
                    done();
                });
        });

    }); // end Check 404
})