const {User} = require('../../models')
const bcrypt = require('bcryptjs')
const {UserInputError, AuthenticationError} = require('apollo-server')
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../../config/env.json')
const {Op} = require('sequelize')
module.exports  = {
    Query: {
      getUsers: async (_, __, {user}) => {

          try {
            if(!user){
                throw new AuthenticationError('Unauthencated');
            }
            console.log(user)
            const users = await User.findAll({where:{
                username:{[Op.ne]:user.username}
            }});
            return users;
          } catch (err) {
              console.log(err);
              throw err;
          }
      },
      login: async (_,args) => {
          const {username, password} = args;
          let errors = {}
          try {
              if(username.trim() === '') errors.username = 'Username must not be empty';
              if(password === '') errors.password = 'Password must not be empty';
              if(Object.keys(errors).length > 0){
                throw new UserInputError('Bad Input', {errors})
              }
              const user = await User.findOne({where:{username}});
              if(!user){
                  errors.username = 'User not found';
                  throw new UserInputError('User not found', {errors})
              }

              const correctPassword = await bcrypt.compare(password, user.password);
              if(!correctPassword){
                  errors.password = 'Password incorrect';
                  throw new AuthenticationError('Password is incorrect', {errors});
              }

              const token = jwt.sign({
                username
              }, JWT_SECRET , { expiresIn: 60 * 60 });
              return {
                  ...user.toJSON(),
                  createdAt:user.createdAt.toISOString(),
                  token
              };

          } catch (err) {
              console.log(err);
              throw err;

          }
      }
    },
    Mutation: {
        register: async (_, args) => {
            
            let {username, email, password, confirmPassword} = args;
            let errors = {};
            try {

                // validate input data
                if(email.trim() === '') errors.email = 'Email must not be empty';
                if(username.trim() === '') errors.username = 'Username must not be empty';
                if(password === '') errors.password = 'Password must not be empty';
                if(confirmPassword.trim() === '') errors.confirmPassword = 'Repeat password must not be empty';
                if(password !== confirmPassword) errors.confirmPassword = 'Password must match';
                // Check if username / email exists
                // const userByUsername = await User.findOne({where:{username}})
                // const userByEmail= await User.findOne({where:{email}})

                // if(userByUsername) errors.username = 'Username has been taken';
                // if(userByEmail) errors.email = 'Email has been taken';

                if(Object.keys(errors).length > 0){
                    throw errors;
                }


                // Hash password
                password = await bcrypt.hash(password, 6);

                // Create user 
                const user = await User.create({username, email, password});
                // Return userSequelizeUniqueConstraintError
                return user;

            } catch (err) {

                console.log(err);
                if(err.name === "SequelizeUniqueConstraintError"){
                    err.errors.forEach(error => (errors[error.path] = `${error.path} is already taken`));
                } else if(err.name === "SequelizeValidationError"){
                    err.errors.forEach(error => (errors[error.path] = error.message));
                }
                throw new UserInputError('Bad Input', {errors});

            }

        },

    }
  };