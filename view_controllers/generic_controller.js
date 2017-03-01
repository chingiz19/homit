var router = require("express").Router();
var fileSystem = require("fs");
var ejs = require("EJS");

var headerEjs = fileSystem.readFileSync('public/partial/header.ejs', 'utf-8');
var footerEjs = fileSystem.readFileSync('public/partial/footer.ejs', 'utf-8');

router.route('/')
	.get(function(req, res, next){
		res.redirect(req.originalUrl + 'main');
	});

router.get('/main', function(req, res, next){
	var body = fileSystem.readFileSync("public/view/main.html", 'utf-8');
	res.headerOptions = {title: "Main Page"};
	res.footerOptions = null;
	res.body = body;
	next();
});

/**
 * Middleware to append header and footer
 */
router.use(function(req, res, next){
	var header = ejs.render(headerEjs, res.headerOptions);
	var footer = ejs.render(footerEjs, res.footerOptions);
	var html = header + res.body + footer;
	res.send(html);
});

router.use(function(err, req, res, next){
	console.log("-- > Something went wrong while rendering");
	console.log("-- > " + req.path);
	next();
});

module.exports = router;