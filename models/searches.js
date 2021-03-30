const fs = require('fs');
const axios = require('axios').default;


class Searches {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        // TODO: read DB if exists
        this.readDB();
    }

    get historialCapitalize() {

        return this.historial.map( place => {

            let words = place.split(' ');
            words = words.map( p => p[0].toUpperCase() + p.substring(1));

            return words.join(' ')
        });

    }

    get paramsMapBox() {

        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'en'
        }
    }

    get paramsWeatherMap() {

        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'en'
        }
    }

    async city( place='' ) {

        try {

            //HTTP request
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ place }.json`,
                params: this.paramsMapBox
            });

             const resp = await instance.get();

             return resp.data.features.map( place => ({

                id: place.id,
                name: place.place_name,
                lng: place.center[0],
                lat: place.center[1]

             }));
            
        } catch (error) {
            return []; //Return places
        }

    }

    async weatherPlace( lat, lon) {

        try {
          
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsWeatherMap,lat,lon }
            });

            const resp = await instance.get();
            const { weather, main } = resp.data;

            return {

                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp

            }

        } catch (error) {

            console.log( error );
            
        }

    }

    addHistorial( place = '' ) {

        if( this.historial.includes( place.toLocaleLowerCase() )) {
            return;
        }

        this.historial = this.historial.splice(0,5);

        this.historial.unshift( place.toLocaleLowerCase() );

        //Save in DB
        this.saveDB();
    }

    saveDB() {

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ));
    }

    readDB() {

        if( !fs.existsSync( this.dbPath )) return;

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8'});
        const data = JSON.parse( info );

        this.historial = data.historial;

    }

}

module.exports = Searches;