import bcrypt from 'bcrypt';

const password = 'admin123';
const hash = await bcrypt.hash(password, 10);
console.log('Password hash for "admin123":', hash);
console.log('\nRun this SQL:');
console.log(`UPDATE users SET password = '${hash}' WHERE username = 'admin';`);
