const { Subject, Chapter, QuestionBank,Quiz } = require('../../models')
const { niv, } = require('../../utils')
const mongoose = require('mongoose')

class QuestionBankController {
    constructor() {
    }

    async Create(req, res) {
        try
        {
            await QuestionBank.insertMany(req.body.questions)
            return res.status(200).json({ questions:req.body.questions, message: 'Inserted successfully' })
        }
        catch(e)
        {
            console.log(e)
            return res.status(400).json({ error: e, message: 'error' });   
        }
    }
    async Save(req, res) {
        try{
            var questionsIDs=[...req.body.qBQuestions]
            let questions;
            await QuestionBank.insertMany(req.body.newQuestions,async (err,data)=>{
                if(!err)
                    for(let i=0;i<data.length;i++)
                        questionsIDs.push(data[i]._id) 
                else
                    return res.status(400).json({ error: error, message: 'error' });
                for(let i=0;i<req.body.quizQuestions.length;i++)
                    questionsIDs.push(req.body.quizQuestions[i]._id) 
                 let quiz=  await Quiz.findOne({_id:req.params.quizID})
                 quiz.questions=questionsIDs;
                 quiz= await quiz.save();
                questions=quiz.questions
                questions = await QuestionBank.find({ '_id': { $in:questions} }) //show quiz questions
            })
            return res.status(200).json({ questions, message: 'Quiz created successfully' })
        }
        catch(e)
        {
            console.log("eror")
            return res.status(400).json({ error: error, message: 'error' });
        }
    }

    async Update(req, res) {

        var { id } = req.params
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
            let oldQuestion = await QuestionBank.findById(id);
            oldQuestion.question = form_data?.question
            oldQuestion.explanation = form_data?.explanation
            oldQuestion.options = form_data?.options
            oldQuestion.answers = form_data?.answers
            oldQuestion.chapter = form_data?.chapter
            oldQuestion.topic = form_data?.topic
            oldQuestion.subject = form_data?.subject
            oldQuestion.difficulty = form_data?.difficulty
            oldQuestion.tags = form_data?.tags
            await oldQuestion.save()
            var ques = await QuestionBank.findById(id);
            return res.status(200).json({ question: ques, message: 'Question Updated Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Updating Question', message: 'Error ocurred' });
        }

    }

    async Get(req, res) {
        try {
            let quiz=  await Quiz.findOne({_id:req.params.quizID})
             let  questions=quiz.questions
             console.log("quiz:",quiz)
            questions = await QuestionBank.find({ '_id': { $in:questions} }) //show quiz questions
            console.log("Questions:",questions)
            return res.status(200).json({ questions });

        } catch (e) {
            console.log("error:",e)
            return res.status(400).json({ error: 'Error occured' });
        }

    }
    async GetAll(req, res) {
        try {
            const {userID}=req.params;
            console.log("bodY:",req.body)
            let tags=req.body.tags
            delete req.body.tags
            console.log("bodY:",tags)
            let questions;
            if(tags.length>0)
            questions = await QuestionBank.find({'Id':userID,...req.body,'tags': { $in: tags}})
            else
            questions = await QuestionBank.find({'Id':userID,...req.body})
            return res.status(200).json({ questions });

        } catch (e) {
            console.log("error:",e)
            return res.status(400).json({ error: 'Error occured' });
        }

    }
    async GetByTags(req, res) {
        const tags = req.body.tags;
        const userID=req.params.userID
        try {
            let quiz=  await Quiz.findOne({_id:req.params.quizID})
            let  questionIDs=quiz.questions
            var questions=userID ? await QuestionBank.find({'userID':{$in:userID},'tags': { $in: tags},"_id":{$nin:questionIDs} }):await QuestionBank.find({ 'tags': { $in: tags},"_id":{$nin:questionIDs} });
            return res.status(200).json({ questions });

        } catch (e) {
            console.log(e)
            return res.status(400).json({ error: 'Error occured' });
        }

    }


    async Delete(req, res) {
        var { questionID } = req.params
        try {
             await QuestionBank.deleteOne({_id:questionID})
             return res.status(200).json({ questionID, message: 'Question removed successfully' })
        }
        catch (e) {
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }


}

module.exports = new QuestionBankController();