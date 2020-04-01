const path = require('path');
const fsPromises = require('fs').promises;
const fetch = require("node-fetch");
const neatCsv = require('neat-csv');


const csvDataFolder = path.resolve(__filename, '../../step-05/openbeerdb_csv');

const baseUrl="http://localhost:1337";

async function loadBreweries() {
    console.log('Reading and cleaning breweries.csv');
    const breweriesData = 
            await fsPromises.readFile(`${csvDataFolder}/breweries.csv`, 'utf8');
    const cleanBreweriesData = breweriesData
            .replace(/^\n/mg,'')
            .replace(/^(.*[^"])\n/mg, '$1 ');
    const breweries = 
        await neatCsv(cleanBreweriesData);
    console.log(`Read and cleaned ${breweries.length} breweries`);

    console.log('Sending breweries to Scrapi');

    let status2xx = 0;
    let status4xx = 0;
    let status5xx = 0;
    // i<breweries.length

    for (let i=0; i<breweries.length; i++){
        const brewery = breweries[i];
        brewery.ref_id = brewery.id;
        delete brewery.id;
        try {
            let response = await fetch(
                `${baseUrl}/breweries/`,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(brewery)
                }        
            );
            console.log(`Sent brewery ${brewery.name}, status ${response.status}`);
            if (response.status>=200 && response.status <300) status2xx++;
            if (response.status>=400 && response.status <500) status4xx++;
            if (response.status>=500 && response.status <600) status5xx++;
            
        } catch(err) {
            console.log(err);
        }
    }

    console.log(`Status 2xx: ${status2xx}`);
    console.log(`Status 4xx: ${status4xx}`);
    console.log(`Status 5xx: ${status5xx}`);
}

async function main() {
    await loadBreweries();
}

main();