const Package = require('../../models/packages');
const Payment = require("../../models/payment");
const multer = require('multer');
const cloudinary = require('cloudinary').v2;


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getMilliseconds() + file.originalname);
    }
});
const fs = require('fs');

const upload = multer({ storage: storage }).single('image');
cloudinary.config({
    cloud_name: "dfv4cufzp",
    api_key: 861174487596545,
    api_secret: "6n_1lICquMhRN4YgAMzQlhuG6tY"
});

async function uploadToCloudinary(locaFilePath) {

    var mainFolderName = "massbuy"
    var filePathOnCloudinary = mainFolderName + "/" + locaFilePath;
    return cloudinary.uploader.upload(locaFilePath)
        .then((result) => {
            fs.unlinkSync(locaFilePath)
            return {
                message: "Success",
                url: result.url
            };
        }).catch((error) => {
            fs.unlinkSync(locaFilePath)
            return { message: "Fail", };
        });
};

let routes = (app) => {
    // upload file for payment made
    app.put('/payment/upload/:id', async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                console.log(err)
                res.json({ msg: "File Missing " })
            } else {
                if (req.file) {
                    var locaFilePath = req.file.path
                    var result = await uploadToCloudinary(locaFilePath);
                    req.body.image = [result.url][0];
                    try {
                        let payment = await Payment.updateOne({ _id: req.params.id }, { image: req.body.image }, { returnOriginal: false });
                        return res.json(payment)
                    }
                    catch (err) {
                        return res.status(500).send(err);
                    }
                }
            }
        });
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

    // get all payments
    app.get('/payments', async (req, res) => {
        try {
            let payment = await Payment.find().sort({ createdAt: -1 })
                .populate("package_id", "package_title")
                .populate("user_id", "firstname lastname")
            res.json(payment)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // get payments done for a package
    app.get('/payment/package/:id', async (req, res) => {
        try {
            let payments = await Payment.find({ package_id: req.params.id }).sort({ createdAt: -1 })
                .populate("package_id", "package_title")
                .populate("user_id", "firstname lastname")
            res.json(payments)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // get payments done by a user
    app.get('/payment/user/:id', async (req, res) => {
        try {
            let payments = await Payment.find({ user_id: req.params.id }).sort({ createdAt: -1 })
                .populate("package_id", "package_title")
                .populate("user_id", "firstname lastname")
            res.json(payments)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/package/user/:id', async (req, res) => {
        try {
            let arr = [];
            let duration;
            let packages = await Package.find({ user_id: req.params.id })
                .populate("product_id.item", "itemName price")
            packages.map((e, i) => {
                duration = e.duration
                e.product_id.map((a, b) => {
                    arr.push(+a.item.price.split(",").join(""))
                    return arr.reduce((a, b) => a + b, 0)
                })
            })
            let total = arr.reduce((a, b) => a + b, 0);
            let daily = total / (duration * 31)
            let weekly = total / (duration * 4)
            let monthly = total / (duration)
            await Package.updateOne({ user_id: req.params.id }, {
                total: total.toLocaleString(),
                daily: Math.ceil(daily).toLocaleString(),
                weekly: Math.ceil(weekly).toLocaleString(),
                monthly: Math.ceil(monthly).toLocaleString(),
            },
                { returnOriginal: false })
            let packagess = await Package.find({ user_id: req.params.id, status: "pending" })
                .populate("product_id.item", "itemName price")
            res.json(packagess)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.put('/payment/:id', async (req, res) => {
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

    // aprrove payment done by cash
    app.put('/approve/payment/:id', async (req, res) => {
        try {
            let payment = await Payment.updateOne({ _id: req.params.id }, { status: "confirmed" }, { returnOriginal: false });
            let package = await Package.find({ _id: payment.package_id })
            let oldAmount = Number(package.paid);
            let amount = Number(payment.amount)
            let updatedAmount = oldAmount + amount;
            await Package.updateOne({ _id: package.package_id }, { status: "order", paid: Number(updatedAmount.toLocaleString()) }, { returnOriginal: false });
            return res.json(payment)
        }
        catch (err) {
            res.status(500).send(err)
            throw err
        }
    });

    // make a payment by card
    app.post('/payment/user/:id', async (req, res) => {
        try {
            let package = await Package.find({ _id: req.params.id })
            let oldAmount = Number(package.paid);
            let { amount, user_id, package_id } = req.body;
            let updatedAmount = oldAmount + amount;
            let payment = new Payment({ amount: updatedAmount, user_id: user_id, package_id: package_id });
            await Package.updateOne({ _id: req.params.id }, { status: "order", paid: Number(updatedAmount.toLocaleString()) }, { returnOriginal: false });
            await payment.save()
            return res.json(payment)
        }
        catch (err) {
            res.status(500).send(err)
            throw err
        }
    });

    // make a payment by cash
    app.post('/payment/user/:id', async (req, res) => {
        try {
            let payment = new Payment(req.body);
            payment.status = "pending"
            await Package.updateOne({ _id: req.params.id }, { status: "paying" }, { returnOriginal: false });
            await payment.save()
            return res.json(payment)
        }
        catch (err) {
            res.status(500).send(err)
            throw err
        }
    });

    // app.get('/cart/user/:id', async (req, res) => {
    //     try {
    //         let arr = [];
    //         let duration;
    //         let packages = await Package.find({ user_id: req.params.id })
    //             .populate("product_id.item", "itemName price")
    //         packages.map((e, i) => {
    //             duration = e.duration
    //             e.product_id.map((a, b) => {
    //                 arr.push(+a.item.price.split(",").join(""))
    //                 return arr.reduce((a, b) => a + b, 0)
    //             })
    //         })
    //         let total = arr.reduce((a, b) => a + b, 0);
    //         let daily = total / (duration * 31)
    //         let weekly = total / (duration * 4)
    //         let monthly = total / (duration)
    //         await Package.updateOne({ user_id: req.params.id }, {
    //             total: total.toLocaleString(),
    //             daily: Math.ceil(daily).toLocaleString(),
    //             weekly: Math.ceil(weekly).toLocaleString(),
    //             monthly: Math.ceil(monthly).toLocaleString(),
    //         },
    //             { returnOriginal: false })
    //         let packagess = await Package.find({ user_id: req.params.id, status: "cart" })
    //             .populate("product_id.item", "itemName price")
    //         res.json(packagess)
    //     }
    //     catch (err) {
    //         res.status(500).send(err)
    //     }
    // });

    app.delete('/payment/:id', async (req, res) => {
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