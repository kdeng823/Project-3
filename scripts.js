let questions = [];
let user = "";

/*Time Elapse Clock*/
let seconds = 0;
let minutes = 0;
let hours = 0;
let displaySeconds = 0;
let displayMinutes = 0;
let displayHours = 0;
let interval = null;
let status = "stopped";

function clock() {
  seconds++;
  if (seconds / 60 === 1) {
    seconds = 0;
    minutes++;

    if (minutes / 60 === 1) {
      minutes = 0;
      hours++;
    }
  }
  if (seconds < 10) {
    displaySeconds = "0" + seconds.toString();
  }
  else {
    displaySeconds = seconds;
  }

  if (minutes < 10) {
    displayMinutes = "0" + minutes.toString();
  }
  else {
    displayMinutes = minutes;
  }

  if (hours < 10) {
    displayHours = "0" + hours.toString();
  }
  else {
    displayHours = hours;
  }
  document.getElementById("clock").innerHTML = displayHours + ":" + displayMinutes + ":" + displaySeconds;
}

function startstopClock(){

  if(status === "stopped"){
      interval = window.setInterval(clock, 1000);
      status = "started";
  }
  else{
      window.clearInterval(interval);
      status = "stopped";
  }
}

function resetClock(){
  window.clearInterval(interval);
  seconds = 0;
  minutes = 0;
  hours = 0;
  document.getElementById("clock").innerHTML = "00:00:00";
  document.getElementById("startStopClock").innerHTML = "Start";
}

function f1() {
  var quiz1 = document.getElementById("quiz1");
  var quiz2 = document.getElementById("quiz2");

  if (quiz1.checked == true)
    fetch("quiz1.json")
      .then(res => {
        console.log(res);
        return res.json();
      }).then(loaded_questions => {
        console.log(loaded_questions);
        questions = loaded_questions;
      })
      .catch(err => {
        console.error(err);
      });
  else if (quiz2.checked == true)
    fetch("quiz2.json")
      .then(res => {
        console.log(res);
        return res.json();
      }).then(loaded_questions => {
        console.log(loaded_questions);
        questions = loaded_questions;
      })
      .catch(err => {
        console.error(err);
      });
  else
    alert("Please select a quiz.");
  return false;
}


// appState, keep information about the State of the application.
const appState = {
  current_view: "#intro_view",
  current_question: -1,
  current_model: {},
  current_score: 0,
  answered_questions: 0
}

//
// start_app: begin the applications.
//

document.addEventListener('DOMContentLoaded', () => {
  // Set the state
  appState.current_view = "#intro_view";
  appState.current_model = {
    action: "Start"
  }
  update_view(appState);

  //
  // EventDelegation - handle all events of the widget
  //

  document.querySelector("#widget_view").onclick = (e) => {
    handle_widget_event(e)
  }
});



