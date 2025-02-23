const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);

const hash = bcrypt.hashSync('xxx', salt);

console.log(hash);

const isMatch = bcrypt.compareSync('xxx', hash);

console.log(isMatch);
