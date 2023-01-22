const Package = require('../../models/packages');
const { auth } = require("../middlewares/loggedIn");
const User = require("../../models/user");

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

    app.post('/package/user', async (req, res) => {
        try {
            // const { user_id } = req.body;
            // const user = await User.findOne({ _id: user_id });
            // if (!user) return res.status(400).json({ msg: "you must to login" })
            let package = new Package(req.body);
            package.status = "pending";
            await package.save()
            res.json(package)
        }
        catch (err) {
            res.status(500).send(err.message)
        }
    });

    // get all packages
    app.get('/packages', async (req, res) => {
        try {
            let packages = await Package.find().sort({ createdAt: -1 })
                .populate("product_id.item")
                .populate("package_category")
                .populate("user_id", "firstname lastname role")
            res.json(packages)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    app.get('/package/:id', async (req, res) => {
        try {
            let packages = await Package.find({ _id: req.params.id })
                .populate("product_id", "itemName price")
                .populate("user_id", "firstname lastname role")
            res.json(packages)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/package/user/:id', async (req, res) => {
        try {
            let packages = await Package.find({ user_id: req.params.id })
                .populate("product_id.item", "itemName price")
            res.json(packages)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.put('/package/user/:id', async (req, res) => {
        try {
            let update = req.body;
            let package = await Package.updateOne({ _id: req.params.id }, update, { returnOriginal: false });
            return res.json(package)
        }
        catch (err) {
            res.status(500).send(err)
            throw err
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