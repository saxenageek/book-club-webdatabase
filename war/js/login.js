$(window).load(function(){
	if ($.cookie("logged_user") != undefined){
		document.getElementById("login").style.display = 'none';
		document.getElementById("userName").innerHTML = "<b>" + $.cookie("logged_user_msg") + "</b>"
		+ "&nbsp;<a href=\"Javascript:logout();\">logout</a>";
	}else if($.cookie("loggedout") == undefined){
		$('#myModal').modal('show');
	}
});

function closeDialog() {
	$('#myModal').modal('hide');
};

function login(){
	$('#myModal').modal('show');
}

function loginClicked() {
	var login_ldap = document.getElementsByName("ldap")[0].value;
	var login_passwd = document.getElementsByName("passwd")[0].value;
	var logged_user = DCTeam({ldap:login_ldap, password:login_passwd}).first();
	if(!logged_user){
		if(document.getElementsByName("ldap")[0].readOnly){
			alert("Invalid Password .. Try again");	
		}
		else{
			alert("Invalid Username/Password .. Try again");
		}
		return;
	}
	else{
		console.log("Logged_user : " + logged_user.ldap);
	}

	var login_msg1 = "";
	var login_msg2 = "";
	if (logged_user.gender == "M") {
		login_msg1 += "Welcome Mr. ";
	}
	if (logged_user.gender == "F") {
		login_msg1 += "Welcome Ms. ";
	}

	login_msg2 += logged_user.first + " ";
	if (logged_user.middle != "") {
		login_msg2 += logged_user.middle + " ";
	}
	if (logged_user.last != "") {
		login_msg2 += logged_user.last + " ";
	}
	alert("Login Successfull .. " + login_msg1 + $.trim(login_msg2));

	$.cookie("logged_user", logged_user.ldap, { path: '/', expires:7 });
	$.cookie("logged_user_msg", login_msg1 + $.trim(login_msg2), { path: '/', expires:7 });
	
	document.getElementById("login").style.display = 'none';
	document.getElementById("userName").innerHTML = "<b>" + login_msg1 + $.trim(login_msg2) + "</b>"
	+ "&nbsp;<a href=\"Javascript:logout();\">logout</a>";
	closeDialog();
};

function checkUser(){
	var login_ldap = document.getElementsByName("ldap")[0].value;
	var logged_user = DCTeam({ldap:login_ldap}).first();
	if(logged_user){
		document.getElementsByName("ldap")[0].readOnly = true;
	}
}

function enableAgain(){
	document.getElementsByName("ldap")[0].readOnly = false;
}

function logout(){
	var ans = confirm("Are you sure you want to logout?");
	if (ans == true)
	{
		$.removeCookie('logged_user', { path: '/' });
		$.removeCookie('logged_user_msg', { path: '/' });
		//$.cookie("logged_user", null);
		//$.cookie("logged_user_msg", null);
		$.cookie("loggedout", "logout", { path: '/', expires:1 });
		document.getElementById("login").style.display = 'block';
		localStorage.clear();
		window.open("index.html","_parent");
	}
	else{
		return;
	}
}
