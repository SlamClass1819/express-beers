const path = require('path');
const fsPromises = require('fs').promises;
const fetch = require("node-fetch");
const neatCsv = require('neat-csv');


const csvDataFolder = path.resolve(__filename, '../../step-05/openbeerdb_csv');

const baseUrl="http://localhost:1337";

async function loadStyles() {

    console.log('Reading and cleaning styles.csv');
    const stylesData = 
            await fsPromises.readFile(`${csvDataFolder}/styles.csv`, 'utf8');
    // const cleanStylesData = stylesData
    //         .replace('style_name','name');
    const styles = 
        await neatCsv(stylesData);
    console.log(`Read and cleaned ${styles.length} styles`);


    console.log('Sending styles to Scrapi');

    for (let i=0; i< styles.length; i++){
        const style = styles[i];


        // const categoryQuery =
        //    await fetch(`${baseUrl}/categories?ref_id=${style.cat_id}`);
        // const category = await categoryQuery.json();
        // style.category = category[0] && category[0].id ? category[0].id : '';
        const categoryQuery =
            await fetch(`${baseUrl}/categories?ref_id=${style.cat_id}`);
        const category = await categoryQuery.json();

        if (category[0] && category[0].id) {
            style.category= category[0].id
        }

        style.ref_id = style.id;
        style.name   = style.style_name;
        delete style.id;

        try {
            let response = await fetch(
                `${baseUrl}/styles/`,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(style)
                }        
            );
            console.log(`Sent style ${style.name}, status ${response.status}`);
        } catch(err) {
            console.log(err);
        }
    }
}

async function main() {
    await loadStyles();
}

main();