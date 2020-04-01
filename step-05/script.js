var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_ADDON_URI || 'mongodb://localhost:27017';
var dbName = process.env.MONGODB_ADDON_DB || 'express-beers';
const fsPromises = require('fs').promises;
const neatCsv = require('neat-csv');

async function initDb() {
    try {
        client = await MongoClient.connect(url);
        const db = client.db(dbName);
        console.log('Deleting beers');
        try {
            let dropped = await db.collection('beers').drop();
            console.log('DB dropped');
        } catch(err) {
            console.log('Collection not found', err);
        }
        // console.log('Inserting beers');
        // for (let i in beers) {
        //     let beerName = beers[i];
        //     console.log(`Inserting ${beerName}`);
        //     let beer = require(`./step-05/beers/${beerName}.json`);
        //     console.log(`Inserting ${beerName}`);
        //     let inserted = await db.collection('beers').insertOne(beer);
        //     console.log(`Beer ${beerName} inserted`);
        // }
        // return process.exit(0);
    }
    catch(err) {
        console.log('InitDb error', err);
        return process.exit(0);
    }
}


async function main() {


    initDb();
    let beers                   = await neatCsv( await fsPromises.readFile('openbeerdb_csv/beers.csv'));
    let breweries               = await neatCsv( await fsPromises.readFile('openbeerdb_csv/breweries.csv'));
    let breweries_geocode       = await neatCsv( await fsPromises.readFile('openbeerdb_csv/breweries_geocode.csv'));
    let categories              = await neatCsv( await fsPromises.readFile('openbeerdb_csv/categories.csv'));
    let styles                  = await neatCsv( await fsPromises.readFile('openbeerdb_csv/styles.csv'));
    // console.log(styles);
    // insertBeer(dbName, beers, breweries, breweries_geocode, categories, styles)
    await robertFunction(beers, breweries, categories, styles);
}

async function robertFunction(beers, breweries, categories, styles){
    try {
        client = await MongoClient.connect(url);
        const db = client.db('express-beers');
        beers.forEach((beer) => {
            formatBeer(beer , breweries, categories, styles)
            insertBeer(db, beer);
            // console.log(beer);
        });
    } catch(err) {
        console.log('Load DB error', err);
        return process.exit(0);
    }
}


async function insertBeer(db, beer) {
    let inserted = await db.collection('beers').insertOne(beer);
    console.log(`Beer ${beer.name} inserted`);

}


async function formatBeer(beer , breweries , categories, styles, breweries_geocode){

   let brewery_id        = beer.brewery_id;
   let category_id       = beer.cat_id;
   let style_id          = beer.style_id;

   breweries.forEach((brewery) =>
   {
       if (brewery.id === brewery_id) {
           beer.brewery_name = brewery.name;
       }
   })

    categories.forEach((category) =>
    {
        if(category.id === category_id) {
            beer.category_name = category.cat_name;
            console.log(beer.category_name);
        }
    })

    styles.forEach((style) =>
    {
        if (style.id === style_id){
            beer.style_name = style.style_name;
            console.log(beer.style_name);
        }

    })
       return beer;
}




main();
