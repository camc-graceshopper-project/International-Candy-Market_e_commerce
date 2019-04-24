const router = require('express').Router()
const User = require('../db/models/user')
var async = require('async')
var crypto = require('crypto')
var nodemailer = require('nodemailer')
const Mailgun = require('mailgun-js')

module.exports = router

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({where: {email: req.body.email}})
    if (!user) {
      console.log('No such user found:', req.body.email)
      res.status(401).send('Wrong username and/or password')
    } else if (!user.correctPassword(req.body.password)) {
      console.log('Incorrect password for user:', req.body.email)
      res.status(401).send('Wrong username and/or password')
    } else {
      req.login(user, err => (err ? next(err) : res.json(user)))
    }
  } catch (err) {
    next(err)
  }
})

router.post('/signup', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    req.login(user, err => (err ? next(err) : res.json(user)))
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(401).send('User already exists')
    } else {
      next(err)
    }
  }
})

router.post('/logout', (req, res) => {
  req.logout()
  req.session.destroy()
  res.redirect('/')
})

router.get('/me', (req, res) => {
  res.json(req.user)
})

router.use('/google', require('./google'))

// router.get('rest/:token', async (req, res, next) => {
//   await User.findOne(
//     {
//       resetPasswordToken: req.params.token,
//       resetPasswordExpires: {$gt: Date.now()}
//     },
//     function(_err, user) {
//       if (!user) {
//         req.flash('error', 'Password reset token is invalid or has expired.')
//         return res.redirect('/forgot')
//       }
//       res.render('reset', {
//         user: req.user
//       })
//     }
//   )
// })

// router.post('/forgot', function(req, res, next) {
//   async.waterfall(
//     [
//       function(done) {
//         crypto.randomBytes(20, function(err, buf) {
//           var token = buf.toString('hex')
//           done(err, token)
//         })
//       },
//       function(token, done) {
//         User.findOne({email: req.body.email}, function(_err, user) {
//           if (!user) {
//             req.flash('error', 'No account with that email address exists.')
//             return res.redirect('/forgot')
//           }

//           user.resetPasswordToken = token
//           user.resetPasswordExpires = Date.now() + 3600000 // 1 hour

//           user.save(function(err) {
//             done(err, token, user)
//           })
//         })
//       },
//       async function(token, user, done) {
//         let testAccount = await nodemailer.createTestAccount()
//         var smtpTransport = nodemailer.createTransport('SMTP', {
//           service: 'Mailgun',
//           auth: {
//             user: testAccount.user,
//             pass: testAccount.user.pass
//           }
//         })
//         var mailOptions = {
//           to: 'Meng Mu <mengmutj@gmail.com>',
//           from: 'passwordreset@demo.com',
//           subject: 'Node.js Password Reset',
//           text:
//             'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
//             'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//             'http://' +
//             req.headers.host +
//             '/reset/' +
//             token +
//             '\n\n' +
//             'If you did not request this, please ignore this email and your password will remain unchanged.\n'
//         }
//         smtpTransport.sendMail(mailOptions, function(err) {
//           req.flash(
//             'info',
//             'An e-mail has been sent to ' +
//               user.email +
//               ' with further instructions.'
//           )
//           done(err, 'done')
//         })
//       }
//     ],
//     function(err) {
//       if (err) return next(err)
//       res.redirect('/forgot')
//     }
//   )
// })

// router.post('/reset/:token', function(req, res) {
//   async.waterfall([
//     function(done) {
//       User.findOne(
//         {
//           where: {
//             resetPasswordToken: req.params.token,
//             resetPasswordExpires: {$gt: Date.now()}
//           }
//         },
//         function(_err, user) {
//           if (!user) {
//             req.flash(
//               'error',
//               'Password reset token is invalid or has expired.'
//             )
//             return res.redirect('back')
//           }

//           user.password = req.body.password
//           user.resetPasswordToken = undefined
//           user.resetPasswordExpires = undefined
//         }
//       )
//     },
//     async function(user, done) {
//       let testAccount = await nodemailer.createTestAccount()
//       var smtpTransport = nodemailer.createTransport('SMTP', {
//         service: 'Mailgun',
//         auth: {
//           user: testAccount.user,
//           pass: testAccount.user.pass
//         }
//       })
//       var mailOptions = {
//         to: 'Meng Mu <mengmutj@gmail.com>',
//         from: 'passwordreset@demo.com',
//         subject: 'Your password has been changed',
//         text:
//           'Hello,\n\n' +
//           'This is a confirmation that the password for your account ' +
//           user.email +
//           ' has just been changed.\n'
//       }
//       smtpTransport.sendMail(mailOptions, function(err) {
//         req.flash('success', 'Success! Your password has been changed.')
//         done(err)
//       })
//     }
//   ])
// })
