//pg_ctl -D /postgresql/data start
module.exports = function(app, db) {
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:4200");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    }),
    app.get('/testdb', async (req, res) => {
        res.send(`DB url ${process.env.DATABASE_URL}`);
    }),
    app.get('/services', async (req, res) => {
        let service = await db.Models.Service.findAll();
        res.send(service);
    });
    app.post('/services/create', async (req, res) => {
        let object = convertToObj(req.body);
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
    app.post('/services/update', async (req, res) => {
        let object = convertToObj(req.body);

        let id = parseInt(object.id);
        if (isNaN(id) || object.category == null || object.url == null ||  object.name == null || object.description == null || object.price == null) return res.send(false);
        let product = await db.Models.Service.update({
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

    app.post('/services/delete', async (req, res) => {
        let object = convertToObj(req.body);

        let id = parseInt(object.id);
        if (isNaN(id)) return res.send(false);
        await db.Models.Service.destroy({
            where: {
                id: id,
            } 
        });
        res.send(true);
    });
};
let convertToObj = function(obj) {
    for (const key in obj) {
        return JSON.parse(key);
    }
}