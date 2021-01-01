const got = require('got');
const {getDistance} = require("./geetest/solve.js");
const {getPayload} = require("./geetest/payload_gen.js")

const headers = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0"};

class Solver {
  constructor(id, gt, api_server) {
    this.id = id;
	this.gt = gt;
	this.api_server = api_server;
  }
  

  async solve() {
	var t = Date.now();
	

	var url = `https://${this.api_server}/ajax.php?gt=${this.gt}&challenge=${this.id}&lang=en&pt=0&client_type=webcallback=geetest_1608962667889`

	var response = await got(url, {headers : headers});

	
	var url = `https://${this.api_server}/get.php?is_next=true&type=slide3&gt=${this.gt}&challenge=${this.id}&lang=en&https=true&protocol=https://&offline=false&product=popup&api_server=${this.api_server}&isPC=true&callback=geetest_1608963076920`

	var response = await got(url, {headers : headers});
	var challenge_data = JSON.parse(response.body.replace("geetest_1608963076920(", "").replace("})", "}"));
	
	var distance = await getDistance(challenge_data["bg"], challenge_data["fullbg"]);
	
	var payload = await getPayload(distance, challenge_data["gt"], challenge_data["challenge"], challenge_data["s"]);
	

	
	var url = `https://${this.api_server}/ajax.php?gt=${this.gt}&challenge=${this.id}&lang=en&pt=0&client_type=web&w=${payload}&callback=geetest_1608879686666`
	var response = await got(url, {headers : headers});
	var fin = JSON.parse(response.body.replace("geetest_1608879686666(", "").replace("})", "}"))
	

	
    this.validate = fin["validate"];
	this.score = fin["score"];
	this.success = fin["success"];
	this.time = Date.now()-t;
  }
  
}

module.exports = Solver;