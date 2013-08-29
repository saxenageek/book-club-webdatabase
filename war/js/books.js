$(window).load(function(){
	document.getElementById('files').addEventListener('change', handleFileSelect, false);
	if ($.cookie("logged_user") != undefined){
		console.log($.cookie("logged_user"));
		var db = openDatabase('Library', '1.0', 'Basic Library', 2 * 1024 * 1024);
		db.transaction(function (tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS books (title TEXT, author TEXT, genre TEXT, year TEXT, owner TEXT, qty INT)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS issue (title TEXT, issued_by TEXT, owner TEXT, status TEXT, issue_date TEXT, due_date TEXT, return_date TEXT)');
		});
		localStorage.clear();
		document.getElementById("login").style.display = 'none';
		document.getElementById("userName").innerHTML = "<b>" + $.cookie("logged_user_msg") + "</b>"
		+ "&nbsp;<a href=\"Javascript:logout();\">logout</a>";
		
		loadBookData();		
	}else if($.cookie("loggedout") == undefined){
		$('#myModal').modal('show');
	}
});

document.onmousedown=disablerightclick;
var status = "Right click is disabled";
function disablerightclick(event)
{
	if(event.button==2)
	{
		alert(status);
		return false;    
	}
}

function setLocal(event){
	var tr = event.srcElement.parentNode.parentNode;
	localStorage.setItem("edit_title",tr.cells[1].innerText);
	localStorage.setItem("edit_author",tr.cells[2].innerText);
	localStorage.setItem("edit_genre",tr.cells[3].innerText);
	localStorage.setItem("edit_year",tr.cells[4].innerText);
	localStorage.setItem("edit_owner",tr.cells[5].innerText);
}

function editRecord(msg){
	if(msg == "update"){
		localStorage.setItem("mode","update");
		if(localStorage.getItem("edit_title") != null){
			$('#edit_author').val(localStorage.getItem("edit_author")); 
			$('#edit_genre').val(localStorage.getItem("edit_genre")); 
			$('#edit_year').val(localStorage.getItem("edit_year"));
			$('#edit_title').val(localStorage.getItem("edit_title"));
			$('#edit_owner').val(localStorage.getItem("edit_owner"));
			openModal("editModal");
		}
		else{
			alert("Please select some record to edit.");
		}
	}
	else if(msg == "new"){
		localStorage.setItem("mode","new");
		openModal("editModal");
	}
}

function openModal(id){
	$('#' + id).modal('show');
}

function deleteRecord(){
	if(localStorage.getItem("edit_title") != null){
		var ans = confirm("Are you sure you want to delete " + localStorage.getItem("edit_title") + " ?");
		if (ans == true)
		{
			var query = "DELETE FROM books WHERE title='" + localStorage.getItem("edit_title") + "';";

			var db = openDatabase('Library', '1.0', 'Basic Library', 2 * 1024 * 1024);
			db.transaction(function (tx) {
				tx.executeSql(query);
			});			

			alert("Book Deleted Successfully.");
			localStorage.clear();
			location.reload(true);
		}
		else
		{
			return;
		}
	}
	else{
		alert("Please select some record to delete.");
	}
}

function deleteAllRecords(){
	var ans = confirm("Are you sure you want to delete all records?");
	if (ans == true)
	{
		var again = confirm("This action cannot be reversed.. Want to delete anyways ?");
		if(again == true){
			var query = "DELETE FROM books WHERE 1=1";

			var db = openDatabase('Library', '1.0', 'Basic Library', 2 * 1024 * 1024);
			db.transaction(function (tx) {
				tx.executeSql(query);
			});			

			alert("All Books Deleted Successfully.");
			localStorage.clear();
			location.reload(true);
	
		}
		else{
			return;
		}
	}
	else
	{
		return;
	}	
}

function closeModal(id){
	$('#' + id).modal('hide');
}

function saveEditedBook(){
	if(localStorage.getItem("mode") == "update"){
		var query = "UPDATE books SET title='"+
		$('#edit_title').val()+"', author='"+
		$('#edit_author').val()+"', genre='"+
		$('#edit_genre').val()+"', year='"+
		$('#edit_year').val()+"', owner='"+
		$('#edit_owner').val()+"' WHERE title='"+localStorage.getItem("edit_title")+"'";

		var db = openDatabase('Library', '1.0', 'Basic Library', 2 * 1024 * 1024);
		db.transaction(function (tx) {
			tx.executeSql(query);
		});

		alert("Book Details Saved Successfully.");
	}
	else if(localStorage.getItem("mode") == "new"){
		var query = "INSERT INTO books (title, author, genre, year, owner, qty) VALUES ('"
			+$('#edit_title').val()+"', '"
			+$('#edit_author').val()+"', '"
			+$('#edit_genre').val()+"', '"
			+$('#edit_year').val()+"', '"
			+$('#edit_owner').val()+"', 1)";
		var db = openDatabase('Library', '1.0', 'Basic Library', 2 * 1024 * 1024);
		db.transaction(function (tx) {
			tx.executeSql(query);
		});

		alert("Book Details Saved Successfully.");	
	}
	localStorage.clear();
	location.reload(true);
	closeModal("editModal");
}

