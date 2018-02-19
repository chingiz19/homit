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
        it("'/catalog/liqour-station/' should redirect to '/catalog/liquor-station/beer'", function(done){
            chai.request(host).get('/catalog/liquor-station')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/liquor-station/beer");
                    done();
                });
        });

        it("'/catalog/liquor-station/beer' should return 200", function(done){
            chai.request(host).get('/catalog/liquor-station/beer')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/liquor-station/beer");
                    done();
                });
        });

        it("'/catalog/liquor-station/wine' should return 200", function(done){
            chai.request(host).get('/catalog/liquor-station/wine')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/liquor-station/wine");
                    done();
                });
        });

        it("'/catalog/liquor-station/spirit' should return 200", function(done){
            chai.request(host).get('/catalog/liquor-station/spirit')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/liquor-station/spirit");
                    done();
                });
        });
        
        it("'/catalog/liquor-station/liqueur' should return 200", function(done){
            chai.request(host).get('/catalog/liquor-station/liqueur')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/liquor-station/liqueur");
                    done();
                });
        });

        it("'/catalog/snack-vendor/' should redirect to '/catalog/snack-vendor/snack'", function(done){
            chai.request(host).get('/catalog/snack-vendor')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/snack-vendor/snack");
                    done();
                });
        });

        it("'/catalog/snack-vendor/snack' should return 200", function(done){
            chai.request(host).get('/catalog/snack-vendor/snack')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal("/catalog/snack-vendor/snack");
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

        it("'/catalog/liquor/beer2' should return 200", function(done){
            chai.request(host).get('/catalog/liquor/beer2')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(200); 
                    expect(res.req.path).to.equal('/catalog/liquor/beer2');
                    done();
                });
        });
    }); // end Check public pages

    /**
     * Check that invalid paths are recognized (return 404)
     */
    describe("Check that invalid paths are recognized (return 404)", function(){
        var page_404 = "/notfound";
        it("'/invalidPath' should return 404 page", function(done){
            chai.request(host).get('/invalidPath')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(404); 
                    expect(res.req.path).to.equal(page_404);
                    done();
                });
        });

        it("'/main/notexpected' should return 404 page", function(done){
            chai.request(host).get('/main/notexpected')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(404); 
                    expect(res.req.path).to.equal(page_404);
                    done();
                });
        });

        it("'/invalidpath/main' should return 404 page", function(done){
            chai.request(host).get('/invalidpath/main')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(404); 
                    expect(res.req.path).to.equal(page_404);
                    done();
                });
        });

        it("'/catalog/beer' should return 404", function(done){
            chai.request(host).get('/catalog/beer')
                .end(function(err, res){
                    expect(res, "Message - " + err + "\n\t").to.not.equal(undefined); 
                    expect(res.statusCode).to.equal(404); 
                    expect(res.req.path).to.equal(page_404);
                    done();
                });
        });

    }); // end Check 404
})