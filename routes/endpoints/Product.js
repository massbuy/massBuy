const Product = require('../../models/product');
const multer = require('multer');

const { google } = require('googleapis');
// const GoogleStorage = require('google-drive-storage');

// const auth = new google.auth.GoogleAuth({
//     keyFile: './your-google-service-account-key-file.json',
//     scopes: [
//         'https://www.googleapis.com/auth/drive',
//         'https://www.googleapis.com/auth/drive.file',
//         'https://www.googleapis.com/auth/drive.appdata',
//         'https://www.googleapis.com/auth/drive.readonly',
//         'https://www.googleapis.com/auth/drive.metadata.readonly',
//         'https://www.googleapis.com/auth/drive.metadata',
//         'https://www.googleapis.com/auth/drive.photos.readonly'
//     ],
// });

// const drive = google.drive({ version: 'v3', auth });


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, files, cb) {
        cb(null, new Date().getMilliseconds() + files.originalname);
    }
});

// const uploading = multer({
//     storage: GoogleStorage({
//         drive: drive,
//         driveId: '1WEEO3vGe-X7HmwEKffJlCw3xWtSMgL3k',
//         filename: function (req, files, cb) {
//             cb(null, new Date().getMilliseconds() + files.originalname);
//         }
//     })
// });

// const upload = multer({ storage: uploading }).single('image');
const upload = multer({ storage: storage }).single('image');

let routes = (app) => {
    app.post('/product', async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                res.json({ msg: "File Missing " })
            } else {
                if (req.file) {
                    req.body.image = '/' + req.file.path;
                    try {
                        const { itemName, price, image, details, spec, feature,
                            user_id } = req.body;
                        if (!user_id)
                            return res.status(500).json({ msg: "Please Login In" })
                        if (!itemName || !price)
                            return res.status(500).json({ msg: "Please fill in Product Name and Price at least!" })
                        if (!image)
                            return res.status(500).json({ msg: "Please Upload Product Image" })
                        const newProduct = {
                            itemName, price: price.toLocaleString, image, details, spec, feature,
                            user_id
                        };
                        let newProduct_ = new Product(newProduct);
                        await newProduct_.save()
                        return res.status(200).json({ msg: "Product Successfully Created" })

                    }
                    catch (err) {
                        return res.status(500).send('err');
                    }
                }
            }
        });
    });

    // get all products
    app.get('/products', async (req, res) => {
        try {
            let products = await Product.find({ status: "active" }).sort({ createdAt: -1 })
                .populate("user_id", "firstname lastname")
            res.json(products)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // get latest 8 products
    app.get('/product-8', async (req, res) => {
        try {
            let products = await Product.find().sort({ createdAt: -1 }).limit(8)
                .populate("user_id", "firstname lastname")
            res.json(products)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/product/:id', async (req, res) => {
        try {
            let products = await Product.findOne({ _id: req.params.id })
                .populate("user_id", "firstname lastname")
            res.json(products)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/product/:id', async (req, res) => {
        try {
            await Product.deleteOne()
            res.json({ msg: "Product Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;