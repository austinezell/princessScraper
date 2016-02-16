"use strict";
let cheerio = require("cheerio");
let request = require("request");
let fs = require("fs");
let data = [];

let url = "https://en.wikipedia.org/wiki/Disney_Princess";

function writeFile(princesses) {
  fs.writeFile("princesses.json", JSON.stringify(princesses), function(err){
    console.log(err ? err : "success");
  })
}

function makeRequests(arr) {
  arr.forEach( (obj)=>{
    request(obj.link, function(err, response, html){
      let $ = cheerio.load(html);
      let obj = {};
      let characterCell = false;
      let $infoBoxRows= $('.infobox:first-of-type').length ? $('.infobox:first-of-type>tr') :$('.infobox>tr');
      $infoBoxRows.each(function(i){
        if (i === 0) {
          obj.name = $(this).find("th").text()
        } else if( i=== 1){
          if ($(this).find("img").attr("src")){
            obj.image = "https:" + $(this).find("img").attr("src");
            characterCell = false;
          } else {
            characterCell = true;
          }

        } else if (characterCell) {
          if ($(this).find("img").attr("src")){
            obj.image = "https:" + $(this).find("img").attr("src");
            characterCell = false;
          }
        }
        else {
          let key = $(this).find("th").text().toLowerCase();
          key = key.replace(/\s/, "_");
          if (key !== "information"){
            let values = $(this).find("td").text().split(/\n/).filter(element=> element);
            obj[key] = values.length > 1 ? values : values[0];
          }
        }
      })
      if (obj.name){
        data.push(obj);
        if (data.length === arr.length){
          writeFile(data);
        }
      }
    })

  })
}



request(url, function(err, response, html){
  if(!err) {
    let $ = cheerio.load(html);
    let i = 0;
    let arr = [];
    let base = "https://en.wikipedia.org";
    let $links =$(".hatnote.relarticle.mainarticle>a");
    $links.each(function(j){
      let link = base + $(this).attr("href");
      let title = $(this).attr("title");
      let obj = {link, title};
      arr.push(obj);
      i++;
      if (i === 11) {
        makeRequests(arr);
      }
    })
  }
})
