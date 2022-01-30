const User = require('./User')
const Role = require('./Role')
const Class = require('./Class')
const Subject = require('./Subject')
const Chapter = require('./Chapter')
const QuestionBank = require('./QuestionBank')
const Content = require('./Content')
const Quiz = require('./Quiz')
const Student = require("./Student")
const Parents = require("./Parents")
const Notifications = require("./Notifications");

// Models
module.exports = {
    User, Role, Class, Subject, Chapter, QuestionBank, Content, Quiz,
    Student, Parents, Notifications
}