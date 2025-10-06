const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

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

// URL del webhook de n8n (PRODUCTION - NO test)
const n8nWebhookUrl = 'https://colo21.app.n8n.cloud/webhook/2544abfa-945c-44b7-aa9a-4f7905698b7a';

// Middleware para parsear JSON
app.use(express.json());

// Endpoint para enviar los usuarios a n8n (al llamar GET /enviar)
app.get('/enviar', async (req, res) => {
  let resultados = [];
  for (const usuario of usuarios) {
    try {
      const respuesta = await axios.post(n8nWebhookUrl, usuario);
      resultados.push({ nombre: usuario.nombre, status: 'ok', data: respuesta.data });
    } catch (error) {
      resultados.push({ nombre: usuario.nombre, status: 'error', mensaje: error.message });
    }
  }
  res.json({ enviados: resultados });
});

// Endpoint para recibir usuarios desde n8n
app.post('/usuario', (req, res) => {
  console.log('Usuario recibido desde n8n:', req.body);
  // Aquí puedes guardar el usuario, procesarlo, etc.
  res.json({ mensaje: 'Usuario recibido correctamente en el backend.', usuario: req.body });
});

// Arrancar el servidor
app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
  console.log('Usa GET /enviar para enviar los usuarios a n8n');
});