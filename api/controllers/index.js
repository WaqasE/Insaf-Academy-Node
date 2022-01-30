// ---------------------Admin ---------------------

const AuthController = require('./admin/Auth.controller')
const RoleController = require('./admin/Role.controller')
const UserController = require('./admin/User.controller')
const SubjectController = require('./admin/Subject.controller')
const ChapterController = require('./admin/Chapter.controller')
const QuestionBankController = require('./admin/QuestionBank.Controller')
const ContentController = require('./admin/Content.controller')

// ---------------------Student ---------------------

const StudentController = require('./student/Student.controller')
const NotificationsController = require('./student/Notifications.controller');
const ParentsController = require('./student/Parents.controller');
module.exports = { AuthController, ParentsController, StudentController, NotificationsController, RoleController, UserController, SubjectController, ChapterController, QuestionBankController, ContentController };
