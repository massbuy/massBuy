const Package = require('../../models/packages');
// const multer = require('multer');


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads/')
//     },
//     filename: function (req, files, cb) {
//         cb(null, new Date().getMilliseconds() + files.originalname);
//     }
// });
// const upload = multer({ storage: storage }).single('image');

let routes = (app) => {


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