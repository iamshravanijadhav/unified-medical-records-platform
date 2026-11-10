import { createApp } from './app.js';
import { env, setRuntimePort } from './config/env.js';
import { initFirebaseAdmin } from './config/firebaseAdmin.js';
import { initializeDataStore } from './repositories/dataStore.js';

async function startServer() {
  const fbState = initFirebaseAdmin();
  console.log(`[SystemMode] ${fbState.initMessage}`);

  await initializeDataStore();

  const app = createApp();
  const server = app.listen(env.port, () => {
    const address = server.address();
    if (address && typeof address === 'object') {
      setRuntimePort(address.port);
    }
    console.log(`[Server] Unified Medical Records API running on http://localhost:${env.port}`);
    console.log(`[Server] Health check: http://localhost:${env.port}/api/health`);
  });

  return server;
}

startServer().catch((err) => {
  console.error('[StartupError]', err);
  process.exit(1);
});

