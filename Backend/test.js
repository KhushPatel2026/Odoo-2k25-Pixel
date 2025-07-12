const bcrypt = require('bcryptjs');

const hashed = '$2b$10$t/kBpydDdRPkYAZAAjtbfeQmZ/11MxW/5abDdLgwzP9rRNAvK0SmO';
const plain = 'password123';

bcrypt.compare(plain, hashed).then(result => {
  if (result) {
    console.log('✅ Password matched');
  } else {
    console.log('❌ Invalid password');
  }
});
