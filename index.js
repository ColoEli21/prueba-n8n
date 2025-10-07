const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Configuración Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://oogggxxrjdkprvxyiucv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZ2dneHhyamRrcHJ2eHlpdWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODQyMzcsImV4cCI6MjA3NTM2MDIzN30.6w_1dqv_cB1ya8OdXgqwvTnOfoVRansPfWr9hMJ0IXY';
const supabase = createClient(supabaseUrl, supabaseKey);

// URL del webhook de n8n (PRODUCTION)
const n8nWebhookUrl = 'https://colo21.app.n8n.cloud/webhook/2544abfa-945c-44b7-aa9a-4f7905698b7a';

app.use(express.json());

// Endpoint para enviar los usuarios a n8n
app.get('/enviar', async (req, res) => {
  const { data: usuarios, error } = await supabase.from('usuarios').select('*');
  if (error) return res.status(500).json({ error: error.message });

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
app.get('/historia/:email', async (req, res) => {
  const email = req.params.email;
  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('nombre,historia')
    .eq('email', email)
    .single();

  if (error || !usuarios) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  }
  res.json({ nombre: usuarios.nombre, historia: usuarios.historia });
});

// Endpoint para listar todas las historias
app.get('/historias', async (req, res) => {
  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('nombre,historia');

  if (error) return res.status(500).json({ error: error.message });

  res.json({ historias: usuarios });
});

// Endpoint para recibir una historia creada por n8n y actualizar al usuario
app.post('/historia', async (req, res) => {
  const { email, content } = req.body;
  if (!email || !content) {
    return res.status(400).json({ mensaje: 'Se requiere email y content en el cuerpo.' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update({ historia: content })
    .eq('email', email)
    .select();

  if (error || !data || data.length === 0) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado o error al actualizar.' });
  }

  res.json({ mensaje: 'Historia actualizada correctamente.', usuario: data[0] });
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
  console.log('Usa POST /historia para recibir y actualizar la historia creada por n8n');
  console.log('Usa GET /salud para monitoreo de estado');
});