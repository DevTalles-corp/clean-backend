import Database from 'better-sqlite3';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import { Payment, type PaymentStatus } from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';

interface PaymentRow {
  id: string;
  reference: string;
  amount: number;
  status: PaymentStatus;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  customer_id: string;
}

const selectColumns =
  'SELECT id, reference, amount, status, created_at, updated_at, customer_id FROM payments';

export class SqlitePaymentRepository implements PaymentRepository {
  private readonly db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        reference TEXT NOT NULL UNIQUE,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        customer_id TEXT NOT NULL
      )
    `);
  }

  async findById(id: string): Promise<Payment | undefined> {
    const row = this.db
      .prepare<[string], PaymentRow>(`${selectColumns} WHERE id = ?`)
      .get(id);

    return row ? this.toEntity(row) : undefined;
  }

  async findByReference(reference: string): Promise<Payment | undefined> {
    const row = this.db
      .prepare<[string], PaymentRow>(`${selectColumns} WHERE reference = ?`)
      .get(reference);

    return row ? this.toEntity(row) : undefined;
  }

  async findAll(): Promise<Payment[]> {
    const rows = this.db
      .prepare<[], PaymentRow>(`${selectColumns} ORDER BY rowid`)
      .all();

    return rows.map((row) => this.toEntity(row));
  }

  async save(payment: Payment): Promise<void> {
    try {
      this.db
        .prepare(
          `INSERT INTO payments (id, reference, amount, status, created_at, updated_at, customer_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          payment.id,
          payment.reference,
          payment.amount,
          payment.status,
          payment.createdAt.toISOString(),
          payment.updatedAt.toISOString(),
          payment.customerId
        );
    } catch (error) {
      if (
        error instanceof Database.SqliteError &&
        error.code === 'SQLITE_CONSTRAINT_UNIQUE'
      ) {
        throw new ConflictError('La referencia ya está registrada');
      }
      throw error;
    }
  }

  // Payment.create siempre reconstruye el pago como 'pending' con updatedAt = createdAt,
  // que hoy es el único estado posible en el dominio.
  private toEntity(row: PaymentRow): Payment {
    return Payment.create({
      id: row.id,
      reference: row.reference,
      amount: row.amount,
      customerId: row.customer_id,
      createdAt: new Date(row.created_at),
    });
  }
}
