const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
var hasPlayed = false;

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

//Image clicked by anyone
//give user notification, album was clicked
$("img").click(function(){
  var newSrc = $(this).attr("src").replace("jpg", "mp3").replace("images", "songs").replace("png", "mp3");
  $("#player-1").attr("src", newSrc);
  console.log($("#player-1").attr("src")); //change the source for all the players and alert user changed?
  socket.emit('changedSong', newSrc);
})

//Player clicked by anyone
document.getElementById('player-1').addEventListener('play', function(){
  var id = this.id;
  console.log('played');
  hasPlayed = true;
  socket.emit('clickedPlay', id);
});

socket.on('clickedButton', id => {
  document.getElementById(id).play();
});

socket.on('changedSongMain', newSrc => {
  $("#player-1").attr("src", newSrc);
  document.getElementById("player-1").play();
});

//Player paused by anyone
document.getElementById('player-1').addEventListener('pause', function() {
  if(document.getElementById('player-1').paused && hasPlayed == true){
    var id = 'player-1';
    console.log('paused');
    socket.emit('clickedPause', id);
  };
});

socket.on('clickedPauseButton', id => {
  document.getElementById(id).pause();
});

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}
