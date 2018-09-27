Stamplay.User.login({
    email : username,
    password: password
}).then(function(res) {
    // NOTE: the Stamplay SDK saves the jwt token to localStorage using the root url + '-jwt' as the key. EXAMPLE: "http://ngadmin-jwt": [token]
    // save user values to localStorage
    window.localStorage.setItem('user', JSON.stringify(res));
    
    // set response equal to user
    var user = res;
    console.log('Logged User:', user);
    
    window.localStorage.setItem('username', user.displayName);

    // get current user's ID
    var userId = user._id;
    console.log('Logged Users ID:', userId);
                
    // get current user's role
    var userRole = user.givenRole;
    console.log('User Role??', userRole);
    
    // if user is ADMIN redirect to the home page of the admin app, otherwise stay on login page and alert

    if (userRole == '58b882eab9776b3046a2f29f') {
        window.location.href = "./index.html";
    } else {
        window.localStorage.removeItem('user');
        window.localStorage.removeItem('username');
        var url = window.location.origin;
        if(window.localStorage[url+"-jwt"]){
            window.localStorage.removeItem(url + "-jwt");
        }
        window.localStorage.removeItem(url + "-jwt");
        bootbox.alert({
            title: "Andrisani Sports Admin",
            message: "You must be an Administrator to access this content."
                    });
    }
    
}, function(err) {
    bootbox.alert({
    	title: "Login Failed",
    	message: "An error occurred while attempting to authenticate. Please be sure your email and password are valid."
    });
});