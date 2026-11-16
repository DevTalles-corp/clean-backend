import { join } from 'node:path';
import { Router } from 'express';
import { createExpressApp } from './server/presentation/config/express.config.ts';
import { createPublicRouter } from './server/presentation/routes/public.routes.ts';
import { createSqliteDatabase } from './shared/infrastructure/database/sqlite.database.ts';
import { CryptoIdGenerator } from './shared/infrastructure/ids/crypto.id-generator.ts';
import { SystemClock } from './shared/infrastructure/clock/system.clock.ts';
import { createUsersModule } from './users/presentation/users.composition.ts';
import { createPaymentsModule } from './payments/presentation/payments.composition.ts';
import { createProductsModule } from './products/presentation/products.composition.ts';

export function createApp() {
  //! Infraestructura compartida
  const db = createSqliteDatabase(
    join(import.meta.dirname, '..', 'data', 'clean-database.db')
  );
  const idGenerator = new CryptoIdGenerator();
  const clock = new SystemClock();

  //! Módulos
  const router = Router();

  router.use('/', createPublicRouter());
  router.use('/users', createUsersModule({ db, idGenerator }));
  router.use('/payments', createPaymentsModule({ db, idGenerator, clock }));
  router.use('/products', createProductsModule({ db, idGenerator }));

  return createExpressApp(router);
}
