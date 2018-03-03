var MainPage = require("./../elements/pages/MainPage");

describe("Main page tests", function(){

    beforeEach(function(){
        MainPage.get();
    });

    it("Title", function(){
        expect(browser.getTitle()).toEqual(MainPage.getTitle());
    });

    it("Address not in coverage", function(){
        MainPage.setAddress('Toronto').selectFirstAddress();

        browser.sleep(1000); // wait for angular digest

        expect(MainPage.getAddressMessageText()).toEqual(MainPage.getErrorAddressMessage());
    });
});