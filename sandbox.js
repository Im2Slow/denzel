/* eslint-disable no-console, no-process-exit */
const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';
const express = require('express');
const bodyParser = require('body-parser');
const mongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectID;
const CONNECTION_URL= "mongodb+srv://akeris:esilv@cluster0-areb1.mongodb.net/test?retryWrites=true";
const DATABASE_NAME= "IMDb-Denzel";

var app = express();

async function populate (actor, callback) {
  try{
    const movies = await imdb(actor);
    return movies;
  }
  catch(e){
    throw e;
  }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
var database, collection;

app.get("/movies/populate", async (request, response)=>{
  collection.insertMany(await populate(DENZEL_IMDB_ID), (error, result) =>{
    if(error){
      return response.status(500).send(error);
    }
    response.send(result);
  });
});

app.get("/movies", (request, response)=>{
  collection.findOne({metascore: {$gte:70}}, (error, result) =>{
    if(error){
      return response.status(500).send(error);
    }
    response.send(result);
  });
});

app.get("/movies/:id", (request, response) => {
  collection.findOne({"id": request.params.id}, (error, result) => {
    if(error){
      return response.status(500).send(error);
    }
    response.send(result);
  });
});

//Doesn't Work

// app.get("/movies/search", (request, response) => {
//   collection.aggregate([{$group:{metascore: {$gte: request.query.metascore}}},
//     {$sort : {metascore: -1}},
//     {$limit : request.query.limit}], (error, result) => {
//       if(error){
//         return response.status(500).send(error);
//       }
//       response.send(result);
//     });
//   });

//Doesn't Work
  app.get("/movies/search", (request, response) => {
    collection.find({metascore:{$gte: request.query.metascore}}
      , {limit: request.query.limit}, (error, result) => {
      console.log(result);
      if(error){
        return response.status(500).send(error);
      }
      response.send(result[0]);
    });
  });

  app.post("/movies/:id", (request, response) => {
    collection.updateOne(
      {"id": request.params.id},
      {$set: {date: request.body.date, review: request.body.review} },
      { upsert: true}, (error, result) =>{
        if(error){
          return response.status(500).send(error);
        }
        response.send(result.result);
      });
    });

    app.listen(9292, () => {
      mongoClient.connect(CONNECTION_URL, { useNewUrlParser: true}, (error,client)=>{
        if(error){
          throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("movies");
        console.log("Connected to `" + DATABASE_NAME + "`!");
      });
    });
