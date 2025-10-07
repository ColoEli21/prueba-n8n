const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Usuarios predeterminados con historia
const usuarios = [
  {
    nombre: 'Juan Pérez',
    email: 'juan.perez@example.com',
    edad: 30,
    telefono: '+541112345678',
    direccion: 'Calle Falsa 123, Buenos Aires',
    activo: true,
    historia: 'Juan sueña con abrir su propia cafetería. Recientemente ha comenzado a ahorrar para lograrlo.'
  },
  {
    nombre: 'Ana Gómez',
    email: 'ana.gomez@example.com',
    edad: 25,
    telefono: '+541112349999',
    direccion: 'Av. Libertador 456, Buenos Aires',
    activo: false,
    historia: 'Ana está terminando su carrera universitaria. Quiere viajar por Sudamérica cuando se reciba.'
  },
  {
    nombre: 'Carlos Sosa',
    email: 'carlos.sosa@example.com',
    edad: 40,
    telefono: '+541112347777',
    direccion: 'Calle Real 789, Buenos Aires',
    activo: true,
    historia: 'Carlos es entrenador de fútbol infantil. Su mayor satisfacción es ver crecer a sus alumnos.'
  },
  {
    nombre: 'Martina López',
    email: 'martina.lopez@example.com',
    edad: 22,
    telefono: '+541112346666',
    direccion: 'Calle Nueva 321, Buenos Aires',
    activo: true,
    historia: 'Martina está escribiendo su primer libro. Sueña con publicarlo antes de fin de año.'
  }
];

// URL del webhook de n8n (PRODUCTION)
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

// Endpoint para obtener la historia de un usuario por email
app.get('/historia/:email', (req, res) => {
  const email = req.params.email;
  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  }
  res.json({ nombre: usuario.nombre, historia: usuario.historia });
});

// Endpoint para listar todas las historias
app.get('/historias', (req, res) => {
  const historias = usuarios.map(u => ({
    nombre: u.nombre,
    historia: u.historia
  }));
  res.json({ historias });
});

// Middleware profesional para logging de solicitudes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Endpoint de salud para monitoreo
app.get('/salud', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Arrancar el servidor
app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
  console.log('Usa GET /enviar para enviar los usuarios a n8n');
  console.log('Usa GET /historia/:email para obtener la historia de un usuario');
  console.log('Usa GET /historias para listar todas las historias');
  console.log('Usa GET /salud para monitoreo de estado');
});