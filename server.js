const http   = require('http')
  , url    = require('url')
  , fs     = require('fs')
  , NC     = require('nearest-color')
  , colors = JSON.parse(fs.readFileSync('./dist/colornames.json', 'utf8'));

let colorsObj = {};

colors.forEach(c => {
  colorsObj[c.name] = c.hex;
});

const nc = NC.from(colorsObj);

http.createServer((req, res) => {
  const colorQuery = req.url.substr(1).toLowerCase();
  const isValidColor = /(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(colorQuery);
  let color = {
    query: req.url.substr(1),
    name: null,
    hex: null,
    rgb: null,
    isExact: false,
  };

  res.writeHead(200, {"Content-Type": "application/json"});

  if(isValidColor) {
    let closestColor = nc('#' + colorQuery);
    color.name = closestColor.name;
    color.hex = closestColor.value;
    color.rgb = closestColor.rgb;
    color.isExact = closestColor.value.substr(1) === colorQuery;
    res.write(JSON.stringify(color));
    res.end();
  } else {
    res.write(JSON.stringify({error: `${req.url.substr(1)} is not a valid color.`}))
  }
}).listen(8080,'0.0.0.0');

console.log('Server running.');
