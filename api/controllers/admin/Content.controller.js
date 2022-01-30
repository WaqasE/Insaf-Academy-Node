const { Content, Quiz, QuestionBank } = require('../../models')
const { niv, } = require('../../utils')
const mongoose = require('mongoose')
const fs=require("fs")
class ContentController {
    constructor() {

    }

    async Create(req, res) {
        var form_data = req.body;
        const { topic_id,chapterID } = req.params;
        console.log(req.body)
        let validator;
        if(form_data.type=='VIDEO'|| form_data.type=='TEXT'|| form_data.type=='FILE')
        {
            validator = new niv.Validator(form_data, {
                title: 'required|string',
                description: 'required|string',
                content: form_data.type=='FILE'?'mime:pdf':'required|string',
                type: 'required|string',
            });
    
            validator.niceNames({
                title: "Title",
                description: 'Description',
                content: form_data.type=='TEXT'?'Text':form_data.type=='FILE'?'File':'Video ID',
                type: 'Type',
            })
        }
        else if(form_data.type=='QUIZ')
        {
            validator = new niv.Validator(form_data, {
                title: 'required|string',
                description: 'required|string',
                duration: 'required|string',
                passingGrade: 'required|string',
                type: 'required|string',
            });
    
            validator.niceNames({
                title: "Title",
                description: 'Description',
                duration: 'Quiz Duration',
                passingGrade: 'Passing Percentage',
                type: 'Type',
            })
        }
        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        try {
            var file_path = req.file?.path ? req.file.path.replace('public\\', "") : '';
            if (form_data?.type === 'QUIZ') {
                var quiz = new Quiz({
                    duration: form_data.duration,
                    passingGrade: form_data.passingGrade,
                    random: form_data.random,
                    difficulty: form_data.difficulty,
                })
                await quiz.save()
            }
            new Content({
                title: form_data?.title,
                topic: topic_id,
                description: form_data?.description,
                content: file_path ? file_path : form_data?.type === 'QUIZ' ? quiz?._id : form_data?.content,
                contentType: form_data?.type,
            })
                .save()
                .then(async (content) => {
                    if (content.contentType === 'QUIZ') {
                        const con = await content.populate({ path: 'content', model: Quiz });
                        console.log("yara:quiz",await Quiz.find())
                        return res.status(200).json({ content: con,topicID:topic_id,chapterID, message: 'Content added Successfully' })
                    }
                    return res.status(200).json({ content,topicID:topic_id,chapterID, message: 'Content added Successfully' })
                })
                .catch((error) => {
                    return res.status(400).json({ error: error, message: 'Form validation error' });
                })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Creating Content', message: 'Error ocurred' });
        }
    }


    async Update(req, res) {
        console.log("body:",req.body)
        var form_data = req.body;
        const { topic_id,chapterID } = req.params;
        const content_id=req.body._id
        if(!req.file)
        req.body.content=req.body.content.preview
        let validator;
        if(req.body.contentType=='VIDEO'|| req.body.contentType=='TEXT'|| req.body.contentType=='FILE')
        {
            validator = new niv.Validator(form_data, {
                title: 'required|string',
                description: 'required|string',
                content: req.body.contentType=='FILE'? req.file?'mime:pdf':'required|string':'required|string'
            });
    
            validator.niceNames({
                title: "Title",
                description: 'Description',
                content: req.body.contentType=='TEXT'?'Text': req.body.contentType=='FILE'?'File':'Video ID',
            })
        }
        else if(req.body.contentType=='QUIZ')
        {
            validator = new niv.Validator(form_data, {
                title: 'required|string',
                description: 'required|string',
                duration: 'required|string',
                passingGrade: 'required|string',
            });
    
            validator.niceNames({
                title: "Title",
                description: 'Description',
                duration: 'Quiz Duration',
                passingGrade: 'Passing Percentage',
            })
        }
        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        try {
            if(req.file)
            {
                let del=await Content.findOne({_id:req.body._id},{content:1})
                console.log("del:",del)
                let path='public\\'+del.content;
                fs.unlinkSync(path)
                req.body.content=req.file.path.replace('public\\', "")
                req.body.contentType='FILE'
            }
            else if(req?.body?.contentType==='QUIZ')
            {
               await Quiz.findOneAndUpdate({_id:req.body.content},{duration:req.body.duration,passingGrade:req.body.passingGrade,random:req.body.random,difficulty:req.body.difficulty,updated_at:new Date()})
               await Content.findOneAndUpdate({_id:req.body._id},{title:req.body.title,description:req.body.description,updated_at:new Date()})
              const updatedContent=await Content.findOne({_id:req.body._id}).populate({ path: 'content', model: Quiz })
                return res.status(200).json({ content: updatedContent,topicID:req.body.topic,chapterID, message: 'Content Updated Successfully'})
            }

            await Content.updateOne({_id:req.body._id},{title:req.body.title,description:req.body.description,content:req.body.content,updated_at:new Date()})
            return res.status(200).json({ content:req.body,topicID:req.body.topic,chapterID, message: 'Content Updated Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Updating Subject', message: 'Error ocurred' });
        }
    }


