
const Request = require('request.libary');

class Api {

	get request() {
		return new Request('https://api.github.com').headers({
			'User-Agent': 'azrcli/0.1 terminal/0.0',
			'Accept': 'application/vnd.github.mercy-preview+json'
		});
	}

	handle(res) {
		const h = res.headers();
		this.rate = {limit: h['x-ratelimit-limit'], remaining: h['x-ratelimit-remaining']};
		return res.parse();
	}

	getTopic(user, repo) {
		return this.request.get(`/repos/${user}/${repo}/topics`).then((res) => this.handle(res));
	}

	get(user, repo) {
		return this.request.get(`/repos/${user}/${repo}`).then((res) => this.handle(res));
	}

}

module.exports = new Api();
