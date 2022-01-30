const Parents = require("../../models");

class ParentsControllers {
    constructor() { }

    async searchParents(req, res) {
        var { cnic } = req.body;
        const searchResult = await Parents.find({ cnic: cnic })
        if (searchResult) {
            return res.status(200).send(searchResult);
        }
        else {
            return res.status(400).send("Invalid cnic")
        }
    }
}

module.exports = new ParentsControllers;