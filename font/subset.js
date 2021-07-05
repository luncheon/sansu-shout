const path = require("path");
const Fontmin = require("fontmin");

new Fontmin()
  .src(path.resolve(__dirname, "過充電FONT くれよん/KajudenFont-Crayon.ttf"))
  .use(Fontmin.glyph({ text: " 0123456789+-×=はじめるさんすうシャウトこたえがわかったらさけんでねまでのたしひきかけざんく" }))
  .use(Fontmin.ttf2woff2())
  .dest(path.resolve(__dirname, "../src/assets/"))
  .run((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
