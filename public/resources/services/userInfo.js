app.service('user', ["$cookies", function ($cookies) {

    var publicFunctions = {};


    publicFunctions.isUserLogged = function(){
        if (getUser()){
            return true;
        } else {
            return false;
        }
    }


    publicFunctions.getName = function(){
        if (!publicFunctions.isUserLogged()){
            return undefined;
        }

        var user = getUser();
        return user.first_name;
    }



    function getUser(){
        try{
            return JSON.parse($cookies.get("user").replace("j:", ""));
        } catch(e){
            return false;
        }
    }


    return publicFunctions;
}]);
    