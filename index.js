const express= require('express');
const cors= require('cors');

require('dotenv').config()

// declaring the app
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

//Mongodb connection
const MongoClient = require('mongodb').MongoClient;
const ObjectID= require('mongodb').ObjectID;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4cfgh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    if(err) console.log('error: ', err);
  const placeCollection = client.db("cholo-ghuri").collection("places");
  const orderCollection= client.db("cholo-ghuri").collection("orders");
  // perform actions on the collection object
  console.log('database connected');

  //endpoint to add a new place
  app.post('/addPlace', (req, res)=> {
      const data= req.body;
      placeCollection.insertOne(data)
      .then(data=> res.send(data.insertedCount>0))
      .catch(err=> console.log('error', err))
  })
  
  //endpoint to get all the places
  app.get('/allPlaces', (req, res)=> {
      placeCollection.find({}).toArray((err, docs)=> res.send(docs));
  })

  //endpoint to a single place
  app.get('/place/:_id', (req, res)=> {
      const _id= req.params._id;
      placeCollection.findOne({_id: new ObjectID(_id)})
      .then(data=> res.send(data))
  })

  // adding places to orders
  app.post('/checkout', (req, res)=> {
      const receivedData= req.body;
      orderCollection.insertOne(receivedData)
      .then(result=> res.send(result.insertedCount>0))
      .catch(err=> console.log(err))
  })

  // endpoint to get the orders
  app.get('/orders', (req, res)=> {
      const email= req.query.email;
      orderCollection.find({email: email}).toArray((err, docs)=>{
          if(docs.length<1){
              res.send([]);
              return;
          }
          if(err) console.log(err);
          let items= [];
          docs.forEach(item=> {
              placeCollection.findOne({_id: new ObjectID(item.place_id)})
              .then(data=> {
                  items.push(data);
                  if(docs.length==items.length){
                      res.send(items);
                  }
                })
              .catch(err=> console.log('inner: '+err))
          })
      })
  })

  // deleting any place
  app.delete('/deletePlace', (req, res)=> {
    const _id= req.query._id;
    placeCollection.deleteOne({_id: new ObjectID(_id)})
    .then(result=> res.send(result.deletedCount>0))
    .catch(err=> console.log(err))
  })
});


app.get('/', (req, res)=> {
    res.send('salam');
})

app.listen(process.env.PORT || 3001);