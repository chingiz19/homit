var router = require("express").Router();
var fs = require("fs");
var path = require("path");

router.get("/coverage", function(req, res, next){
    fs.readFile(path.join(ROOT_PATH, "/www/coverage/calgary.json"), (err, data) => {
        if (err) {
            Logger.log.error("Couldn't load coverage map data", err);
            res.status(200).json({
                success: false
            });
            return;
        }
        try{
            data = JSON.parse(data);
        } catch(err) {
            Logger.log.error("Coverage file is not in valid JSON format");
            res.status(200).json({
                success: false
            });
            return;
        }
        let dataToSend = [];
        for (let d of data) {
            let tmp = {};
            tmp.lng = d[0];
            tmp.lat = d[1];
            dataToSend.push(tmp);
        }
        res.status(200).json({
            success: true,
            coverage: dataToSend
        });
    });
});

module.exports = router;