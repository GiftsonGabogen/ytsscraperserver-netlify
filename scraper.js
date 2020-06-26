const fetch = require("node-fetch");
const cheerio = require("cheerio");

let domain = "yts.mx";

const defaultUrl = `https://${domain}/browse-movies`;
const movieUrl = `https://${domain}/movies`;

function defaultMovies(pageNum) {
  return (pageNum == 1
    ? fetch(defaultUrl)
    : fetch(`${defaultUrl}?page=${pageNum}`)
  )
    .then((response) => response.text())
    .then((body) => {
      const $ = cheerio.load(body);
      const Movies = [];
      $(".browse-movie-wrap").each(function (i, element) {
        const $element = $(element);
        const link = $element.find("a").attr("href");
        const title = $element
          .find("div.browse-movie-bottom a.browse-movie-title")
          .text();
        const year = $element.find("div.browse-movie-year").text();
        const thumbnail = $element.find("figure img").attr("src");
        const rating = $element.find("figcaption h4.rating").text();

        const genres = [];
        $element
          .find("figcaption h4:not([class])")
          .each(function (ig, genreEl) {
            genres.push($(genreEl).text());
          });

        Movies.push({ title, link, year, thumbnail, rating, genres });
      });
      return Movies;
    });
}

//yts.mx/browse-movies/title(0)/quality(all)/genre(all)/rating(0)/order(latest)/year(all)

const searchMovies = (title) => {
  const moviesWrapper = fetch(
    `${defaultUrl}/${title.replace(" ", "%20")}/all/all/0/latest/0/all`
  );
  return moviesWrapper
    .then((response) => response.text())
    .then((body) => {
      const $ = cheerio.load(body);
      const Movies = [];
      $(".browse-movie-wrap").each(function (i, element) {
        const $element = $(element);
        const link = $element.find("a").attr("href");
        const title = $element
          .find("div.browse-movie-bottom a.browse-movie-title")
          .text();
        const year = $element.find("div.browse-movie-year").text();
        const thumbnail = $element.find("figure img").attr("src");
        const rating = $element.find("figcaption h4.rating").text();

        const genres = [];
        $element
          .find("figcaption h4:not([class])")
          .each(function (ig, genreEl) {
            genres.push($(genreEl).text());
          });

        Movies.push({ title, link, year, thumbnail, rating, genres });
      });
      return Movies;
    });
};

const getMovie = (link) => {
  return fetch(`${movieUrl}/${link}`)
    .then((response) => response.text())
    .then((body) => {
      const $ = cheerio.load(body);
      const $container = $("div.container#movie-content");

      //Title
      const title = $container.find("#movie-info[data-movie-id] h1").text();

      //Year
      const year = $("#movie-info[data-movie-id] h2:nth-child(2)").text();

      //Genres
      const genres = $("#movie-info[data-movie-id] h2:nth-child(3)")
        .text()
        .split(" / ");

      //Poster
      const poster = $("div#movie-poster img[itemprop='image']").attr("src");

      //Synopsis
      const synopsis = $("div#synopsis p:nth-child(2)").text().trim();

      //Directors
      const directors = [];
      $("div.directors div.list-cast").each((i, el) => {
        const $el = $(el);
        let Avatar = $el
          .find("div:not([class='list-cast-info']) a.avatar-thumb img")
          .attr("src");
        let Name = $el.find("div.list-cast-info span[itemprop='name']").text();
        let Link = $el.find("div.list-cast-info a.name-cast").attr("href");
        directors.push({ Avatar, Name, Link });
      });

      //Actors
      const actors = [];
      $("div.actors div.list-cast").each((i, el) => {
        const $el = $(el);
        let Avatar = $el
          .find("div:not([class='list-cast-info']) a.avatar-thumb img")
          .attr("src");
        let Name = $el.find("div.list-cast-info span[itemprop='name']").text();
        let Link = $el.find("div.list-cast-info a.name-cast").attr("href");
        actors.push({ Avatar, Name, Link });
      });

      //Downloads
      const downloads = [];
      const downloadsWrapper = $container.find(
        "#movie-info[data-movie-id] p.hidden-xs.hidden-sm a:not([class])"
      );
      downloadsWrapper.each((i, el) => {
        const $el = $(el);
        let download = {};
        download.quality = $el.text();
        download.downloadLink = $el.attr("href");
        download.title = $el.attr("title");
        downloads.push(download);
      });

      //Ratings
      let $MovieWrapper = $("#movie-info[data-movie-id]");
      let Likes = {
        Rate: $MovieWrapper
          .find("div.rating-row:not([style]):nth-child(1) span#movie-likes")
          .text(),
      };
      let RottenTomatoesCritics = {
        Rate: $MovieWrapper
          .find("div.rating-row:not([style]):nth-child(2) span:not([class])")
          .text(),
        Link: $MovieWrapper
          .find("div.rating-row:not([style]):nth-child(2) a")
          .attr("href"),
      };
      let RottenTomatoesAudience = {
        Rate: $MovieWrapper
          .find("div.rating-row:not([style]):nth-child(3) span:not([class])")
          .text(),
        Link: $MovieWrapper
          .find("div.rating-row:not([style]):nth-child(3) a")
          .attr("href"),
      };
      let imdb = {
        Rate: $MovieWrapper
          .find(
            "div.rating-row:not([style]):nth-child(4) span[itemprop='ratingValue']"
          )
          .text(),
        Link: $MovieWrapper
          .find("div.rating-row:not([style]):nth-child(4) a")
          .attr("href"),
        RateCount: $MovieWrapper
          .find(
            "div.rating-row:not([style]):nth-child(4) span[itemprop='ratingCount']"
          )
          .text(),
      };

      let ratings = {
        Likes,
        RottenTomatoesAudience,
        RottenTomatoesCritics,
        imdb,
      };

      return {
        title,
        year,
        genres,
        downloads,
        ratings,
        poster,
        synopsis,
        directors,
        actors,
      };
    });
};

module.exports = {
  defaultMovies,
  searchMovies,
  getMovie,
};
