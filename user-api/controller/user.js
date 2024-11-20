const User = require('../model/User');
const Joi = require('joi');

const userSchema = Joi.object({
  firstName: Joi.string().min(3).max(30).required(),
  lastName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
});

const createUser = async (req, res, next) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }
    const user = new User();
    user.firstName = value.firstName;
    user.lastName = value.lastName;
    user.email = value.email;
    await user.save();
    return res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
}

const readUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).exec();
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    return res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
}

const updateUser = async (req, res, next) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }
    const user = await User.findById(req.params.id).exec();
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    user.firstName = value.firstName;
    user.lastName = value.lastName;
    user.email = value.email;
    await user.save();
    return res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
}

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).exec();
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    await User.deleteOne({ _id: user.id });
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
}

const readUsers = async (req, res, next) => {
  try {
    const users = await User.find().exec();
    return res.status(200).json(users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createUser,
  readUser,
  updateUser,
  deleteUser,
  readUsers,
}
