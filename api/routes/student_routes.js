const studentRoutes = require("express").Router();
const { StudentController, NotificationsController, ParentsController, SubjectController } = require("../controllers");
const { auth, can, upload } = require('../middlewares');

studentRoutes.post("/register", StudentController.Create)
// studentRoutes.post("/login", StudentController.Login)
// studentRoutes.post("/forgotPassword", StudentController.ForgotPassword)
// studentRoutes.get("/logout", StudentController.Logout)

studentRoutes.get("/notifications:id", auth, NotificationsController.getNotifications)
studentRoutes.put("/notifications:id", auth, NotificationsController.updateNotifications)

studentRoutes.get("/parents", auth, ParentsController.searchParents)

studentRoutes.get("/subjects", auth, SubjectController.GetById)
studentRoutes.get("/allSubjects", auth, SubjectController.Get)
studentRoutes.get("/subjectDetails", auth, SubjectController.GetSubjectDetails)

// studentRoutes.post("/editStudents", auth, upload.single("imageFile"), StudentController.editStudents)
module.exports = studentRoutes;