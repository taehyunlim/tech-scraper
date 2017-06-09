// Grab the articles as a json
$.getJSON("/all", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<h6 data-id='" + data[i].id + "'>" 
      + "<a href='" + data[i].link + "'>" + data[i].title + "</a></h6>" 
      + "<span id='timestamp'>" + data[i].time + "</span>"
      + "<code>" + data[i].tag + "</code><span id='note' class='button' data-id='" + data[i].id + "'>NOTE</span><p>" + data[i].excerpt + "</p>");
  }
});


// Whenever someone clicks a p tag
$(document).on("click", "span#note", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<span>Leave a note for...</span></br><h6>" + data.title + "</h6>");
      // Include a new div for saved notes and append note's title and body
      $("#notes").append("<p class='note-header'>Saved note</p>").append("<div id='saved-notes'>");
      var noteTitle = $("<p id='noteTitle' style='font-style: italic; font-weight: medium;'>");
      var noteBody = $("<p id='noteBody' style='font-size: 13px;'>");
      $("#saved-notes").append(noteTitle);
      $("#saved-notes").append(noteBody);
      // An input to enter a new title
      $("#notes").append("<p class='note-header'>Input note</p>").append("<input id='titleinput' name='title' placeholder='Note title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body' placeholder='Note body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data.id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        //// Place the title of the note in the title input
        //$("#titleinput").val(data.note.title);
        $("#noteTitle").html(data.note.title);
        $("#noteBody").html(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      if (data) {
        $("#noteTitle").html(data.title);
        $("#noteBody").html(data.body);
      }
      // Empty the notes section
      //$("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
