

const socket = io();

socket.on("connect", () => {
  const botonChat = document.getElementById('botonChat');
  const parrafosMensajes = document.getElementById('parrafosMensajes');
  const val = document.getElementById('chatBox');

  botonChat.addEventListener('click', () => {
    Swal.fire({
      title: "Identificación de Usuario",
      text: "Por favor ingrese su nombre de usuario",
      input: "text",
      inputValidator: (valor) => {
        return !valor && 'Ingrese un valor válido';
      },
      allowOutsideClick: false
    }).then(resultado => {
      const user = resultado.value;
      if (user) {
        iniciarChat(user);
      }
    });
  });

  function iniciarChat(user) {
    socket.emit("inicioChat", user);

    botonChat.removeEventListener('click', iniciarChat);

    botonChat.addEventListener('click', () => {
      if (val.value.trim().length > 0) {
        socket.emit("mensaje", { usuario: user, mensaje: val.value });
        val.value = "";
      }
    });
  }

  socket.on("mensajes", arrayMensajes => {
    parrafosMensajes.innerHTML = ""; // Para evitar duplicados
    arrayMensajes.forEach(mensaje => {
      parrafosMensajes.innerHTML += `<p>${mensaje.usuario} : ${mensaje.mensaje}</p>`;
    });
  });
});


