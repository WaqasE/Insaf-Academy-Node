const { AuthController, RoleController, UserController, SubjectController, ChapterController, QuestionBankController, ContentController } = require('../controllers');
const adminRoutes = require("express").Router();
const { auth, can, upload } = require('../middlewares')

adminRoutes.post('/login', AuthController.Login)
adminRoutes.post('/forget-password', AuthController.ForgetPassword)
adminRoutes.post('/check-reset', AuthController.ValidatePasswordRequest)
adminRoutes.post('/reset-password', AuthController.ResetPassword)
adminRoutes.get('/logout', AuthController.Logout)

adminRoutes.post('/signup', AuthController.Signup)
adminRoutes.get('/get-class-id/:id', SubjectController.GetClassById)


adminRoutes.use(auth);
adminRoutes.get('/auth-check', AuthController.CheckAuth)
adminRoutes.get('/token', AuthController.refreshToken)

/* Roles Routes */
adminRoutes.post('/roles', can('create:any|create:own', 'roles'), RoleController.Create)
adminRoutes.get('/roles', can('read:any|read:own', 'roles'), RoleController.Get)
adminRoutes.put('/roles/:id', can('update:any|update:own', 'roles'), RoleController.Update)
adminRoutes.delete('/roles/:id', can('delete:any|delete:own', 'roles'), RoleController.Delete)


/* Users Routes */
adminRoutes.post('/users', can('create:any|create:own', 'users'), UserController.Create)
adminRoutes.get('/users', can('read:any|read:own', 'users'), UserController.Get)
adminRoutes.put('/users/:id', can('update:any|update:own', 'users'), UserController.Update)
adminRoutes.delete('/users/:id', can('delete:any|delete:own', 'roles'), UserController.Delete)

/* Subjects Routes */
adminRoutes.post('/subjects', can('create:any|create:own', 'subjects'), upload.single('thumbnail'), SubjectController.Create)
adminRoutes.get('/subjects/:class_id', can('read:any|read:own', 'subjects'), SubjectController.Get)
adminRoutes.get('/subjects/:class_id/userID/:userID', can('read:any|read:own', 'subjects'), SubjectController.GetById)

adminRoutes.get('/subjects/details/:subject_id', can('read:any|read:own', 'subjects'), SubjectController.GetSubjectDetails)
adminRoutes.put('/subjects', can('update:any|update:own', 'subjects'), upload.single('thumbnail'), SubjectController.Update)
adminRoutes.delete('/subjects/:id', can('delete:any|delete:own', 'subjects'), SubjectController.Delete)

/* Classes Routes */
adminRoutes.get('/classes/:userID',  SubjectController.GetAllClasses)
adminRoutes.get('/classes',  SubjectController.GetAllClasses)
adminRoutes.post('/classes', SubjectController.CreateClass)
adminRoutes.put('/classes/:id', SubjectController.UpdateClass)
adminRoutes.delete('/classes/:id', SubjectController.DeleteClass)

/* Chapters Routes */
adminRoutes.post('/chapters', ChapterController.Create)
adminRoutes.get('/chapters/:sub_id',  ChapterController.Get)
adminRoutes.put('/chapters/:id',  ChapterController.Update)
adminRoutes.delete('/chapters/:id',  ChapterController.Delete)

/* Topics Routes */
adminRoutes.post('/topics/:chap_id', ChapterController.CreateTopic)
adminRoutes.put('/topics/:chap_id', ChapterController.UpdateTopic)
adminRoutes.get('/topics/:chap_id', ChapterController.GetTopics)
adminRoutes.delete('/topics/:chap_id', ChapterController.DeleteTopic)

/* Contents Routes */
adminRoutes.post('/contents/:chapterID/topic/:topic_id', upload.single('content'), ContentController.Create)
adminRoutes.put('/contents/:chapterID/topic/:topic_id',  upload.single('content') ,ContentController.Update)
adminRoutes.get('/contents/:topic_id', ContentController.Get)

adminRoutes.delete('/contents/:contentID', ContentController.Delete)


adminRoutes.post('/contents/questions/:quiz_id', ContentController.addQuestions)
adminRoutes.post('/contents/newquestion/:quiz_id', ContentController.addNewQuestion)
adminRoutes.delete('/contents/questions/:quiz_id', ContentController.deleteQuestion)

/* QuestionBank Routes */
adminRoutes.post('/questions/:quizID', QuestionBankController.Save)
// /\/(?:questions_\/:quizID|questions_\/:quizID\/user\/:userID)/
// /\/questions_\/[a-z0-9]{0,}(\/userID[a-z0-9\/]{0,}|)/
//adminRoutes.post('/questions_/:quizID(/user/:userID)', can('create:any|create:own', 'subjects'), QuestionBankController.GetByTags)
adminRoutes.post('/questions_/:quizID/user/:userID', QuestionBankController.GetByTags)
adminRoutes.post('/questions_/:quizID',  QuestionBankController.GetByTags)
adminRoutes.get('/questions/:quizID',  QuestionBankController.Get)
adminRoutes.put('/questions/:id',  QuestionBankController.Update)

adminRoutes.post('/questionBank',  QuestionBankController.Create)
adminRoutes.post('/questionBankFilter/:userID',  QuestionBankController.GetAll)
adminRoutes.post('/questionBankFilter',  QuestionBankController.GetAll)
adminRoutes.delete('/questionBank/:questionID',  QuestionBankController.Delete)


adminRoutes.get('/email', UserController.SendMail)



// adminRoutes.post('/signup', AuthController.Signup)
// adminRoutes.get('/logout', auth, AuthController.Me)
// adminRoutes.get('/me', auth, AuthController.Me)

module.exports = adminRoutes