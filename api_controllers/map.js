var router = require("express").Router();

var current_coverage = [
    // Sount West Border - Old Banff Coach Rd to Signal Hill/Glenmore Trail

    {lat: 51.104806, lng: -114.225411}, // Stoney
    {lat: 51.100335, lng: -114.230159}, // Stoney
    {lat: 51.095784, lng: -114.233407}, // Stoney
    {lat: 51.088722, lng: -114.232346}, // Stoney / 16 Ave NW
    {lat: 51.086850, lng: -114.223637}, // 16 Ave NW
    {lat: 51.082337, lng: -114.205080}, // 16 Ave NW
    {lat: 51.081820, lng: -114.195502}, // 16 Ave NW
    {lat: 51.080316, lng: -114.189740}, // 16 Ave NW / Sarcee Trail SW
    {lat: 51.075252, lng: -114.186822}, // Sarcee Trail SW
    {lat: 51.074042, lng: -114.189820}, // Patterson Blvd SW
    {lat: 51.073763, lng: -114.192415}, // Patterson Blvd SW
    {lat: 51.072679, lng: -114.199261}, // Cougar Ridge Dr SW
    {lat: 51.074971, lng: -114.206560}, // COugar Ridge Dr SW
    {lat: 51.075468, lng: -114.210909}, // 85 St SW
    {lat: 51.075867, lng: -114.214512}, // Paskapoo Dr SW / Cougar Ridge Green SW
    {lat: 51.076104, lng: -114.216988}, // Paskapoo Dr SW / Cougar Ridge Manor SW
    {lat: 51.076179, lng: -114.219610}, // Paskapoo Dr SW / Cougar Ridge Manor SW
    {lat: 51.076195, lng: -114.222648}, // Canada Olympic Rd SW
    {lat: 51.067023, lng: -114.222881}, // Old Banff Coach Rd SW
    {lat: 51.064282, lng: -114.223509}, // Wentworth Hill SW
    {lat: 51.057146, lng: -114.223618}, // Wentwillow Ln SW
    {lat: 51.056783, lng: -114.222823}, // Wentwillow Ln SW
    {lat: 51.052095, lng: -114.222957}, // Ascot Crescent SW
    {lat: 51.047937, lng: -114.223024}, // Ascot Point SW
    {lat: 51.047191, lng: -114.225395}, // Ascot Cliff Close SW
    {lat: 51.043365, lng: -114.228001}, // Webber Academy
    {lat: 51.037844, lng: -114.227469}, // 17 Ave SW
    {lat: 51.037790, lng: -114.231515}, // 17 Ave SW
    {lat: 51.034859, lng: -114.231677}, // Slopeview Dr SW
    {lat: 51.028568, lng: -114.228491}, // Slopes Rd SW
    {lat: 51.028579, lng: -114.227018}, // Slopes Rd SW
    {lat: 51.024913, lng: -114.225746}, // Slopes Gardens SW
    {lat: 51.020493, lng: -114.224304}, // Discovery Ridge Way SW
    {lat: 51.019250, lng: -114.232754}, // Discovery Ridge Blvd SW
    {lat: 51.017919, lng: -114.232016}, // Discovery Ridge Blvd SW
    {lat: 51.016880, lng: -114.225963}, // Discovery Ridge Cir SW
    {lat: 51.014828, lng: -114.220103}, // Discovery Ridge Manor SW
    {lat: 51.012078, lng: -114.215632}, // Wedgewoods Building 10
    {lat: 51.010620, lng: -114.209319}, // Discovery Valley Cove SW
    {lat: 51.009193, lng: -114.200118}, // Discovery Ridge Ponds
    {lat: 51.010905, lng: -114.199994}, // Discovery Dr SW
    {lat: 51.009605, lng: -114.195369}, // Discovery Rise SW
    {lat: 51.009405, lng: -114.192283}, // Discovery Dr SW
    {lat: 51.009225, lng: -114.172980}, // Glenmore Trail SW
    {lat: 51.009629, lng: -114.163006}, // Glenmore Trail / Sarcee Trail SW
    {lat: 51.008815, lng: -114.160576}, // Glenmore Trail SW
    {lat: 51.008760, lng: -114.145855}, // Glenmore Trail SW
    {lat: 51.008918, lng: -114.141715}, // Glenmore Trail / 37 St SW
    {lat: 50.994589, lng: -114.141104}, // 37 St / 66 Ave SW

    // South West Border - South of Glenmore 

    {lat: 50.978180, lng: -114.140479}, // 90 Ave SW
    {lat: 50.965994, lng: -114.140246}, // Oakwood Pl SW
    {lat: 50.963692, lng: -114.139639}, // Oakridge Pl SW
    {lat: 50.962880, lng: -114.140005}, // Cedarille Way SW
    {lat: 50.959879, lng: -114.140745}, // Cedarille Crescent SW
    {lat: 50.957754, lng: -114.140394}, // Cedardale Pl SW
    {lat: 50.954854, lng: -114.139678}, // Cedardale Rd SW
    {lat: 50.952738, lng: -114.138535}, // Cedardale Rd SW
    {lat: 50.950507, lng: -114.135882}, // Anderson Rd SW (West corner)

    // South Border

    {lat: 50.950527, lng: -114.117981}, // Anderson Rd / 24 St SW
    {lat: 50.950603, lng: -114.108941}, // Anderson Rd / Woodpark Blvd SW
    {lat: 50.950587, lng: -114.094937}, // Anderson Rd / 14 St SW
    {lat: 50.950563, lng: -114.084374}, // Anderson Rd / Elbow Dr SW
    {lat: 50.950592, lng: -114.071081}, // Anderson Rd / Macleod Trail SE
    {lat: 50.950348, lng: -114.065019}, // Anderson Rd (East side)
    {lat: 50.949324, lng: -114.060058}, // Anderson Rd / Bonaventure Dr SE
    {lat: 50.948340, lng: -114.054832}, // Anderson Rd
    {lat: 50.948278, lng: -114.041872}, // Anderson Rd / Acadia Dr SE
    {lat: 50.948361, lng: -114.031914}, // Anderson Rd
    {lat: 50.951044, lng: -114.026249}, // Anderson Rd / Deerfoot Trail


    // East Border

    {lat: 50.952209, lng: -114.018694}, // Deerfoot East
    {lat: 50.951453, lng: -114.013783}, // Deerfoot East
    {lat: 50.949097, lng: -114.004015}, // Deerfoot East / 24 St SE
    {lat: 50.951717, lng: -114.002787}, // 24 St SE
    {lat: 50.953545, lng: -114.000862}, // 24 St SE / 114 Ave SE
    {lat: 50.955233, lng: -114.000555}, // 24 St SE
    {lat: 50.956529, lng: -114.001213}, // 24 St SE
    {lat: 50.957566, lng: -114.001548}, // 24 St SE
    {lat: 50.972680, lng: -114.001639}, // 24 St SE
    {lat: 50.974673, lng: -114.001348}, // 24 St SE
    {lat: 50.976459, lng: -113.999269}, // 24 St SE / 86 Ave SE
    {lat: 50.977220, lng: -113.999009}, // 24 St SE
    {lat: 50.983194, lng: -113.998768}, // 24 St SE / 78 Ave SE
    {lat: 50.983249, lng: -113.995182}, // 78 Ave SE
    {lat: 50.984452, lng: -113.995267}, // 78 Ave SE
    {lat: 50.985041, lng: -113.995616}, // 78 Ave SE
    {lat: 50.986998, lng: -113.997339}, // 26a St SE
    {lat: 50.991278, lng: -114.001687}, // Ogden Rd / 69 Ave SE
    {lat: 51.001544, lng: -114.011454}, // Ogden Rd
    {lat: 51.003690, lng: -114.012456}, // Ogden Rd
    {lat: 51.010248, lng: -114.010524}, // Ogden Rd / Deerfoot SE
    {lat: 51.015084, lng: -114.005056}, // Deerfoot / Peigan Trail SE
    {lat: 51.023345, lng: -114.000786}, // Deerfoot / 34 Ave SE
    {lat: 51.031616, lng: -113.997481}, // Deerfoot
    {lat: 51.034443, lng: -113.999240}, // Deerfoot
    {lat: 51.037169, lng: -114.004583}, // Deerfoot / 17 Ave SE
    {lat: 51.043591, lng: -114.008918}, // Deerfoot
    {lat: 51.048293, lng: -114.018123}, // Deerfoot
    {lat: 51.055576, lng: -114.020526}, // Deerfoot
    {lat: 51.059252, lng: -114.023446}, // Deerfoot / 8 Ave NE
    {lat: 51.063021, lng: -114.027135}, // Deerfoot
    {lat: 51.066904, lng: -114.026990}, // Deerfoot / 16 Ave NE
    {lat: 51.073499, lng: -114.026393}, // Deerfoot / Airways Park
    {lat: 51.081501, lng: -114.034527}, // Deerfoot / 32 Ave NE
    {lat: 51.096184, lng: -114.041396}, // Deerfoot / McKnight Blvd
    {lat: 51.098822, lng: -114.043194}, // Deerfoot
    {lat: 51.102608, lng: -114.045507}, // Deerfoot
    {lat: 51.110630, lng: -114.047204}, // Deerfoot / 64 Ave NE
    {lat: 51.118739, lng: -114.046563}, // Deerfoot
    {lat: 51.123328, lng: -114.045681}, // Deerfoot / Beddington Trail NW

    // North East Border
    
    {lat: 51.125159, lng: -114.046138}, // Beddington Trail / Deerfoot Trail NE
    {lat: 51.131149, lng: -114.045127}, // Deerfoot Trail NE
    {lat: 51.141065, lng: -114.035258}, // 96 Ave NE / Deerfoot Trail NE
    {lat: 51.154393, lng: -114.018252}, // Country Hills Blvd / Deerfoot Trail NE
    {lat: 51.163326, lng: -114.003915}, // Deerfoot Trail NE
    {lat: 51.175835, lng: -114.000818}, // Stoney Trail / Deerfoot Trail NE
    {lat: 51.175670, lng: -114.029168}, // Stoney Trail
    {lat: 51.175111, lng: -114.045127}, // Stoney Trail
    {lat: 51.173235, lng: -114.058200}, // Stoney Trail
    {lat: 51.173597, lng: -114.068700}, // Stoney Trail / Harvest Hills Blvd N
    {lat: 51.174880, lng: -114.085972}, // Stoney Trail
    {lat: 51.173564, lng: -114.095527}, // Stoney Trail / 14 St NW
    {lat: 51.167869, lng: -114.104819}, // Stoney Trail
    {lat: 51.160330, lng: -114.110384}, // Stoney Trail

    // North Border

    {lat: 51.156814, lng: -114.115781}, // Stoney / Beddington Trail NW
    {lat: 51.154622, lng: -114.120532}, // Stoney
    {lat: 51.152991, lng: -114.126985}, // Stoney
    {lat: 51.152148, lng: -114.140519}, // Stoney / Shaganappi Trail NW
    {lat: 51.152362, lng: -114.153676}, // Stoney
    {lat: 51.151931, lng: -114.165628}, // Stoney / Sarcee Trail NW
    {lat: 51.150799, lng: -114.181032}, // Stoney
    {lat: 51.150574, lng: -114.189726}, // Stoney
    {lat: 51.149899, lng: -114.192953}, // Stoney
    {lat: 51.148212, lng: -114.198152}, // Stoney
    {lat: 51.144670, lng: -114.203171}, // Stoney / Country Hill Blvd NW
    {lat: 51.146717, lng: -114.209347}, // Country Hill Blvd NW
    {lat: 51.149872, lng: -114.213314}, // Country Hill Blvd NW / 112 Ave NW
    {lat: 51.152810, lng: -114.216432}, // Country Hill Blvd NW
    {lat: 51.153622, lng: -114.218075}, // Country Hill Blvd NW
    {lat: 51.154184, lng: -114.220406}, // Country Hill Blvd NW
    {lat: 51.154118, lng: -114.234274}, // Country Hill Blvd NW / Rocky Ridge Road NW
    {lat: 51.154122, lng: -114.241365}, // Country Hill Blvd NW
    {lat: 51.154025, lng: -114.242352}, // Country Hill Blvd NW
    {lat: 51.154016, lng: -114.248485}, // Country Hill Blvd NW / Rocky Ridge Blvd NW
    {lat: 51.154008, lng: -114.252855}, // Country Hill Blvd NW / Rockyspring Gate NW
    {lat: 51.153796, lng: -114.254971}, // Country Hill Blvd NW / Rockyspring Gate NW
    {lat: 51.153967, lng: -114.257478}, // Country Hill Blvd NW / 12 Mile Coulee Rd NW
    {lat: 51.145680, lng: -114.257428}, // 12 Mile Coulee Rd NW
    {lat: 51.144198, lng: -114.256611}, // 12 Mile Coulee Rd NW
    {lat: 51.143374, lng: -114.256990}, // 12 Mile Coulee Rd NW / Crowchild Rd
    {lat: 51.142179, lng: -114.257499}, // 12 Mile Coulee Rd NW
    {lat: 51.132390, lng: -114.257426}, // 12 Mile Coulee Rd NW / Tuscany Way NW
    {lat: 51.117679, lng: -114.257461}, // 12 Mile Coulee Rd NW
    {lat: 51.107596, lng: -114.256948}, // Two Toed Pond
    {lat: 51.107139, lng: -114.243856}, // Nose Hill Dr NW
    {lat: 51.106575, lng: -114.224708}, // Nose Hill Dr NW / Stoney Trail NW
    

    // {lat: 51.140566, lng: -114.207420}, // Stoney
    // {lat: 51.136920, lng: -114.216915}, // Stoney
    // {lat: 51.134451, lng: -114.222913}  // Stoney
]

router.get("/coverage", function(req, res, next){
    res.status(200).json({
        success: true,
        coverage: current_coverage
    });
});

module.exports = router;