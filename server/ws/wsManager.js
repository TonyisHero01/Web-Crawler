const WebSocket = require('ws');

let wss = null;

function initWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('🔌 WebSocket client connected');
    ws.on('message', (message) => {
      console.log('📨 Received from client:', message.toString());
    });
    ws.on('close', () => console.log('❌ WebSocket disconnected'));
  });

  return wss;
}

function notifyCrawlComplete(recordId) {
  if (!wss) return;

  console.log(`📣 Sending crawl-complete for recordId: ${recordId} to ${wss.clients.size} clients`);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      const msg = { type: 'crawl-complete', website_record_id: recordId };
      console.log('📤 Sending message:', msg);
      client.send(JSON.stringify(msg));
    }
  });
}

module.exports = { initWebSocket, notifyCrawlComplete };