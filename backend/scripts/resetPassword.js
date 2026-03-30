require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function main() {
  const [, , emailArg, passwordArg] = process.argv;

  const email = (emailArg || '').trim();
  const password = passwordArg || '';

  if (!email || !password) {
    console.log('Usage: node scripts/resetPassword.js <email> <newPassword>');
    process.exitCode = 1;
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `UPDATE Users SET password_hash = ?, status = 'active' WHERE email = ?`,
    [password_hash, email]
  );

  if (result.affectedRows === 0) {
    console.log(`No user found for email: ${email}`);
    process.exitCode = 2;
    return;
  }

  console.log(`Password updated for ${email}`);
  console.log(`New bcrypt hash: ${password_hash}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 99;
  })
  .finally(async () => {
    try {
      await pool.end();
    } catch {
      // ignore
    }
  });

