const Package = require('../../models/packages');

let routes = (app) => {
    app.post('/package', async (req, res) => {
        try {
            let package = new Package(req.body);
            await package.save()
            res.json(package)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // get all packages
    app.get('/packages', async (req, res) => {
        try {
            let packages = await Package.find({ status: "la" }).sort({ createdAt: -1 })
                .populate("user_id", "firstname lastname")
            res.json(packages)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    app.get('/package/:id', async (req, res) => {
        try {
            let packages = await Package.find({ _id: req.params.id })
                .populate("user_id", "firstname lastname")
            res.json(packages)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/package/:id', async (req, res) => {
        try {
            await Package.deleteOne()
            res.json({ msg: "Package Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;