function loadBookData(){
	var query = "select * from books " +
				"where " +
				"title NOT IN " + 
				"(SELECT title FROM issue WHERE status = 'issued');";
	console.log(query);
	var db = openDatabase('Library', '1.0', 'Basic Library', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql(query, [], function (tx, results) {
			var len = results.rows.length, i;
			var tblBody = document.createElement("tbody");
			for (i = 0; i < len; i++){
				var row = $("<tr><td width=\"3%\"><input name=\"rec\" type=\"radio\" onchange=\"setLocal(event);\"></td><td width=\"20%\">"
						+results.rows.item(i).title+"</td><td width=\"20%\">"
						+results.rows.item(i).author+"</td><td width=\"15%\">"
						+results.rows.item(i).genre+"</td><td width=\"15%\">"
						+results.rows.item(i).year+"</td><td width=\"15%\">"
						+results.rows.item(i).owner+"</td><td width=\"15%\"><a href=\"#\" onclick=\"issueBook(event);\">Issue</a></td></tr>");
				$('#books').append(row);
			}
			
			$('#books').tableutils( {
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

//<!--add multiple files function -->
function handleFileSelect(evt) {
	var files = evt.target.files;

	for (var i = 0, f; f = files[i]; i++) {
		var reader = new FileReader();

		reader.onload = (function(theFile) {
			return function(e) {
				var data = e.target.result.split("\n");
				var itemid = 0;
				var db = openDatabase('Library', '1.0', 'Basic Library', 2 * 1024 * 1024);

				db.transaction(function (tx) {
					for(var i=0;i<data.length;i++){
						var row = data[i].split("\t");
						if(row[0]!="" && row[1] !=undefined && row[1]!=""){
							var query = "INSERT INTO books (title, author, genre, year, owner, qty) VALUES ('"
								+row[0]+"', '"
								+row[1]+"', '"
								+row[2]+"', '"
								+row[3]+"', '"
								+row[4]+"', 1);";

							tx.executeSql(query);
						}
					}
				});
				alert("Book Details Saved Successfully.");
				localStorage.clear();
				location.reload(true);
				closeModal("uploadModal");
			};
		})(f);

		reader.readAsText(f);
	}
}
//<!--add multiple files function -->

//<!--export to excel function -->
var tableToExcel = (function() {
	  var uri = 'data:application/vnd.ms-excel;base64,'
	    , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
	    , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))); }
	    , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
	  return function(table, name) {
	    if (!table.nodeType) table = document.getElementById(table)
	    var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
	    window.location.href = uri + base64(format(template, ctx));
	  }
})();
//<!--export to excel function -->

function issueBook(event){
	var tr = event.srcElement.parentNode.parentNode;
	var selected = tr.cells[1].innerText;
	var owner = tr.cells[5].innerText;
	var issue_date = new Date();
	var duedate = new Date();
	duedate.setDate(issue_date.getDate()+14);
	
	duedate = duedate.toString("dd-MMM-yyyy");
	issue_date = issue_date.toString("dd-MMM-yyyy");
	if(localStorage.getItem("edit_title") != null){
		if(selected != localStorage.getItem("edit_title")){
			alert("Please click on issue link on the same row which you have selected.");
			return;
		}
		
		var msg = "The book '"+ localStorage.getItem("edit_title") +"' will be issued to you for 14 days. Your due date is " + duedate
			+ ". Press OK to issue book.";
		var ans = confirm(msg);
		if(ans == true){
			var query = "INSERT INTO issue VALUES('"+selected+"','"+$.cookie("logged_user")+"','"+owner+"','issued','"+issue_date+"','"+duedate+"','')";
			console.log(query);
			var db = openDatabase('Library', '1.0', 'Basic Library', 2 * 1024 * 1024);
			db.transaction(function (tx) {
				tx.executeSql(query);
			});
			alert("Your book has been issued successfully.");
			location.reload(true);
		}
		else{
			return;
		}
	}
	else{
		alert("Please select some book to issue.");
	}
}