    async Get(req, res) {
        var { topic_id } = req.params;
        try {
            var contents = await Content.find({ topic: mongoose.Types.ObjectId(topic_id) });
            for (let i = 0; i < contents.length; i++) {
                if (contents[i].contentType === 'QUIZ') {
                    contents[i] = await contents[i].populate({ path: 'content', model: Quiz });
                }
            }
            return res.status(200).json({ Contents: contents })
        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }
    }


    async Delete(req, res) {
        var {contentID } = req.params;
        var {chapterID,topicID}=req.body
        try {
            var content = await Content.findById(contentID);
            if (content.contentType === 'QUIZ') {
                await Quiz.deleteOne({ _id: mongoose.Types.ObjectId(content.content) })
            }
            else if(content.contentType === 'FILE')
            {
                let path='public\\'+content.content;
                fs.unlinkSync(path)
            }
            await Content.deleteOne({ _id: contentID })
            return res.status(200).json({chapterID,topicID,contentID, message: 'Content removed Successfully' })
        }
        catch (e) {
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }


    async addQuestions(req, res) {
        var form_data = req.body;
        const { quiz_id } = req.params;
        const validator = new niv.Validator(form_data, {
            questions: 'required|array',
        });

        validator.niceNames({
            questions: "Questions",
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        try {
            const quiz = await Quiz.findById(quiz_id);
            quiz.questions = [...quiz.questions, ...form_data?.questions];
            await quiz.save();
            const populatedQuiz = await quiz.populate({ path: 'questions', model: QuestionBank });
            return res.status(200).json({ Quiz: populatedQuiz, message: 'Questions added Successfully to Quiz' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Adding Questions to Quiz', message: 'Error ocurred' });
        }
    }

    async addNewQuestion(req, res) {
        var form_data = req.body;
        const { quiz_id } = req.params;
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            question: 'required|string',
            explanation: 'string',
            options: 'required|array',
            answers: 'required|array',
            chapter: 'required|string',
            topic: 'required|string',
            subject: 'required|string',
            difficulty: 'required|string',
            tags: 'array',
        });

        validator.niceNames({
            question: "Question",
            explanation: 'Explanation',
            options: 'Options',
            answers: 'Answers',
            chapter: 'Chapter',
            topic: 'Topic',
            subject: 'Subject',
            difficulty: 'Difficulty',
            tags: 'Tags'

        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        try {
            const newQuestion = new QuestionBank({
                question: form_data?.question,
                explanation: form_data?.explanation,
                options: form_data?.options,
                answers: form_data?.answers,
                chapter: form_data?.chapter,
                topic: form_data?.topic,
                subject: form_data?.subject,
                difficulty: form_data?.difficulty,
                tags: form_data?.tags,
            })
            await newQuestion.save()
            const quiz = await Quiz.findById(quiz_id);
            quiz.questions = [...quiz.questions, newQuestion._id];
            await quiz.save();
            const populatedQuiz = await quiz.populate({ path: 'questions', model: QuestionBank });
            return res.status(200).json({ Quiz: populatedQuiz, message: 'New Question added Successfully to Quiz' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Adding New Questions to Quiz', message: 'Error ocurred' });
        }
    }


    async deleteQuestion(req, res) {
        const { quiz_id } = req.params;
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            question: 'required|string',
        });

        validator.niceNames({
            question: "Question",
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        try {
            const quiz = await Quiz.findById(quiz_id);
            quiz.questions = quiz.questions.filter((item) => (item != form_data?.question))
            await quiz.save();
            const populatedQuiz = await quiz.populate({ path: 'questions', model: QuestionBank });
            return res.status(200).json({ Quiz: populatedQuiz, message: 'Questions deleted Successfully to Quiz' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Deleting Question from Quiz', message: 'Error ocurred' });
        }
    }
}

module.exports = new ContentController();