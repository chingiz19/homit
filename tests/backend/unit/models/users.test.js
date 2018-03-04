/**
 * Unit tests for get view
 * @author Jeyhun Gurbanov
 */

var chai = require("chai");
chai.use(require("chai-http"));
var expect = chai.expect;
var path = require("path");
var dotenv = require("dotenv");
dotenv.config({path: "test.env"});
var mysql = require("promise-mysql");

var userModel = require(path.join(process.cwd(), "/models/users.js"));
global.secretKey = "123Test";
global.Auth = require(path.join(process.cwd(), "/models/authentication.js"));
global.db = require(path.join(process.cwd(), "/models/database.js"));
global.Logger = require(path.join(process.cwd(), "/models/logger.js"));

describe("Tests for User Model", function(){
    const date = new Date("2015-01-01 0:0:0");
    const user1 = {
        id: 1,
        id_prefix: "u_",
        user_email: "user1@test.com", 
        first_name: "FirstN1", 
        last_name: "LastN1", 
        phone_number: "4031234567",
        address1: "ABC",
        password: "test1",
        address1_name: "ABC name",
        address1_latitude: 1,
        address1_longitude: 1,
	    birth_date: date,
    	card_token: "token",
	    card_type: "card_type",
	    card_digits: "1234",
    };

    const user2 = {
        id: 2,
        id_prefix: "u_",
        user_email: "user2@test.com", 
        first_name: "FirstN2", 
        last_name: "LastN2", 
        password: "test2", 
        phone_number: "4037654321",
        address1: "CBA",
        address1_name: "CBA name",
        address1_latitude: 2,
        address1_longitude: 2,
        birth_date: date,
    	card_token: "token",
	    card_type: "card_type",
	    card_digits: "1234",
    };

    // This user is used for update tests, do not expected these values to be the same across all tests
    const user3_update = {
        id: 3,
        id_prefix: "u_",
        user_email: "user3@test.com", 
        first_name: "FirstN3", 
        last_name: "LastN3", 
        password: "test3", 
        phone_number: "4037654321",
        address1: "CBA",
        address1_name: "CBA name",
        address1_latitude: 2,
        address1_longitude: 2,
        birth_date: date,
    	card_token: "token",
	    card_type: "card_type",
	    card_digits: "1234",
    };

    const guestUser1 = {
        id: 1,
        user_email: "guest1@test.com", 
        first_name: "GuestN1", 
        last_name: "GuestL2", 
        phone_number: "4037654321",
        birth_date: date,
        id_prefix: "g_"
    };

    /**
     * Before tests method
     * Setup DB for tests
     */
    before(function(done){
        // wait for db connection
        setTimeout(async function(){
            try{
                await deleteUsersFromDB(); // To have duplicate entries removed
                await addUsersToDB();
                done();                            
            } catch(e){
                done(e);
            }
        }, 1000);
    });

    /**
     * SanitizeUserObject method
     */
    describe("SanitizeUserObject method", function(){
        it("Password of user object should be deleted", function(){
            var sanitizedUser = userModel.sanitizeUserObject({
                name: "abc",
                email: "email@email.com",
                id: "1",
                password: "1234"
            });

            expect(sanitizedUser).to.not.have.property("password");
            expect(sanitizedUser).to.have.property("name");
            expect(sanitizedUser).to.have.property("id");
            expect(sanitizedUser).to.have.property("email");
        });
    });

    /**
     * FindUser method
     */
    describe("Tests for findUser(email) method", function(){
        it("Retrieve user - valid credentials", async function(){
            var actual = await userModel.findUser(user1.user_email);
            var expected = userModel.sanitizeUserObject(makeDeepCopy(user1));

            expect(actual).to.be.deep.equal(expected);
        });

        it("Retrieve user - nonvalid credentials", async function(){
            var actual = await userModel.findUser("invalid@email.com");
            var expected = false;

            expect(actual).to.be.equal(expected);
        });

        it("Retrieve user - given guest user credentials", async function(){
            var actual = await userModel.findUser(guestUser1.user_email);

            expect(actual).to.not.deep.equal(guestUser1);
        });
    });

    /**
     * FindUserById method
     */
    describe("Tests for FindUserById(id) method", function(){
        it("Retrieve user - valid credentials", async function(){
            var actual = await userModel.findUserById(user1.id);
            var expected = userModel.sanitizeUserObject(makeDeepCopy(user1));

            expect(actual).to.be.deep.equal(expected);
        });

        it("Retrieve user - nonvalid credentials", async function(){
            var actual = await userModel.findUserById(5);
            var expected = false;

            expect(actual).to.be.equal(expected);
        });

        it("Retrieve user - given guest user credentials", async function(){
            var actual = await userModel.findUserById(guestUser1.id);

            expect(actual).to.not.be.deep.equal(guestUser1);
        });
    });

     /**
     * addUser method
     */
    describe("Tests for addUser(userData) method", function(){
        it("Add user - valid user obj", async function(){
            // prepare user
            var userValid = makeDeepCopy(user1);
            delete userValid.id;
            userValid.user_email = "adduservalid@email.com";


            await userModel.addUser(userValid);
            
            var actual = await getUserQuery(userValid.user_email);
            if (actual && actual.length == 1) actual = actual[0];

            /* Normalize data */
            delete actual.id;
            

            expect(actual).to.be.deep.equal(userValid);
        });

        it("Add user - invalid user object", async function(){
            // prepare user
            var userInvalid = makeDeepCopy(user1);
            userInvalid.user_email = "adduserinvalid@email.com";
            userInvalid.invalid_field = "invalid_field";
            
            await userModel.addUser(userInvalid);
            var actual = await getUserQuery(userInvalid.user_email);

            expect(actual).to.be.deep.equal([]);
        });

        it("Add user - duplicate user object", async function(){
            // prepare user
            var userDuplicate = makeDeepCopy(user1);
            delete userDuplicate.id;
            var actual = await userModel.addUser(userDuplicate);

            expect(actual).to.be.equal(false);
        });
    });

    /**
     * authenticateUser method
     */
    describe("Tests for authenticateUser(email, password) method", function(){
        it("Valid user obj", async function(){
            var actual = await userModel.authenticateUser(user1.user_email, user1.password);
            
            var expected = makeDeepCopy(user1);
            delete expected.password;
            
            expect(actual).to.be.deep.equal(expected);
        });

        it("Invalid user obj - wrong pass", async function(){
            var actual = await userModel.authenticateUser(user1.user_email, "invalidPass");

            expect(actual).to.be.equal(false);
        });

        it("Invalid user obj - wrong email", async function(){
            var actual = await userModel.authenticateUser(user2.user_email, user1.password);

            expect(actual).to.be.equal(false);
        });
    });

     /**
     * FindGuestUser method
     */
    describe("Tests for findGuestUser(email) method", function(){
        it("Retrieve guest user - valid credentials", async function(){
            var actual = await userModel.findGuestUser(guestUser1.user_email);
            var expected = userModel.sanitizeUserObject(makeDeepCopy(guestUser1));
            expected.is_guest = true;

            expect(actual).to.be.deep.equal(expected);
        });

        it("Retrieve guest user - nonvalid credentials", async function(){
            var actual = await userModel.findGuestUser("invalid@test.com");
            var expected = false;

            expect(actual).to.be.equal(expected);
        });

        it("Retrieve guest user - given real user credentials", async function(){
            var actual = await userModel.findGuestUser(user1.user_email);
            var expected = false;

            expect(actual).to.not.deep.equal(user1);
        });
    });

    /**
     * FindGuestUserById method
     */
    describe("Tests for findGuestUserById(id) method", function(){
        it("Retrieve user - valid credentials", async function(){
            var actual = await userModel.findGuestUserById(guestUser1.id);
            var expected = userModel.sanitizeUserObject(makeDeepCopy(guestUser1));
            expected.is_guest = true;

            expect(actual).to.be.deep.equal(expected);
        });

        it("Retrieve user - nonvalid credentials", async function(){
            var actual = await userModel.findUserById(5);
            var expected = false;

            expect(actual).to.be.equal(expected);
        });

        it("Retrieve user - given real user credentials", async function(){
            var actual = await userModel.findGuestUserById(user1.id);

            expect(actual).to.not.be.deep.equal(user1);
        });
    });

    /**
     * addGuestUser method
     */
    describe("Tests for addGuestUser(userData) method", function(){
        it("Add user - valid guest user obj", async function(){
            // prepare user
            var userValid = makeDeepCopy(guestUser1);
            delete userValid.id;
            userValid.user_email = "guestUserNew@email.com";


            await userModel.addGuestUser(userValid);
            
            var actual = await getGuestUserQuery(userValid.user_email);
            if (actual && actual.length == 1) actual = actual[0];

            /* Normalize data */
            delete actual.id;

            expect(actual).to.be.deep.equal(userValid);
        });

        it("Add user - invalid guest user object", async function(){
            // prepare user
            var userInvalid = makeDeepCopy(guestUser1);
            userInvalid.user_email = "guestuserinvalid@email.com";
            userInvalid.invalid_field = "invalid_field";
            
            await userModel.addGuestUser(userInvalid);
            var actual = await getGuestUserQuery(userInvalid.user_email);

            expect(actual).to.be.deep.equal([]);
        });

        it("Add user - duplicate guest user object", async function(){
            // prepare user
            var userDuplicate = makeDeepCopy(guestUser1);
            delete userDuplicate.id;
            var actual = await userModel.addGuestUser(userDuplicate);

            expect(actual).to.be.equal(false);
        });
    });

    /**
     * FindUserByPhone method
     */
    describe("Tests for findUserByPhone(phone_number) method", function(){
        it("Valid user number - only one entry in db", async function(){
            var actual = await userModel.findUsersByPhone(user1.phone_number);
            
            var actual = await getGuestUserQuery(userValid.user_email);
            if (actual && actual.length == 1) actual = actual[0];

            /* Normalize data */
            delete actual.id;

            expect(actual).to.be.deep.equal(userValid);
        });
    });

    /**
     * After tests method
     * Clean up DB
     */
    after(async function(){
        try{
            await deleteUsersFromDB();
            await db.endConnection();        
        } catch(e){
            console.log("123");
        }
    });

    /* Helpers */
    async function deleteUsersFromDB(){
        await db.runQuery("Delete from " + db.tables.users_customers);
        await db.runQuery("Delete from " + db.tables.users_customers_guest);    }

    async function addUsersToDB(){
        var hashedPass = await Auth.hashPassword(user1.password);
        var tmpUser = Object.assign({}, user1, {password: hashedPass});
        await db.insertQuery(db.tables.users_customers, tmpUser);

        hashedPass = await Auth.hashPassword(user2.password);
        tmpUser = Object.assign({}, user2, {password: hashedPass});
        await db.insertQuery(db.tables.users_customers, tmpUser);

        await db.insertQuery(db.tables.users_customers_guest, guestUser1);
    }

    function makeDeepCopy(obj){
        return Object.assign({}, obj);
    }

    function getUserQuery(email){
        return db.runQuery("Select * from " + db.tables.users_customers + " where ?", {user_email: email});
    }

    function getGuestUserQuery(email){
        return db.runQuery("Select * from " + db.tables.users_customers_guest + " where ?", {user_email: email});
    }
});