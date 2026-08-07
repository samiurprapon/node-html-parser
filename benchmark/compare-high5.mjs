import high5 from "high5";
import benchmark from 'htmlparser-benchmark';

const Parser = high5;

var token = [],
	tag = null,
	attribs = null;

function noop() { }

export default function high5parse() {
	return new Promise((resolve) => {

		var bench = benchmark(function (html, callback) {
			var settled = false;
			function settle(err) {
				if (settled) return;
				settled = true;
				callback(err);
			}

			try {
				var parser = new Parser({
					token: token,
					onopentagname: function (n) {
						attribs = {};
						tag = ["StartTag", n, attribs];
					},
					onclosetag: function (n) {
						token.push(["EndTag", n]);
					},
					ontext: function (t) {
						token.push(["Character", t]);
					},
					oncomment: function (t) {
						token.push(["Comment", t]);
					},
					onattribute: function (n, v) {
						if (!(n in attribs)) attribs[n] = v;
					},
					onopentagend: function () {
						token.push(tag);
						tag = attribs = null;
					},
					onselfclosingtag: function () {
						tag.push(true);
						token.push(tag);
						tag = attribs = null;
					},
					ondoctype: function (name, publicIdent, systemIdent, normalMode) {
						token.push(["DOCTYPE", name, publicIdent, systemIdent, normalMode]);
					},
					oncommentend: noop,
					onend: () => settle(),
					onerror: (err) => settle(err),
				});
				parser.end(html);
				// Fallback: if high5 emits neither end nor error, treat the parse
				// as done so the benchmark cannot stall forever.
				if (!settled) settle();
			} catch (err) {
				settle(err);
			}
		});

		bench.on('progress', function (key) {
			// console.log('finished parsing ' + key + '.html');
		});

		bench.on('result', function (stat) {
			console.log('high5           :' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
			resolve();
		});

		// If the benchmark library surfaces an error instead of a result, warn
		// and continue instead of hanging forever.
		bench.on('error', function (err) {
			console.error('high5           : benchmark error (' + (err && err.message) + ')');
			resolve();
		});
	});
}
