// scripts/probe-indexer-ws.ts - test the wallet sync channel
// Run: npx tsx scripts/probe-indexer-ws.ts
const endpoints = [
  'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
  'wss://indexer.preview.midnight.network/api/v3/graphql/ws',
];
const protocols = ['graphql-transport-ws', 'graphql-ws'];

async function tryProto(url: string, proto: string): Promise<boolean> {
  console.log('--- ' + url + ' [' + proto + '] ---');
  return new Promise((resolve) => {
    let done = false;
    let acked = false;
    const finish = (ok: boolean) => {
      if (!done) { done = true; resolve(ok); }
    };
    let ws: WebSocket | undefined;
    const kill = setTimeout(() => {
      console.log('TIMEOUT: no response in 10s');
      try { ws?.close(); } catch {}
      finish(false);
    }, 10000);
    try { ws = new WebSocket(url, proto); }
    catch (e) {
      console.log('CONNECT FAILED: ' + (e as Error).message);
      clearTimeout(kill);
      return finish(false);
    }
    ws.onopen = () => {
      console.log('WS OPEN - sending connection_init');
      ws.send(JSON.stringify({ type: 'connection_init' }));
    };
    ws.onmessage = (ev) => {
      const msg = String(ev.data).slice(0, 200);
      console.log('MSG: ' + msg);
      if (msg.includes('connection_ack') && !acked) {
        acked = true;
        const op = proto === 'graphql-ws' ? 'start' : 'subscribe';
        ws.send(JSON.stringify({
          id: '1', type: op,
          payload: { query: '{ __typename }' },
        }));
      }
      if (msg.includes('"next"') ||
          msg.includes('"data"') ||
          msg.includes('"complete"')) {
        console.log('SUCCESS: full GraphQL-over-WS round trip');
        clearTimeout(kill);
        try { ws?.close(1000); } catch {}
        finish(true);
      }
    };
    ws.onclose = (ev) => {
      console.log('CLOSED code=' + ev.code +
        ' reason=' + (ev.reason || '(none)'));
      clearTimeout(kill);
      finish(acked);
    };
    ws.onerror = () => {
      console.log('WS ERROR');
      clearTimeout(kill);
      finish(false);
    };
  });
}

for (const url of endpoints) {
  for (const proto of protocols) {
    if (await tryProto(url, proto)) break;
  }
}
console.log('=== INDEXER WS PROBE COMPLETE ===');
process.exit(0);
