// scripts/probe-networks.ts - test Midnight RPC + indexer reachability
// Run: npx tsx scripts/probe-networks.ts

const rpcWss = [
  'wss://rpc.preprod.midnight.network',
  'wss://rpc.preview.midnight.network',
];

async function probeRpcHttp(wssUrl: string): Promise<void> {
  const httpUrl = wssUrl.replace('wss://', 'https://');
  console.log('--- RPC HTTP POST: ' + httpUrl + ' ---');
  try {
    const res = await fetch(httpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1, jsonrpc: '2.0', method: 'system_health', params: [],
      }),
      signal: AbortSignal.timeout(10000),
    });
    console.log('HTTP ' + res.status + ': ' + (await res.text()).slice(0, 200));
  } catch (e) {
    console.log('FAILED: ' + (e as Error).message);
  }
}

async function probeRpcWs(url: string): Promise<void> {
  console.log('--- RPC WebSocket: ' + url + ' ---');
  await new Promise<void>((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    let ws: WebSocket | undefined;
    const kill = setTimeout(() => {
      console.log('TIMEOUT: no response within 12s');
      try { ws?.close(); } catch {}
      finish();
    }, 12000);
    try {
      ws = new WebSocket(url);
    } catch (e) {
      console.log('CONNECT FAILED: ' + (e as Error).message);
      clearTimeout(kill);
      return finish();
    }
    ws.onopen = () => {
      console.log('WS OPEN - sending JSON-RPC probes');
      ws.send(JSON.stringify(
        { id: 1, jsonrpc: '2.0', method: 'system_chain', params: [] }));
      ws.send(JSON.stringify(
        { id: 2, jsonrpc: '2.0', method: 'system_version', params: [] }));
    };
    ws.onmessage = (ev) => {
      console.log('RESPONSE: ' + String(ev.data).slice(0, 250));
    };
    ws.onclose = (ev) => {
      console.log('WS CLOSED: code=' + ev.code +
        ' reason=' + (ev.reason || '(none)'));
      clearTimeout(kill);
      finish();
    };
    ws.onerror = () => {
      console.log('WS ERROR: connection failed/refused');
      clearTimeout(kill);
      finish();
    };
    setTimeout(() => {
      try { ws?.close(1000); } catch {}
    }, 8000);
  });
}

async function probeIndexer(url: string): Promise<void> {
  console.log('--- INDEXER: ' + url + ' ---');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
      signal: AbortSignal.timeout(10000),
    });
    console.log('HTTP ' + res.status + ': ' + (await res.text()).slice(0, 200));
  } catch (e) {
    console.log('FAILED: ' + (e as Error).message);
  }
}

for (const u of rpcWss) {
  await probeRpcHttp(u);
  await probeRpcWs(u);
}
await probeIndexer('https://indexer.preprod.midnight.network/api/v3/graphql');
await probeIndexer('https://indexer.preview.midnight.network/api/v3/graphql');
console.log('=== PROBE COMPLETE ===');
process.exit(0);
