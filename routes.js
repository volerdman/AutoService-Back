//pg_ctl -D "Program Files"/postgresql/11/data start
let jwt = require('jsonwebtoken');
const secretKey = "myTestSecretKey";

module.exports = function (app, db) {
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:4200");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, descriptionization");
        next();
    }),
        app.get('/testdb', async (req, res) => {
            res.send(`DB url ${process.env.DATABASE_url}`);
        }),

        app.post('/services', async (req, res) => {
            let object = convertToObj(req.body);
            if (object.pageName == "admin") {
                jwt.verify(object.token, secretKey, async function (err, decoded) {
                    if (err) return res.send(false);
                    if (!decoded.isAdmin) return res.send(false);
                    let services = await db.Models.Service.findAll();
                    res.send(services);
                });
            }
            else {
                let services = await db.Models.Service.findAll();
                res.send(services);
            }

        });

    app.post('/login', async (req, res) => {
        let object = convertToObj(req.body);
        let user = await db.Models.User.findOne({
            where: {
                login: object.login,
                password: object.password
            }
        });
        if (user != null) {
            user.token = jwt.sign({ login: object.login, isAdmin: user.isAdmin }, secretKey);
            await user.save();
            res.send({
                login: user.login,
                token: user.token
            });
        }
        else {
            res.send(false);
        }
    });

    app.post('/services/create', async (req, res) => {
        let object = convertToObj(req.body);
        jwt.verify(object.token, secretKey, async function (err, decoded) {
            if (err) return res.send(false);
            if (!decoded.isAdmin) return res.send(false);
            object = object.data;
            if (object.url == null || object.name == null || object.category == null || object.description == null || object.price == null) return res.send(false);
            let service = await db.Models.Service.create({
                url: object.url,
                category: object.category,
                name: object.name,
                description: object.description,
                price: object.price
            });
            res.send(service);
        });
    });

    app.post('/reg', async (req, res) => {
        let object = convertToObj(req.body);
        let user = await db.Models.User.findOne({
            where: {
                login: object.login
            }
        });
        if (user == null) {
            let newUser = await db.Models.User.create({
                login: object.login,
                password: object.password,
                isAdmin: false,
                token: jwt.sign({
                    login: object.login,
                    isAdmin: false
                }, secretKey)
            });
            res.send(true);
        }
        else {
            res.send(false);
        }
    });

    app.post('/services/update', async (req, res) => {
        let object = convertToObj(req.body);
        jwt.verify(object.token, secretKey, async function (err, decoded) {
            if (err) return res.send(false);
            if (!decoded.isAdmin) return res.send(false);
            object = object.data;
            let id = parseInt(object.id);
            console.log(object);
            if (isNaN(id) || object.category == null || object.url == null || object.name == null || object.description == null || object.price == null) return res.send(false);
            let services = await db.Models.Service.update({
                url: object.url,
                category: object.category,
                name: object.name,
                description: object.description,
                price: object.price
            }, {
                where: {
                    id: id,
                }
            });
            res.send(object);
        });
    });


    app.post('/services/delete', async (req, res) => {
        let object = convertToObj(req.body);
        jwt.verify(object.token, secretKey, async function (err, decoded) {
            if (err) return res.send(false);
            if (!decoded.isAdmin) return res.send(false);
            object = object.data;
            let id = parseInt(object.id);

            if (isNaN(id)) return res.send(false);
            await db.Models.Service.destroy({
                where: {
                    id: id,
                }
            });
            res.send(true);
        });
    });
};
let convertToObj = function (obj) {
    for (const key in obj) {
        console.log(key);
        return JSON.parse(key);
    }
}