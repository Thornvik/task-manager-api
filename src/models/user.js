const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { isEmail } = require('validator')
const Task = require('./task')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Why you have no name?'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!isEmail(value)) {
          throw new Error('Email is invalid')
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: [6, 'to short password'],
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Please dont have the word password in you password')
        }
      },
    },
    age: {
      type: Number,
      default: 1337,
      validate(value) {
        if (value < 0) {
          throw new Error('Age is not negative')
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
        type: Buffer
    }
  },
  {
    timestamps: true,
  }
)

userSchema.virtual('tasks', {
  // this allows for a "virtual" field that is not stored in the database, for mongoose to know who owns what and the relation between them
  ref: 'Task', // the connection to the task model
  localField: '_id', // what the relation will look at, the user id
  foreignField: 'owner', // the field for the relation to look at in the task model
})

userSchema.methods.generateAuthToken = async function () {
  // methods are accessible on the instance (like the current user), sometimes called instace methods
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
  // static methods are accessible on the model, sometimes called model methods
  const user = await User.findOne({ email })

  if (!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return user
}

// hash tthe plain textt password before saving
userSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

// delete user tasks when user is deleted
userSchema.pre('remove', async function (next) {
  const user = this
  await Task.deleteMany({ owner: user._id })
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
