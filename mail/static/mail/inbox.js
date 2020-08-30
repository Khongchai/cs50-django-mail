var recipients;
var subject;
var message;
var form;
var submitButton;
var mailsContainer;
var mailDetails;
var archiveButton;



document.addEventListener('DOMContentLoaded', function() {
  recipients = document.querySelector('#compose-recipients');
  subject = document.querySelector('#compose-subject');
  message = document.querySelector('#compose-body');
  form = document.querySelector('#compose-form');
  submitButton = document.querySelector('#submitButton');
  mailsContainer = document.querySelector("#mailsContainer");
  mailDetails = document.querySelector("#mailDetails");
  archiveButton = document.getElementById("archiveButton");

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
  message.innerHTML = '';
}

function load_mailbox(mailbox) 
{
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#compose-view-head").innerHTML = "New Email";
  document.querySelector('#emails-title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  load_inbox(mailbox);
    
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
      body: message.innerHTML
    })
  })
  .then(response => response.json())
  .then(result=>
    {
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


function load_inbox(mailName)
{

  fetch(`/emails/${mailName}`)
.then(response => response.json())
.then(emails => {
    mailDetails.style.display = "none";
    mailsContainer.innerHTML = '';
    mailsContainer.style.display = "block";
    for (let i = 0; i < emails.length; i++)
    {

      var mainDiv = document.createElement('div');
      mainDiv.className = "EmailContainer";
      if (emails[i].read)
      {
        mainDiv.style.background = "grey";
      }
      if (!emails[i].archived)
      {
        archiveButton.innerHTML = "Archive";
      }
      else
      {
        archiveButton.innerHTML = "Remove from archive";
      }

      var sender = document.createElement('div');
      sender.className = "EmailFlex";
      sender.innerHTML = `<h5>${emails[i].sender}</h5>`;

      var subject = document.createElement('div');
      subject.className = "EmailFlex";
      subject.innerHTML = emails[i].subject;

      var dateTime = document.createElement('div');
      dateTime.className = "EmailFlex FloatRight";
      dateTime.innerHTML = emails[i].timestamp;

      mainDiv.style.cursor = "pointer";
      mainDiv.addEventListener("click", function() {
      this.style.background = "grey";
      mailsContainer.style.display = "none";
      mailDetails.style.display = "block";
      
      document.getElementById("fromBlock").innerHTML = emails[i].sender;
      document.getElementById("toBlock").innerHTML = emails[i].recipients;
      document.getElementById("subjectBlock").innerHTML = emails[i].subject;
      document.getElementById("sentBlock").innerHTML = emails[i].timestamp;
      document.getElementById("messageBlock").innerHTML = emails[i].body;
      archiveButton.onclick = function()
      {
        //pass in an inverted bool value at the end to remove from archive
        changeReadStat(emails[i].id, "archive", !emails[i].archived);
      };

      //call a view in python to change the read status
      changeReadStat(emails[i].id, "read");
        
      });
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

function changeReadStat(emailID, operation, bool)
{
  if (operation === "read")
  {
    fetch(`/emails/${emailID}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  }
  else if (operation === "archive")
  {
    fetch(`/emails/${emailID}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: bool
      })
    }).then(respond => {
      if (respond.status == 204)
      {
        load_mailbox(operation);
      }
    });

  }
}

function reply()
{
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#compose-view-head").innerHTML = "Reply";

  recipients.value = document.getElementById("fromBlock").innerHTML;
  subject.value = document.getElementById("subjectBlock").innerHTML;
  let subjectPattern = /(Re:).*/;
  if (!subjectPattern.test(subject.value))
  {
    subject.value = `Re: ${subject.value}`;
  }

  
  let mainMessage = document.getElementById("messageBlock").innerHTML;
  let timeStamp = document.getElementById("sentBlock").innerHTML;
  let heading = `<div>On ${timeStamp} ${recipients.value} wrote:</div><br>`;
  let finalBody = `${heading} ${mainMessage}`;
  message.innerHTML = `${finalBody}`;
}

