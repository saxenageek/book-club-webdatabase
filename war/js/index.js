$(window).load(function(){
	
	if ($.cookie("logged_user") != undefined){
		localStorage.clear();
		document.getElementById("login").style.display = 'none';
		document.getElementById("userName").innerHTML = "<b>" + $.cookie("logged_user_msg") + "</b>"
		+ "&nbsp;<a href=\"Javascript:logout();\">logout</a>";
		
		loadBookData();		
	}else if($.cookie('loggedout') == undefined){
		$('#myModal').modal('show');
	}
});

function loadBookData(){
	var query = "select * from books " +
				"where " +
				"title IN " + 
				"(SELECT title FROM issue WHERE status = 'issued');";

	var db = openDatabase('Library', '1.0', 'Basic Library', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql(query, [], function (tx, results) {
			var len = results.rows.length, i;
			console.log(len);
			if(results.rows.length == 0){
				localStorage.setItem("tablesize","0");
				$('#issuedBooksDiv').css('display','none');
				return;
			}
			else{
				$('#issuedBooksDiv').css('display','block');
			}
			var tblBody = document.createElement("tbody");
			for (i = 0; i < len; i++){
				var row = $("<tr><td width=\"3%\"><input name=\"rec\" type=\"radio\" onchange=\"setLocal(event);\"></td><td width=\"20%\">"
						+results.rows.item(i).title+"</td><td width=\"20%\">"
						+results.rows.item(i).author+"</td><td width=\"15%\">"
						+results.rows.item(i).genre+"</td><td width=\"15%\">"
						+results.rows.item(i).year+"</td><td width=\"15%\">"
						+results.rows.item(i).owner+"</td><td width=\"15%\"><a href=\"#\" onclick=\"returnBook(event);\">Return</a></td></tr>");
				$('#issuedBooks').append(row);
			}
			
			$('#issuedBooks').tableutils( {
				fixHeader: { width: 900, height: 260 }, 				 
				paginate: { type: 'numeric', pageSize: 5 },	
				sort: { type: [ 'alphanumeric', 'alphanumeric' , 'alphanumeric', 'numeric', 'alphanumeric'] },
				
				columns: [ { label: ''},				       
				           { label: 'Title', name: 'title' },
				           { label: 'Author', name: 'author'},
				           { label: 'Genre', name: 'genre' }, 
				           { label: 'Year', name: 'year' },
				           { label: 'Owner', name: 'owner' },
				           { label: ''},
				           ]
			} );
		}, null);
	});
	localStorage.clear();
}


function setLocal(event){
	var tr = event.srcElement.parentNode.parentNode;
	localStorage.setItem("edit_title",tr.cells[1].innerText);
	localStorage.setItem("edit_author",tr.cells[2].innerText);
	localStorage.setItem("edit_genre",tr.cells[3].innerText);
	localStorage.setItem("edit_year",tr.cells[4].innerText);
	localStorage.setItem("edit_owner",tr.cells[5].innerText);
}

function returnBook(event){
	var tr = event.srcElement.parentNode.parentNode;
	var selected = tr.cells[1].innerText;

	var return_date = new Date();
	return_date = return_date.toString("dd-MMM-yyyy");

	if(localStorage.getItem("edit_title") != null){
		if(selected != localStorage.getItem("edit_title")){
			alert("Please click on return link on the same row which you have selected.");
			return;
		}
		
		var msg = "Are you sure you want to return the book '"+ localStorage.getItem("edit_title") +"'. Press OK to return book.";
		var ans = confirm(msg);
		if(ans == true){
			var query = "UPDATE issue SET status='returned' WHERE title='"+selected+"'";
			var db = openDatabase('Library', '1.0', 'Basic Library', 2 * 1024 * 1024);
			db.transaction(function (tx) {
				tx.executeSql(query);
			});
			alert("Your book has been returned successfully.");
			location.reload(true);
		}
		else{
			return;
		}
	}
	else{
		alert("Please select some book to return.");
	}
}

function openBooks(){
	if ($.cookie("logged_user") != undefined){
		window.open("books.html", "_parent");
	}
	else
		return;
}