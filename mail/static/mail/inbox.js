var recipients;
var subject;
var message;
var form;
var submitButton;
var mailsContainer;
var mailDetails;


document.addEventListener('DOMContentLoaded', function() {
  recipients = document.querySelector('#compose-recipients');
  subject = document.querySelector('#compose-subject');
  message = document.querySelector('#compose-body');
  form = document.querySelector('#compose-form');
  submitButton = document.querySelector('#submitButton');
  mailsContainer = document.querySelector("#mailsContainer");
  mailDetails = document.querySelector("#mailDetails");

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  submitButton.addEventListener("click", send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  recipients.value = '';
  subject.value = '';
  message.value = '';
}

function load_mailbox(mailbox) 
{
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // Show the mailbox name
  //might have to populate emaisl to the div through javascript
  switch(mailbox)
  {
    
    case ("inbox"):
      load_inbox();
      break;
    case ("sent"):
      load_sent();
      break;
    case ("archive"):
      load_archive();
      break;
    default:
      //do nothing
  }
    
}

function send_email()
{
  fetch('/emails', 
  {
    method: "POST",
    body: JSON.stringify
    ({
      recipients: recipients.value,
      subject: subject.value, 
      body: message.value
    })
  })
  .then(response => response.json())
  .then(result=>
    {
      console.log(result);
      if (result["error"] != undefined)
      {
        alert(result["error"]);
        return false;
      }
      else if (result["message"] != undefined)
      {
        alert(result["message"]);
        load_mailbox('sent');
        return false;
      }
      
    });

}
//this function takes care of populating mailbox
function load_inbox()
{
  fetch('/emails/inbox')
.then(response => response.json())
.then(emails => {
    // Print emails
    console.log(emails);
    mailDetails.style.display = "none";
    mailsContainer.style.display = "block";
    for (let i = 0; i < emails.length; i++)
    {
      //check if status is archived, if archived, skip to next loop

      //generate container for each of the mail
      var mainDiv = document.createElement('div');
      mainDiv.className = "EmailContainer";

      //populate with the appropriate headings
      var sender = document.createElement('div');
      sender.className = "EmailFlex";
      sender.innerHTML = `<h5>${emails[i].sender}</h5>`;

      var subject = document.createElement('div');
      subject.className = "EmailFlex";
      subject.innerHTML = emails[i].subject;

      var dateTime = document.createElement('div');
      dateTime.className = "EmailFlex FloatRight";
      dateTime.innerHTML = emails[i].timestamp;

      //on click load mail through JSON get
      mainDiv.style.cursor = "pointer";
      mainDiv.addEventListener("click", () => {
        mailsContainer.style.display = "none";
        mailDetails.style.display = "block";

        document.getElementById("fromBlock").innerHTML = emails[i].sender;
        document.getElementById("toBlock").innerHTML = emails[i].recipients;
        document.getElementById("subjectBlock").innerHTML = emails[i].subject;
        document.getElementById("sentBlock").innerHTML = emails[i].timestamp;
        document.getElementById("contentBlock").innerHTML = emails[i].body;
        
        
      });

      //append to the parent div
      mainDiv.appendChild(sender);
      mainDiv.appendChild(subject);
      mainDiv.appendChild(dateTime);
      mailsContainer.appendChild(mainDiv);
      
      
    }
    
    
  });
}

function reloadMailsContainer()
{
  mailsContainer.style.display = "block";
  mailDetails.style.display = "none";
}


function load_archive()
{

}

function load_sent()
{

}

