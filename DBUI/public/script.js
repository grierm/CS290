// This adds the functionality to the add button
document.getElementById('addExerciseButton').addEventListener('click',function(event){
	
	// This will let us edit the form with exercises
	var addExercise = document.getElementById("addExercise");

	// Create a new request
	var req = new XMLHttpRequest();

	// This will set all of the parameters for the GET requests
	var parameters =    "exercise="+addExercise.elements.exercise.value+"&reps="+addExercise.elements.reps.value+
						"&weight="+addExercise.elements.weight.value+"&date="+addExercise.elements.date.value;
	
	// We use Kilograms by default, but if they check LBS we use that instead for units
	if(addExercise.elements.unitCheck.checked){
		parameters += "&unitCheck=1";
	}else{
		parameters += "&unitCheck=0";
	}

	// Opens an asynchronous GET request for the insert
	req.open("GET", "/insert?" + parameters, true);
	req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

	// Once it is loaded, at to the table
	req.addEventListener('load', function(){
		// Makes sure there are no errors in the status
		if(req.status >= 200 && req.status < 400){

			// Variable to save the response
			var response = JSON.parse(req.responseText);
			// Create the exercise id
			var id = response.inserted;

			
			var table = document.getElementById("exerciseTable");   //Save the table to add to it

			
			var row = table.insertRow(-1);                          //Variable so we can add to the table each time

			// If there isn't a name for the exercise, send error and return
			if (addExercise.elements.exercise.value == ""){
				console.log("Please enter a name for your exercise.");
				return;
			} 

			// Otherwise proceed with creating the data table

			// Retrieve the exercise name from the user and add to the table
			var exerciseName = document.createElement('td');
			exerciseName.textContent = addExercise.elements.exercise.value;
			row.appendChild(exerciseName);

			// Retrieve the reps from the user and add to the table
			var repAmount = document.createElement('td');
			repAmount.textContent = addExercise.elements.reps.value;
			row.appendChild(repAmount);

			// Retrieve the weight amount from the user and add to the table
			var weightAmount = document.createElement('td');
			weightAmount.textContent = addExercise.elements.weight.value;
			row.appendChild(weightAmount);

			// Retrieve the date the exercise is due from the user and add to the table
			var dateToDo = document.createElement('td');
			
			// As long as the date isn't blank, set it as DD-MM-YYYY
			if(addExercise.elements.date.value != ""){
				// Format the date by breaking out into substrings 
				var year = addExercise.elements.date.value.substring(0,4);
				var day = addExercise.elements.date.value.substring(5,7);
				var month = addExercise.elements.date.value.substring(8,10);

				// Put them together before adding it to the table
				var formattedDate = day + "-" + month + "-" + year;

				// Set the date table element to the new date format
				dateToDo.textContent = formattedDate;

				//dateToDo.textContent = addExercise.elements.date.value;
				row.appendChild(dateToDo);
			}
			
			// Create element for the units
			var unitMeasure = document.createElement('td');
			// Use pounds if it is checked
			if(addExercise.elements.unitCheck.checked){
				unitMeasure.textContent = "lbs";
			}else{
				// Otherwise we default to Kilograms because metric is 10x better
				unitMeasure.textContent = "kg";
			}
			// Add the units to the table
			row.appendChild(unitMeasure);
            
            	
			// This will add the update button to the table to update an exercise
			var updateExercise = document.createElement('td');
			var updateExerciseLink = document.createElement('a');

			// This redirects to the update page with the prepoulated data
			// This is the handlebars file in the views folder
			updateExerciseLink.setAttribute('href','/updateTable?id=' + id);

			// Make the actual button
			var updateButton = document.createElement('input');

			// Now we set the attributes and values for the button
			updateButton.setAttribute('value','Update');
            updateButton.setAttribute('type','button');         
			updateExerciseLink.appendChild(updateButton);
			updateExercise.appendChild(updateExerciseLink);

			// Add the button to the table
			row.appendChild(updateExercise);
            
   
			// This section is where we create the delete button to remove an excercise
			var deleteData = document.createElement('td');

			// Make the button 
			var deleteButton = document.createElement('input');

			// Set the value and attributes for the button
			deleteButton.setAttribute('type','button');
			deleteButton.setAttribute('name','delete');
			deleteButton.setAttribute('value','Delete');

			// When the button is clicked, delete data for that id
			deleteButton.setAttribute('onClick', 'deleteData("exerciseTable",' + id +')');
			/////////

			// Hide the input to remove from the database so we can keep track of id's
			var makeHidden = document.createElement('input');
			makeHidden.setAttribute('type','hidden');
			makeHidden.setAttribute('id', 'delete' + id);

			// Add these to the to the data cell
			deleteData.appendChild(deleteButton);
			deleteData.appendChild(makeHidden);

			// Add the button to the table row
			row.appendChild(deleteData);
		}else {
			// Otherise error out
	    	console.log("There has been an issue...");
		}
	});
	
	// Sends the insert request to the server
	req.send("/insert?" + parameters);

	// Standard to prevent reload
	event.preventDefault();
});

// This is the function to delete the data
function deleteData(tableId, id){
	// Use this variable to find the hidden ID so we can delete it
	var deleteElement = "delete" + id;
	// Save the table before
	var table = document.getElementById("exerciseTable");
	// Save how many rows
	var rowCount = table.rows.length;

	// Loop through the rows to find the data
	for(var i = 1; i < rowCount; i++){
		var row = table.rows[i];
		var findElement = row.getElementsByTagName("td");
		var elementToDelete = findElement[findElement.length -1];	
		// If the element to be deleted equals the one we are searching,
		// delete it	        
		if(elementToDelete.children[1].id === deleteElement){
			table.deleteRow(i);
		}
	}

	// Make a new request
	var request = new XMLHttpRequest();
	
	// Now open request so we can delete the data
	request.open("GET", "/delete?id=" + id, true);

	request.addEventListener("load",function(){
		// Check if there were any errors
		if(request.status >= 200 && request.status < 400){
			console.log('Thats deleted!');
		// If there is one... log that there is
		}else{
		    console.log('uh oh... We had an issue deleting the data');
		}
	});

	// Send the delete request
	request.send("/delete?id=" + id);

}

// Format the data table
var dataTable = document.getElementById("exerciseTable").style.borderStyle = "solid";

// Set the style for the header data cells
var tableCells = document.getElementsByTagName("th");
for (var i = 0; i < tableCells.length; i++) {
	tableCells[i].style.borderStyle = "solid";
	tableCells[i].style.backgroundColor = "lightgrey";
}

// Now set the data cells style
tableCells = document.getElementsByTagName("td");
for (var i = 0; i < tableCells.length; i++) {
	tableCells[i].style.borderStyle = "solid";
}

