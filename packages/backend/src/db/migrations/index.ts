import type { Migration } from '@/db/migrations/interface';
import { createDevMPUser } from '@/db/migrations/create-dev-mp-user';

export class MigrationManager {
  static async runMigrations(): Promise<void> {
    const migrations: Migration[] = [
      createDevMPUser,
    ];

    for (const migration of migrations) {
      await migration.up();
      console.log(`Migration ${migration.name} applied successfully`);
    }
  }
}
