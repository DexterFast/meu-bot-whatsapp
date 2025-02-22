const { useSingleFileAuthState, makeWASocket } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express'); // Adicione o Express para manter o bot online

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot WhatsApp está rodando!');
});

async function startBot() {
  const { state, saveState } = useSingleFileAuthState('./auth_info.json');
  
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    browser: ['Hospedado', 'Chrome', '1.0']
  });

  sock.ev.on('connection.update', (update) => {
    if (update.qr) {
      qrcode.generate(update.qr, { small: true });
    }
    if (update.connection === 'open') {
      console.log('Conectado ao WhatsApp!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || '';
    const sender = msg.key.remoteJid;

    if (text.toLowerCase() === '!ping') {
      await sock.sendMessage(sender, { text: 'Pong! 🏓' });
    }
  });

  sock.ev.on('creds.update', saveState);
}

startBot().catch((err) => console.log(err));

// Inicia o servidor web
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});