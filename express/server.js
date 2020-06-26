const express = require("express");
/* const cors = require('cors'); */
const serverless = require("serverless-http");

const scraper = require("../scraper");

const app = express();
/* app.use(cors()); */

app.get("/:num", (req, res) => {
  let num = req.params.num === undefined ? "1" : req.params.num;
  scraper.defaultMovies(num).then((movies) => {
    res.json(movies);
  });
});

// /search/star wars
// /search/fight club
// /search/office space
app.get("/search/:title", (req, res) => {
  scraper.searchMovies(req.params.title).then((movies) => {
    res.json(movies);
  });
});

app.get("/movie/:imdbID", (req, res) => {
  scraper.getMovie(req.params.imdbID).then((movie) => {
    res.json(movie);
  });
});

module.exports.handler = serverless(app);
