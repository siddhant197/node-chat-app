const socket = io();

const $chatForm = document.getElementById("chatForm");
const $chatFormInput = $chatForm.querySelector("input");
const $chatFormButton = $chatForm.querySelector("button");
const $sendLocationButton = document.getElementById("locationButton");
const $messages = document.getElementById("messages");

const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;
  if (!$newMessage) return;

  const visibleHeight = $messages.offsetHeight;
  const containerHeight = $messages.scrollHeight;
  const scrollOffset = $messages.scrollTop + visibleHeight;

  const isNearBottom = containerHeight - scrollOffset <= 100;

  if (isNearBottom) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: message.createdAt,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: message.createdAt,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$chatForm.addEventListener("submit", function (event) {
  event.preventDefault();

  $chatFormButton.setAttribute("disabled", "disabled");

  const clientMessage = event.target.messageInput.value;

  socket.emit("sendMessage", clientMessage, (error) => {
    $chatFormButton.removeAttribute("disabled");
    $chatFormInput.value = "";
    $chatFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log("The message was delivered.");
  });
});

const handleSendLocation = () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
};

socket.emit("joinRoom", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
