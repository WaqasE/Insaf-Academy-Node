const { Class, Subject, User, Quiz, Content } = require('../../models')
const { niv, } = require('../../utils')
const mongoose = require('mongoose')
const fs = require("fs")

class SubjectController {
    constructor() {
    }

    async Create(req, res) {

        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            class: 'required',
            assignedTo: 'required',
            description: 'required',
            thumbnail: 'mime:jpg,jpeg,png'
        });

        validator.niceNames({
            title: "Subject Title",
            class: 'Class',
            assignedTo: 'Assigned To',
            description: 'Description',
            thumbnail: 'Thumbnail'
        })
        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        let match=await Subject.find({'title':req.body.title,'class':req.body.class})

        if(match.length>0)
        return res.status(400).json({ error: '', message: 'Subject Already Exist' });

        var file_path = req.file?.path ? req.file.path.replace('public\\', "") : '';
        new Subject({
            title: form_data.title,
            class: form_data.class,
            assignedTo: form_data.assignedTo,
            description: form_data.description,
            thumbnail: file_path,
            userID: form_data.userID
        })
            .save()
            .then((subject) => {
                return res.status(200).json({ subject, message: 'Subject created and assigned successfully' })
            })
            .catch((error) => {
                return res.status(400).json({ error: error, message: 'Form validation error' });
            })


    }

    async Update(req, res) {
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            class: 'required',
            assignedTo: 'required',
            description: 'required',
        });
        validator.niceNames({
            title: "Title",
            class: 'Class',
            assignedTo: 'Assigned To',
            description: 'Description',
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        try {
            if (req.file) {
                let del = await Subject.findOne({ _id: req.body._id }, { thumbnail: 1 })
                let path = 'public\\' + del.thumbnail;
                fs.unlinkSync(path)
                req.body.thumbnail = req.file.path.replace('public\\', "")
            }
            await Subject.updateOne({ _id: req.body._id }, { title: req.body.title, description: req.body.description, thumbnail: req.body.thumbnail, assignedTo: req.body.assignedTo, class: req.body.class, updated_at: new Date() })
            var subject = await Subject.findById(req.body._id).populate('class').populate({ path: 'assignedTo', model: User });
            return res.status(200).json({ subject, message: 'Subject Updated Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Updating Subject', message: 'Error ocurred' });
        }

    }

    async Get(req, res) {
        var { class_id } = req.params
        try {
            var subjects = await Subject.find({ 'class': class_id }).populate('class').populate({ path: 'assignedTo', model: User });
            return res.status(200).json({ subjects });

        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }

    }
    async GetById(req, res) {
        var { class_id, userID } = req.params
        try {
            var subjects = await Subject.find({ assignedTo: userID, 'class': class_id }).populate('class').populate({ path: 'assignedTo', model: User });
            return res.status(200).json({ subjects });

        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }

    }

    async GetSubjectDetails(req, res) {
        var { subject_id } = req.params
        try {
            // var subject = await Subject.findById(subject_id).populate('class').populate({ path: 'assignedTo', model: User});
            var subject = await Subject.aggregate([
                {
                    "$match": { "_id": mongoose.Types.ObjectId(subject_id) }
                },
                {
                    "$lookup": {
                        "from": "chapters",
                        "let": { "subjectId": "$_id" },
                        "pipeline": [{
                            "$match": {
                                "$expr": {
                                    "$eq": ["$subject", "$$subjectId"]
                                }
                            }
                        }],
                        "as": "chapters"
                    }
                }
            ])
            for (var i = 0; i < subject[0]['chapters'].length; i++) {
                for (var j = 0; j < subject[0]['chapters'][i]['topics'].length; j++) {
                    const topic = subject[0]['chapters'][i]['topics'][j]
                    var modifiedTopic = { ...topic, contents: [] };
                    let contents = await Content.find({ topic: topic._id });
                    for (let c = 0; c < contents.length; c++)
                        if (contents[c]?.contentType === 'QUIZ')
                            contents[c].content = await Quiz.findOne({ _id: contents[c].content })
                    console.log("conents:", contents)
                    modifiedTopic.contents = contents;
                    subject[0]['chapters'][i]['topics'][j] = { ...modifiedTopic };
                }
            }

            return res.status(200).json({ subject: subject[0] || null });

        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }
    }

    async Delete(req, res) {
        var { id } = req.params
        try {
            let del = await Subject.findOne({ _id: id }, { thumbnail: 1 })
            let path = 'public\\' + del.thumbnail;
            fs.unlinkSync(path)
            await Subject.deleteOne({ _id: id })
            return res.status(200).json({ id, message: 'Subject removed successfully' })

        }
        catch (e) {
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }
    //create
    async CreateClass(req, res) {

        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
        });

        validator.niceNames({
            title: "Title",
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }

        new Class({
            title: form_data.title,
            description: form_data?.description
        })
            .save()
            .then((cls) => {
                cls.subjects = []
                return res.status(200).json({ class: cls, message: 'Class created successfully' })
            })
            .catch((error) => {
                console.log("error", error)
                return res.status(400).json({ error: error, message: 'Form validation error' });
            })
    }

    async UpdateClass(req, res) {
        var { id } = req.params
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
        });

        validator.niceNames({
            title: "Title",
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }


        try {
            let oldClass = await Class.findById(id);
            oldClass.title = form_data?.title
            oldClass.description = form_data?.description
            await oldClass.save()

            var clas = await Class.aggregate([
                {
                    "$match": { "_id": mongoose.Types.ObjectId(id) }
                },
                {
                    "$lookup": {
                        "from": "subjects",
                        "let": { "classId": "$_id" },
                        "pipeline": [{
                            "$match": {
                                "$expr": {
                                    "$eq": ["$class", "$$classId"]
                                }
                            }
                        }],
                        "as": "subjects"
                    }
                }
            ])
            return res.status(200).json({ class: clas[0] || {}, message: 'Class Updated Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Updating Class', message: 'Error ocurred' });
        }

    }

    async DeleteClass(req, res) {
        var { id } = req.params
        try {
            Subject.find({ class: mongoose.Types.ObjectId(id) }).remove().exec();
            Class.findById(id).remove().exec();

            return res.status(200).json({ id: id, message: 'Class removed successfully' })

        }
        catch (e) {
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }



    async GetClass(req, res) {
        try {
            var classes = await Class.find({})
            return res.status(200).json({ classes });

        } catch (e) {
            console.log("E", e)
            return res.status(400).json({ error: e });
        }
    }


    async GetAllClasses(req, res) {
        try {
            console.log('cs:',req.params)
            const {userID}=req.params
            let classes = await Class.aggregate([
                {
                    "$lookup": {
                        "from": "subjects",
                        "let": { "classId": "$_id" },
                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$class", "$$classId"] } } }
                        ],
                        "as": "subjects"
                    }
                }
            ])
            if(userID)
            {
                console.log("enter")
                classes=classes.filter((classs)=> classs.subjects.length>0)
                console.log("classes=",classes)
            }
            console.log("classes:",classes)
            return res.status(200).json({ classes });

        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }
    }


    async GetClassById(req, res) {
        var { id } = req.params


        try {
            var classes = await Class.aggregate([
                {
                    "$match": { "_id": mongoose.Types.ObjectId(id) }
                },
                {
                    "$lookup": {
                        "from": "subjects",
                        "let": { "classId": "$_id" },
                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$class", "$$classId"] } } }
                        ],
                        "as": "subjects"
                    }
                }
            ])

            return res.status(200).json({ class: classes });
        }
        catch (e) {
            console.log('e', e)
            return res.status(400).json({ error: 'Error occured', e: e });
        }
    }

}

module.exports = new SubjectController();