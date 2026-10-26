import { createApp } from './app.composition.ts';

const port = Number(process.env.PORT ?? 3000);

// TODO: crear la app de Express

const server = createApp().listen(port, () => {
  console.log(`API disponible en http://localhost:${port}`);
});

server.on('error', (error) => {
  console.error('No se pudo iniciar el API:', error.message);
  process.exitCode = 1;
});
