const { Notifications } = require("../../models");

class NotificationsController {
    constructor() { }
    async getNotifications(req, res) {
        var { id } = req.params;
        const notifications = await Notifications.find({ userId: id });
        if (notifications) {
            return res.status(200).send(notifications);
        }
        else {
            return res.status(404).send("Notifications not found");
        }

    }
    async updateNotifications(req, res) {
        var { id } = req.params;
        const checkNotification = await Notifications.findById(id);
        if (checkNotification) {
            await Notifications.findByIdAndUpdate(id, { read: true });
            return res.status(200).send(" Notification updated successfully")
        }
        else {
            return res.status(404).send("Notification not found");
        }
    }
}
module.exports = new NotificationsController;
