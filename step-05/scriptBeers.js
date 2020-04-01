var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_ADDON_URI || 'mongodb://localhost:27017';
var dbName = process.env.MONGODB_ADDON_DB || 'express-beers';
const fsPromises = require('fs').promises;
const neatCsv = require('neat-csv');

async function insertBeer(db, beer) {
    let inserted = await db.collection('beers').insertOne(beer);
    console.log(`Beer ${beer.name} inserted`);

}

async function initDb() {
    try {
        let client = await MongoClient.connect(url);
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



    let beers                   = await neatCsv( await fsPromises.readFile('openbeerdb_csv/openbeerdb_csv/beers.csv'));
    let breweries               = await neatCsv( await fsPromises.readFile('openbeerdb_csv/openbeerdb_csv/breweries.csv'));
    let breweries_geocode       = await neatCsv( await fsPromises.readFile('openbeerdb_csv/openbeerdb_csv/breweries_geocode.csv'));
    let categories              = await neatCsv( await fsPromises.readFile('openbeerdb_csv/openbeerdb_csv/categories.csv'));
    let styles                  = await neatCsv( await fsPromises.readFile('openbeerdb_csv/openbeerdb_csv/styles.csv'));
    // console.log(styles);
    // insertBeer(dbName, beers, breweries, breweries_geocode, categories, styles)
    await initDb();


    let beersList= beerContent(beers, breweries, categories, styles);
    await insertBeer(beersList);
}



async function insertBeers(beers){
    console.log(`Prepared ${beers.length} beers`);
    try {
        let client = await MongoClient.connect(url);
        const db = client.db(dbName);
        await db.collection("beers").insertMany(beersToSave);
        console.log("All beers inserted");
        return process.exit(0);
    } catch(err) {
        console.log('Load DB error', err);
        return process.exit(0);
    }
}


async function beerContent(beers, breweries, categories, styles){

    const beersToSave = beers.map(beer => {
        let brewery_id        = beer.brewery_id;
        let category_id       = beer.cat_id;
        let style_id          = beer.style_id;

        let beerToSave = {};
        const categoryName  = (categories.find(category => category.id === beer.cat_id ) ) ? categories.find(category   => category.id === beer.category.id).cat_name :'';
        const breweryName   = (breweries.find(brewery => brewery.id === beer.brewery_id) ) ? breweries.find(brewery     => brewery.id === beer.brewery_id).name : '';
        const styleName     = (styles.find(style => style.id === beer.style_id) )          ? styles.find(style          => style.id === beer.style_id).style_name :'';
        beerToSave = {'alcohol':beer.abv, 'availibility':'', 'brewery': breweryName, 'description': beer.descript, 'img':'', 'label':'',
            'name': beer.name, 'serving':'', 'style':styleName};
        return beerToSave;
    });


    /*try {
        let client = await MongoClient.connect(url);
        const db = client.db(dbName);
        beers.forEach((beer) => {
            //formatBeer(beer , breweries, categories, styles)
            insertBeer(db, beer);
            // console.log(beer);
        });
    } catch(err) {
        console.log('Load DB error', err);
        return process.exit(0);
    }*/
}



/*async function formatBeer(beer , breweries , categories, styles, breweries_geocode){

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
}*/


main();

