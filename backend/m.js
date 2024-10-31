const crypto = require('crypto');

const generateSecret = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

console.log('Generated Secrets:');
console.log('-------------------');
console.log(`JWT_SECRET=${generateSecret(32)}`);
console.log(`SESSION_SECRET=${generateSecret(32)}`);
console.log('-------------------');