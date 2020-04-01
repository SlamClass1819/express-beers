const path = require('path');
const fsPromises = require('fs').promises;
const fetch = require("node-fetch");
const neatCsv = require('neat-csv');


const csvDataFolder = path.resolve(__filename, '../../step-05/openbeerdb_csv');

const baseUrl="http://localhost:1337";

async function loadBeers() {

    console.log('Reading and cleaning beers.csv');
    const beersData = 
            await fsPromises.readFile(`${csvDataFolder}/beers.csv`, 'utf8');
    const beers = 
        await neatCsv(beersData);
    console.log(`Read and cleaned ${beers.length} beers`);


    console.log('Sending beers to Scrapi');
    // beers.length

    for (let i=0; i<beers.length ; i++){
        const beer = beers[i];

        // V1 pour sqlite (:moins exigent)
        // const breweryQuery =
        //     await fetch(`${baseUrl}/breweries?ref_id=${beer.brewery_id}`);
        // const brewery = await breweryQuery.json();
        // beer.brewery = brewery[0] && brewery[0].id ? brewery[0].id : '';
        // console.log(beer.brewery)
        //
        // const categoryQuery =
        //     await fetch(`${baseUrl}/categories?ref_id=${beer.cat_id}`);
        // const category = await categoryQuery.json();
        // beer.category = category[0] && category[0].id ? category[0].id : '';
        // console.log(beer.category)
        //
        // const styleQuery =
        //     await fetch(`${baseUrl}/styles?ref_id=${beer.style_id}`);
        // const style = await styleQuery.json();
        // beer.style = style[0] && style[0].id ? style[0].id : '';
        // console.log(beer.style)

        const breweryQuery =
            await fetch(`${baseUrl}/breweries?ref_id=${beer.brewery_id}`);
        const brewery = await breweryQuery.json();
        if (brewery[0] && brewery[0].id) {
            beer.brewery = brewery[0].id;
        }

        const categoryQuery =
            await fetch(`${baseUrl}/categories?ref_id=${beer.cat_id}`);
        const category = await categoryQuery.json();
        if (category[0] && category[0].id) {
            beer.category= category[0].id
        }

        const styleQuery =
            await fetch(`${baseUrl}/styles?ref_id=${beer.style_id}`);
        const style = await styleQuery.json();
        if (style[0] && style[0].id) {
            beer.style = style[0].id;
        }
        
        beer.ref_id = beer.id;
        beer.description = beer.descript;
        beer.alcohol = beer.abv;
        delete beer.id;
        

        
        try {
            let response = await fetch(
                `${baseUrl}/beers/`,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(beer)
                }        
            );
            console.log(`Sent beer ${beer.name}, status ${response.status}`);
        } catch(err) {
            console.log(err);
        }
        
    }
}

async function main() {
    await loadBeers();
}

main();