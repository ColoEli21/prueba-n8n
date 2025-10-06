const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Usuarios predeterminados
const usuarios = [
  {
    nombre: 'Juan Pérez',
    email: 'juan.perez@example.com',
    edad: 30,
    telefono: '+541112345678',
    direccion: 'Calle Falsa 123, Buenos Aires',
    activo: true
  },
  {
    nombre: 'Ana Gómez',
    email: 'ana.gomez@example.com',
    edad: 25,
    telefono: '+541112349999',
    direccion: 'Av. Libertador 456, Buenos Aires',
    activo: false
  },
  {
    nombre: 'Carlos Sosa',
    email: 'carlos.sosa@example.com',
    edad: 40,
    telefono: '+541112347777',
    direccion: 'Calle Real 789, Buenos Aires',
    activo: true
  },
  {
    nombre: 'Martina López',
    email: 'martina.lopez@example.com',
    edad: 22,
    telefono: '+541112346666',
    direccion: 'Calle Nueva 321, Buenos Aires',
    activo: true
  }
];

// URL del webhook de n8n (Production URL, NO la test)
const n8nWebhookUrl = 'https://colo21.app.n8n.cloud/webhook-test/2544abfa-945c-44b7-aa9a-4f7905698b7a';

// Endpoint para recibir el usuario reenviado por n8n
app.use(express.json());

app.post('/usuario', (req, res) => {
  console.log('Usuario recibido desde n8n:', req.body);
  // Puedes guardar el usuario, procesarlo, etc.
  res.json({ mensaje: 'Usuario recibido correctamente en el backend.', usuario: req.body });
});

// Función para enviar todos los usuarios al webhook de n8n
async function enviarUsuariosAN8N() {
  for (const usuario of usuarios) {
    try {
      const respuesta = await axios.post(n8nWebhookUrl, usuario);
      console.log('Enviado a n8n:', usuario.nombre, '| Respuesta:', respuesta.data);
    } catch (error) {
      console.error('Error al enviar usuario', usuario.nombre, 'a n8n:', error.message);
    }
  }
}

// Arrancar el servidor y enviar los usuarios al iniciar
app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
  enviarUsuariosAN8N(); // Envía usuarios al webhook de n8n al iniciar el servidor
});