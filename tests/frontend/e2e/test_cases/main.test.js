var MainPageClass = require("./../elements/pages/MainPage");
var CatalogPageClass = require("./../elements/pages/CatalogPage");

var MainPage = new MainPageClass();
var CatalogPage = new CatalogPageClass();

describe("Main page tests", function(){

    beforeEach(function(){
        MainPage.get();
    });

    it("Title", function(){
        expect(browser.getTitle()).toEqual(MainPage.title());
    });

    it("Address not in coverage", function(){
        MainPage.setAddress('Toronto').selectFirstAddress();

        browser.sleep(1000); // wait for angular digest

        expect(MainPage.getAddressMessageText()).toEqual(MainPage.getErrorAddressMessage());
    });

    it("Address in coverage", function(){
        MainPage.setAddress('Calgary').selectFirstAddress();

        browser.sleep(1000); // wait for angular digest

        expect(MainPage.currentUrl()).toEqual(MainPage.homitHubUrl());
    });

    it("Clicking goToHomitHubArrowBtn Button works", function(){
        MainPage.goToHomitHubArrowBtn.click();

        browser.sleep(1000); // wait for angular digest

        expect(MainPage.currentUrl()).toEqual(MainPage.homitHubUrl());
    });

    it("Clicking snack-vendor goes to right page", function(){
        MainPage.clickSnackVendorDiv();

        browser.sleep(1000); // wait for angular digest

        expect(CatalogPage.currentUrl()).toEqual(CatalogPage.snackVendorUrl());
    });

    it("Clicking liquor-station goes to right page", function(){
        MainPage.clickLiquorStationDiv();

        browser.sleep(1000); // wait for angular digest

        expect(CatalogPage.currentUrl()).toEqual(CatalogPage.liquorStationUrl());
    });


});