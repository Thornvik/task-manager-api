const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')


const userOneId = new mongoose.Types.ObjectId()
const userOne = {
  _id: userOneId,
  name: 'Mike',
  email: 'mike@example.com',
  password: 'StrongPass123#',
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
}

const setupDatabase = async () => {
  await User.deleteMany() // deletes all users in tthe database
  await new User(userOne).save()
}

module.exports = {
  userOneId,
  userOne,
  setupDatabase
}