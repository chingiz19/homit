/**
 * Unit tests for Users model
 * @author Jeyhun Gurbanov
 */

var expect = require("chai").expect;
// var userModel = require("/models/users.js");

describe("Users model unit tests", function(){

    describe("sanitizeUserObject method", function(){
        it("Expect password key-value to be deleted", function(){
            var testData = {name: "abc", password: "pass"};
            var expectedData = {name: "abc"};

            delete testData["password"]

            expect(testData).to.deep.equal(expectedData)
        })
    })
})