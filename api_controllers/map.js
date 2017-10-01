var router = require("express").Router();

var current_coverage = [
    // West Border
    
    {lat: 51.110472, lng: -114.178363}, // Silver Springs Gate/ Crowchild NW
    {lat: 51.102593, lng: -114.181126}, // Silver Springs Gate / Varsity Estates Pl NW
    {lat: 51.097361, lng: -114.177009}, // Varsity Estates Pl / Varsity Estates Dr NW
    {lat: 51.094212, lng: -114.171615}, // Varsity Green NW
    {lat: 51.091511, lng: -114.173991}, // Varsity Pl / Varsity Rd NW
    {lat: 51.085834, lng: -114.164187}, // Bow River Pathway / West of Marker Mall
    {lat: 51.082127, lng: -114.165149}, // Bow River Pathway / West of Marker Mall
    {lat: 51.080003, lng: -114.167746}, // 52 St / 19 Ave NW
    {lat: 51.078347, lng: -114.172044}, // Bowness Rd / Bow River

    // South Border

    {lat: 51.075449, lng: -114.167890}, // Bowness Rd / Bowmont Animal Hospital NW 
    {lat: 51.074795, lng: -114.168072}, // 16 Ave NW 
    {lat: 51.073821, lng: -114.165848}, // Pizza Hut / 16 Ave NW
    {lat: 51.073244, lng: -114.164558}, // Home Rd / 16 Ave NW
    {lat: 51.068338, lng: -114.164484}, // Home Rd / Bow River NW
    {lat: 51.067856, lng: -114.161915}, // Montgomery Blvd / Montgomery Rd NW
    {lat: 51.067576, lng: -114.158524}, // 43 St NW / Bow River Pathway
    {lat: 51.065635, lng: -114.154147}, // Montgomery View NW
    {lat: 51.061585, lng: -114.149600}, // Point McKay Cersent NW
    {lat: 51.059771, lng: -114.147721}, // Point McKay Groove NW
    {lat: 51.057849, lng: -114.145307}, // Point McKay Gardens NW
    {lat: 51.056919, lng: -114.141264}, // 37 St NW / Parkdale Blvd NW
    {lat: 51.056502, lng: -114.134490}, // Parkdale Blvd NW / 32 St NW
    {lat: 51.054118, lng: -114.125587}, // Parkdale Blvd NW / 27 St NW
    {lat: 51.051097, lng: -114.119290}, // Parkdale Blvd NW / Bowness Rd NW
    {lat: 51.047584, lng: -114.115277}, // Crowchild / Bow River
    {lat: 51.049088, lng: -114.105535}, // Memorial / 19 St NW
    {lat: 51.049193, lng: -114.094754}, // Memorial / 14 St NW
    {lat: 51.051885, lng: -114.085786}, // Memorial / 10 St NW
    {lat: 51.052574, lng: -114.082977}, // Memorial / 9a St NW
    {lat: 51.056859, lng: -114.075631}, // Memorial / 5a St NW
    {lat: 51.057555, lng: -114.071570}, // Memorial / 4 St NW 
    {lat: 51.056930, lng: -114.065988}, // Memorial / Sunnyside Bank Park 
    {lat: 51.053680, lng: -114.062429}, // Memorial / Center Street
    {lat: 51.050098, lng: -114.050542}, // Memorial /  5 Ave SE
    {lat: 51.047654, lng: -114.036242}, // Memorial / Zoo Rd NE
    {lat: 51.047932, lng: -114.017662}, // Memorial / Deerfoot

    // East Border

    {lat: 51.059252, lng: -114.023446}, // Deerfoot / 8 Ave NE
    {lat: 51.066904, lng: -114.026990}, // Deerfoot / 16 Ave NE
    {lat: 51.073499, lng: -114.026393}, // Deerfoot / Airways Park
    {lat: 51.081501, lng: -114.034527}, // Deerfoot / 32 Ave NE
    {lat: 51.096184, lng: -114.041396}, // Deerfoot / McKnight Blvd

    // North Border

    {lat: 51.096064, lng: -114.054002}, // McKnight Blvd / 4 St NE
    {lat: 51.096071, lng: -114.062470}, // McKnight Blvd / Center St
    {lat: 51.096071, lng: -114.071545}, // McKnight Blvd / 4 St NW
    {lat: 51.096461, lng: -114.074348}, // McKnight Blvd / 4-7 St NW
    {lat: 51.096041, lng: -114.077737}, // McKnight Blvd / Northmount Dr NW
    {lat: 51.097232, lng: -114.083221}, // McKnight Blvd / John Laurie NW
    {lat: 51.095872, lng: -114.084106}, // John Laurie / Hilton Ave NW
    {lat: 51.090877, lng: -114.089768}, // John Laurie / 40 Ave NW
    {lat: 51.089401, lng: -114.094789}, // John Laurie / 14 St NW
    {lat: 51.092723, lng: -114.106501}, // John Laurie / 19 St NW
    {lat: 51.096933, lng: -114.116781}, // John Laurie / Charleswood Dr NW
    {lat: 51.103313, lng: -114.127157}, // John Laurie / Brisebois Dr NW
    {lat: 51.106129, lng: -114.132643}, // John Laurie / Brenner Dr NW
    {lat: 51.109696, lng: -114.141086}, // John Laurie / Shaganappi NW
    {lat: 51.111404, lng: -114.139082}, // Edgemont Ct NW
    {lat: 51.115147, lng: -114.143978}, // Edgemont Hill / Edgemont Rd NW
    {lat: 51.115645, lng: -114.142893}, // Edgemont Bay South
    {lat: 51.117146, lng: -114.143340}, // Edgemont Bay North
    {lat: 51.118797, lng: -114.147481}, // Edgemont Rd / Edgemont Estates NW
    {lat: 51.119046, lng: -114.153561}, // Edgemont Estates / Edgedale Dr NW
    {lat: 51.118304, lng: -114.155087}, // Edgemont Blvd NW
    {lat: 51.116657, lng: -114.153155}, // Edgemont Blvd / Edgemont Rd NW
    {lat: 51.111147, lng: -114.158808}, // 53 St / Dalhart Dr NW
    {lat: 51.105217, lng: -114.165105}  // 53 St / Crowchild NW
]

router.get("/coverage", function(req, res, next){
    res.status(200).json({
        success: true,
        coverage: current_coverage
    });
});

module.exports = router;