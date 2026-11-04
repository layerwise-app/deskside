import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Define your own tables below, then run `pnpm run db:generate` to create a
// migration. Migrations are applied to the production D1 database on publish.
//
// Example:
//
// export const posts = sqliteTable('posts', {
//   id: integer('id').primaryKey({ autoIncrement: true }),
//   title: text('title').notNull(),
//   createdAt: integer('created_at', { mode: 'timestamp' })
//     .notNull()
//     .$defaultFn(() => new Date()),
// });

/** Every message sent through the contact form. */
export const contactMessages = sqliteTable(
  'contact_messages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    email: text('email').notNull(),
    message: text('message').notNull(),
    /** A salted hash of the sender's IP address, used only for the rate limit. */
    ipHash: text('ip_hash').notNull(),
    userAgent: text('user_agent'),
    /** Whether a copy was emailed to `ownerEmail`. */
    emailed: integer('emailed', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
  },
  (table) => [index('contact_messages_ip_created_idx').on(table.ipHash, table.createdAt)]
);
