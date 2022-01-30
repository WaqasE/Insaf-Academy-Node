const { Subject, Chapter, Content, Quiz } = require('../../models')
const { niv, } = require('../../utils')
const mongoose = require('mongoose')

class ChapterController {
    constructor() {
    }
    // ------------------Chapter------------------
    async Create(req, res) {
        var form_data = req.body;
        console.log("hello creation")
        console.log(form_data)
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            subject: 'required',
            description: 'required|string',
            order: 'required|string'
        });

        validator.niceNames({
            title: "Chapter Title",
            subject: 'Subject',
            description: 'Description',
            order: 'Order'
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        new Chapter({
            title: form_data.title,
            subject: form_data.subject,
            description: form_data.description,
            order: form_data.order,
        })
            .save()
            .then((chapter) => {
                return res.status(200).json({ chapter, message: 'Chapter created and assigned successfully' })
            })
            .catch((error) => {
                return res.status(400).json({ error: error, message: 'Form validation error' });
            })


    }

    async Update(req, res) {

        var { id } = req.params
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            subject: 'required',
            description: 'required|string',
            order: 'required|string'
        });

        validator.niceNames({
            title: "Chapter Title",
            subject: 'Subject',
            description: 'Description',
            order: 'Order'
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }

        try {
            let oldChapter = await Chapter.findById(id);
            oldChapter.title = form_data?.title
            oldChapter.subject = form_data?.subject
            oldChapter.description = form_data?.description
            oldChapter.order = form_data?.order
            oldChapter.updated_at = new Date()
            await oldChapter.save()
            var chap = await Chapter.findById(id).populate('topics').populate({ path: 'topics', model: Chapter });
            return res.status(200).json({ Chapter: chap, message: 'Chapter Updated Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Updating Chapter', message: 'Error ocurred' });
        }

    }


    async Get(req, res) {
        var { sub_id } = req.params
        try {
            var chapter = await Chapter.find({ 'subject': sub_id });
            var chap = await Chapter.findById(id).populate('topics').populate({ path: 'topics', model: Chapter }).populate({ path: 'content', model: Content });
            return res.status(200).json({ Chapter: chap, message: 'Chapter Updated Successfully' })

        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }
    }




    async Delete(req, res) {
        var { id } = req.params
        try {
            await Chapter.findById(id).deleteOne();
            return res.status(200).json({ id: id, message: 'Chapter removed successfully' })

        }
        catch (e) {
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }


    // ------------------Topic------------------


    async CreateTopic(req, res) {
        var { chap_id } = req.params
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            description: 'required|string',
            order: 'required|string',
        });

        validator.niceNames({
            title: "Topic Title",
            description: 'Description',
            order: 'Order',

        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        try {
            let chapter = await Chapter.findById(chap_id);
            chapter.topics.push({
                title: form_data?.title,
                description: form_data?.description,
                order: form_data?.order
            });
            chapter.updated_at = new Date()
            await chapter.save()
            var chap = await Chapter.findById(chap_id).populate('topics').populate({ path: 'topics', model: Chapter });
            return res.status(200).json({ Chapter: chap,chapterID:chap_id, message: 'Topic added Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Creating Topic', message: 'Error ocurred' });
        }
    }

    // / Not working yet
    async UpdateTopic(req, res) {

        var { chap_id } = req.params
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            topic_id: 'string',
            title: 'required|string',
            description: 'required|string',
            order: 'required|string'
        });

        validator.niceNames({
            topic_id: "Topic Id",
            title: "Topic Title",
            description: 'Description',
            order: 'Order'
        })


        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }

        try {
            var chapter = await Chapter.findById(chap_id)
            const oldTopicIndex = chapter['topics'].findIndex((elem) => (elem._id == form_data.topic_id));
            chapter['topics'][oldTopicIndex].title = form_data?.title;
            chapter['topics'][oldTopicIndex].subject = form_data?.subject;
            chapter['topics'][oldTopicIndex].description = form_data?.description;
            chapter['topics'][oldTopicIndex].order = form_data?.order;
            chapter['topics'][oldTopicIndex].updated_at = new Date();
            await chapter.save()
            var chap = await Chapter.findById(chap_id).populate('topics').populate({ path: 'topics', model: Chapter });
            return res.status(200).json({ Chapter: chap,chapterID:chap_id, message: 'Topic Updated Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Updating Chapter', message: 'Error ocurred' });
        }

    }


    async GetTopics(req, res) {
        var { chap_id } = req.params;
        try {
            var chapter = await Chapter.findById(chap_id);
            const topics = chapter?.topics
            return res.status(200).json({ topics });

        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }
    }

    async DeleteTopic(req, res) {
        var { chap_id } = req.params
        try {
            var chap = await Chapter.findOne({ _id: chap_id });
            chap.topics = await chap.topics.filter(currentTopic => currentTopic._id != req.body?.topic_id)
            await chap.save();
            return res.status(200).json({ chapterID: chap_id, topicID: req.body.topic_id, message: 'Topic removed Successfully' })
        }
        catch (e) {
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }
}



module.exports = new ChapterController();