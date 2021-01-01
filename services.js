const Solver = require("./services/geetest.js")

async function solveGeeTest(challenge) {
	
	if (!(challenge["id"] && challenge["gt"] && challenge["api_server"])){
		return {"error" : "Bad challenge data.", "status" : 406}
	}
	
	var solver = new Solver(challenge["id"], challenge["gt"], challenge["api_server"]);
	await solver.solve();
	
	var response = {
		"challenge" : challenge["id"],
		"time" : solver.time,
		"solved" : solver.success ? true : false,
		"validate" : solver.validate,
		"score" : solver.score,
		"status" : 200
	}
	
	return response;
}
module.exports = {solveGeeTest};

//replace with own
var data = {'gt': 'c16348f4281a767ed143eaf108f89bb3', 'id': '0f186fb748d60e959d87d618e661f364', 'api_server': 'apiv6.geetest.com'}

solveGeeTest(data).then(function (response) {
  console.log(response)
})