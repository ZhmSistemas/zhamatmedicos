/**
 * Script de prueba para verificar la conexión con Deepseek
 * Uso: node test-deepseek.js "tu-api-key-aqui"
 */

const fs = require('fs');
const path = require('path');

// Intenta obtener la API key de los argumentos o del archivo .env
let DEEPSEEK_API_KEY = process.argv[2];

if (!DEEPSEEK_API_KEY) {
  // Intenta leer del archivo .env
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/DEEPSEEK_API_KEY=(.+)/);
    if (match) {
      DEEPSEEK_API_KEY = match[1].trim();
    }
  } catch (err) {
    // Archivo .env no encontrado
  }
}
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

if (!DEEPSEEK_API_KEY) {
  console.error('❌ Error: DEEPSEEK_API_KEY no está configurada en .env');
  process.exit(1);
}

console.log('🔑 API Key encontrada:', DEEPSEEK_API_KEY.substring(0, 10) + '...');
console.log('🌐 URL de API:', DEEPSEEK_API_URL);
console.log('📡 Enviando solicitud de prueba...\n');

async function testDeepseekAPI() {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente útil.',
          },
          {
            role: 'user',
            content: 'Hola, ¿estás funcionando?',
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    console.log('📊 Status HTTP:', response.status);
    console.log('📋 Headers:', {
      'content-type': response.headers.get('content-type'),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('\n❌ Error en la API:');
      console.error(JSON.stringify(data, null, 2));
      
      if (data.error) {
        console.error('\n💡 Mensaje de error:', data.error.message);
      }
      process.exit(1);
    }

    console.log('\n✅ Conexión exitosa!');
    console.log('\n📝 Respuesta:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0]) {
      console.log('\n💬 Contenido de la respuesta:');
      console.log(data.choices[0].message.content);
    }

    console.log('\n✨ ¡Tu API de Deepseek está funcionando correctamente!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error de conexión:');
    console.error(error.message);
    
    if (error.message.includes('fetch')) {
      console.error('\n💡 Posibles causas:');
      console.error('- La URL de Deepseek podría ser incorrecta');
      console.error('- No tienes conexión a Internet');
      console.error('- Hay un problema con el proxy/firewall');
    }
    
    process.exit(1);
  }
}

testDeepseekAPI();
