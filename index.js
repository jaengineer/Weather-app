require('dotenv').config()

const { readInput, inquirerMenu, pause, listPlaces } = require("./helpers/inquirer");
const Searches = require("./models/searches");

const main = async() => {

    let opt = '';
    const searches = new Searches();

    do {

        opt = await inquirerMenu();

        switch ( opt ) {

            case 1:
                //Show message
                const searchText = await readInput('city: ');

                //Search places
                const places = await searches.city( searchText );
                const id = await listPlaces( places );

                if( id === '0' ) continue;
                
                const placeSelected = places.find( p => p.id === id);

                 //Save in DB
                 searches.addHistorial( placeSelected.name );

                //Weather
                const weather = await searches.weatherPlace( placeSelected.lat, placeSelected.lng ); 

                //Show results
                console.clear();
                console.log('\nCity information\n'.green);
                console.log('City:', placeSelected.name.green);
                console.log('Lat:', placeSelected.lat);
                console.log('Lng', placeSelected.lng);
                console.log('Temperature', weather.temp);
                console.log('Minimum:', weather.min);
                console.log('Maximum:', weather.max);
                console.log('Description:', weather.desc.green);

            break;

            case 2:

            searches.historialCapitalize.forEach( (place, i) => {

                const idx = `${ i + 1 }.`.green;
                console.log( `${ idx } ${ place }`);

            })

            break;
        
        }

        if( opt !== 0 ) await pause();
        
    } while ( opt !== 0);
}

main();