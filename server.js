const http   = require('http')
  , url    = require('url')
  , fs     = require('fs')
  , NC     = require('./node_modules/nearest-color/nearestColor.js')
  , colors = JSON.parse(fs.readFileSync('./dist/colornames.json', 'utf8'))
  , port = process.env.PORT || 8080
  , baseUrl = 'v1/';

let colorsObj = {};

colors.forEach(c => {
  colorsObj[c.name] = c.hex;
});

const nc = NC.from(colorsObj);

http.createServer((req, res) => {
  const isAPI = req.url.indexOf(baseUrl) !== -1;
  let colorQuery = req.url.toLowerCase();
  colorQuery = colorQuery.split(baseUrl)[1];
  const isValidColor = /(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(colorQuery);

  let color = {
    query: colorQuery,
    name: null,
    hex: null,
    rgb: null,
    isExact: false,
  };

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  res.writeHead(200, {"Content-Type": "application/json"});

  if(isValidColor && isAPI) {
    let closestColor = nc('#' + colorQuery);
    color.name = closestColor.name;
    color.hex = closestColor.value;
    color.rgb = closestColor.rgb;
    color.isExact = closestColor.value.substr(1) === colorQuery;
    res.write(JSON.stringify(color));
    res.end();
    console.log(`Color ${color.name} requested`);
  } else {
    res.write(JSON.stringify({error: `${req.url} is not a valid color.`}));
    res.end();
  }
}).listen(port, '0.0.0.0');

console.log(`Server running and listening on port ${port}`);