function handle_widget_event(e) {

  if (appState.current_view == "#intro_view") {
    if (e.target.dataset.action == "Start") {

      // Update State (current model + state variables)
      appState.current_question = 0
      user = document.querySelector("#name").value;

      appState.current_model = questions[appState.current_question];
      // process the appState, based on question type update appState.current_view
      setQuestionView(appState);

      // Now that the state is updated, update the view.

      update_view(appState);

      updateScoreHud(appState);
    }
  }


  if (appState.current_view == "#question_view_multiple_choice") {

    if (e.target.dataset.action == "answer") {
      user_response = e.target.dataset.answer;
    }
    if (e.target.dataset.action == "submit") {
      check_user_response(user_response, appState.current_model)
    }
  }


  // Handle answer event for true/false questions.
  if (appState.current_view == "#question_view_true_false") {

    if (e.target.dataset.action == "answer") {
      user_response = e.target.dataset.answer;
    }
    if (e.target.dataset.action == "submit") {
      check_user_response(user_response, appState.current_model)
    }
  }


  // Handle answer event for text questions.
  if (appState.current_view == "#question_view_text_input") {
    if (e.target.dataset.action == "submit") {
      user_response = document.querySelector(`#${appState.current_model.answerFieldId}`).value;
      check_user_response(user_response, appState.current_model)
    }
  }


  // Handle the answer for multiple correct. 
  if (appState.current_view == "#question_view_dropdown_selection") {

    if (e.target.dataset.action == "submit") {
      var selectValue = document.getElementById("list").value;
      user_response = selectValue
      check_user_response(user_response, appState.current_model)
    }
  }

  //Handle the answer for image selection
  if (appState.current_view == "#question_view_image_selection") {
    if (e.target.dataset.action == "answer") {
      user_response = e.target.dataset.answer;
    }
    if (e.target.dataset.action == "submit") {
      check_user_response(user_response, appState.current_model)
    }
  }

  if (appState.current_view == "#feedback_view_incorrect") {
    if (e.target.dataset.action == "next") {
      updateQuestion(appState);
    }
  }


  // Handle end_view.
  if (appState.current_view == "#end_view") {
    startstopClock();
    let final_Score = ((appState.current_score / appState.answered_questions) * 100);
    if (final_Score < 80) {
      document.getElementById("finalMessage").innerHTML = "Final Score: " + final_Score + "% <br> Unfortunately " + user + ", you failed the quiz.";
    }
    else {
      document.getElementById("finalMessage").innerHTML = "Final Score: " + final_Score + "% <br>" + "You passed the quiz " + user + " !";
    }
    if (e.target.dataset.action == "Start_Again") {
      appState.current_question = 0
      appState.current_score = 0
      appState.answered_questions = 0
      appState.current_model = questions[appState.current_question];
      // process the appState, based on question type update appState.current_view
      setQuestionView(appState);

      // Now that the state is updated, update the view.

      update_view(appState);
      resetClock();
      startstopClock();
      updateScoreHud(appState)

    }
    if (e.target.dataset.action == "intro_page") {
      appState.current_score = 0
      appState.answered_questions = 0
      appState.current_view = "#intro_view";
      appState.current_model = {
        action: "Start"
      }
      update_view(appState);
      resetClock();
    }
  }

} // end of handle_widget_event

function check_user_response(user_answer, model) {
  if (user_answer == model.correctAnswer) {
    appState.current_score++;
    document.querySelector("#widget_view").innerHTML = `
    <div class="container">
    <h2>Good Work!</h2>
    </div>`
    setTimeout(() => {
      updateQuestion(appState);
    }, 1000);
  }
  else {
    appState.current_view = "#feedback_view_incorrect";
    update_view(appState);
  }
  appState.answered_questions++;
  updateScoreHud(appState);
}


function updateQuestion(appState) {
  if (appState.current_question < questions.length - 1) {
    appState.current_question = appState.current_question + 1;
    appState.current_model = questions[appState.current_question];
  }
  else {
    appState.current_question = -2;
    appState.current_model = {};
  }
  setQuestionView(appState);
  update_view(appState);
}

function setQuestionView(appState) {
  if (appState.current_question == -2) {
    appState.current_view = "#end_view";
    return
  }
  if (appState.current_model.questionType == "multiple_choice") {
    appState.current_view = "#question_view_multiple_choice";
  }
  else if (appState.current_model.questionType == "true_false") {
    appState.current_view = "#question_view_true_false";
  }
  else if (appState.current_model.questionType == "text_input") {
    appState.current_view = "#question_view_text_input";
  }
  else if (appState.current_model.questionType == "dropdown_selection") {
    appState.current_view = "#question_view_dropdown_selection";
  }
  else if (appState.current_model.questionType == "image_selection") {
    appState.current_view = "#question_view_image_selection";
  }
}

function updateScoreHud(appState) {
  document.querySelector("#questions_answered").querySelector("p").innerHTML = `Questions: ${appState.answered_questions}`;
  var accuracy = Math.floor((appState.current_score / appState.answered_questions) * 100);
  document.querySelector("#current_score").querySelector("p").innerHTML = `Score: ${accuracy} %`;
}

function update_view(appState) {
  const html_element = render_widget(appState.current_model, appState.current_view)
  document.querySelector("#widget_view").innerHTML = html_element;
}


const render_widget = (model, view) => {
  // Get the template HTML
  template_source = document.querySelector(view).innerHTML
  // Handlebars compiles the above source into a template
  var template = Handlebars.compile(template_source);

  // apply the model to the template.
  var html_widget_element = template({ ...model, ...appState })

  return html_widget_element
}
