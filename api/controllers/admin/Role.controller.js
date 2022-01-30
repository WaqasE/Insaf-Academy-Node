const { Role } = require('../../models')
const { access, niv } = require('../../utils')

class RoleController {
    constructor() {
    }

    async Create(req, res) {

        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            name: 'required|string',
            permissions: 'required'
        });

        validator.niceNames({
            name: "Role Name",
            permissions: 'Permissions'
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors });
        }

        new Role({
            name: form_data.name,
            permissions: form_data.permissions
        })
            .save()
            .then((role) => {
                return res.status(200).json({ role, message: 'New role created successfully' })
            })
            .catch((error) => {
                return res.status(400).json({ error: error });
            })
    }

    async Update(req, res) {
        var { id } = req.params
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            name: 'required|string',
            permissions: 'required'
        });

        validator.niceNames({
            name: "Role Name",
            permissions: 'Permissions'
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors });
        }

        try {
            let oldRole = await Role.findById(id);
            oldRole.name = form_data?.name,
                oldRole.permissions = form_data?.permissions,
                oldRole.updated_at = new Date()
            await oldRole.save()
            return res.status(200).json({ role: oldRole, message: 'Role Updated Successfully' })
        }
        catch (error) {
            return res.status(400).json({ error: 'Error Updating Role' });
        }
    }


    async Get(req, res) {

        Role.find({}).then((roles) => {
            return res.status(200).json({ roles: roles });
        })
            .catch((error) => {
                console.log("Error", error)
            })
    }

    async Delete(req, res) {
        var { id } = req.params
        try {
            Role.findById(id).remove().exec();
            return res.status(200).json({ id: id, message: 'Role removed successfully' })

        }
        catch (e) {
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }


}

module.exports = new RoleController();