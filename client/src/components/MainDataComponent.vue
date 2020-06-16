<template>
  <div id="main">

    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tarekraafat/autocomplete.js@7.2.0/dist/css/autoComplete.min.css">
    <link href='https://fonts.googleapis.com/css?family=Kalam' rel='stylesheet'>
    <input id="autoComplete" tabindex="1" style="width: 35vw; right: 10.5vw; top: 33vh;">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <infection-scroll-bar :scroll-info="countryObj" :parentData="country" v-on:childToParent="onChildClick"
                          style="position:absolute; left:2vw;"
                          countries-data="222"></infection-scroll-bar>
    <div id='currentCountry'>{{country}}</div>
    <div class="numericalDataWrapper" style="margin-top: -10vh">
      <div class="I">
        <div class="infected">Number of infected people:</div>
        <div class="infected-worldwide-box">
          <div class="infected-number">{{infectionsWorldwide}}</div>
        </div>
      </div>
      <div class="R">
        <div class="recovered">Number of recovered people:</div>
        <div class="recovered-worldwide-box">
          <div class="recovered-number">{{recoveredWorldwide}}</div>
        </div>
      </div>
    </div>

    <line-chart :chart-data="datacollection" options="responsive: true" id="worldData"></line-chart>
    <div id="regions_div" style="width: 40vw; height: 30vh;"></div>
    <a href="#" class="fa fa-facebook"></a>
    <a href="#" class="fa fa-instagram"></a>
    <a href="#" class="fa fa-linkedin"></a>

  </div>
</template>

<script>
  import LineChart from './Chart.js'
  import CountryService from "../services/CountryService";
  import autoComplete from '@tarekraafat/autocomplete.js'
  import BarChart from './BarChart.js'
  import InfectionScrollBar from './InfectionScrollBar';
  import {GoogleCharts} from 'google-charts';

  export default {
    components: {
      LineChart,
      BarChart,
      InfectionScrollBar,
      GoogleCharts
    },
    data() {
      return {
        allData: {},
        datacollection: {},
        infectionsWorldwide: 0,
        recoveredWorldwide: 0,
        countries: [],
        country: 'All',
        countryData: {},
        countryObj: {}, // used for fixing offset
        mapData: [['Country', 'Infections']] // 2D array of the form [['Country', 'Number']]
      }
    },
    async mounted() {
      await this.fillData();

      this.AutoComplete();
      this.loadMap();
    },
    methods: {
      async fillData() {
        const data = (await this.getData());
        const infected = data.formattedData;
        const recovered = data.formattedRecovered;
        const countries = data.countries;
        let X = Object.keys(infected);
        let y1 = [];
        let y2 = [];
        for (let i = 0; i < X.length; i++) {
          let date = X[i];
          y1.push(infected[date]);
          y2.push(recovered[date])
        }
        this.recoveredWorldwide = Math.max.apply(Math, y2);
        this.infectionsWorldwide = y1[y1.length - 1];
        this.countries = countries;
        this.datacollection = {
          labels: X,
          datasets: [
            {
              label: 'Infected people',
              backgroundColor: '#f87979',
              gridLines: {
                color: '#FFFFFF',
                display: false
              },
              data: y1
            }
          ]
        }
      },
      async getData() {
        const data = (await CountryService.getCountries()).data;
        this.allData = data;
        const formattedData = {}; // infections
        const formattedRecovered = {}; // recovered
        const countries = []; // country names
        for (let j = 0; j < data.length; j++) {
          let country = data[j];
          let countryName = country['name'];
          let confirmed = country['confirmed'];
          let recovered = country['recovered'];
          let dates = Object.keys(confirmed);
          countries.push(countryName);
          for (let i = 0; i < dates.length; i++) {
            let date = dates[i];
            let confirmedThatDay = confirmed[date];
            let recoveredThatDay = recovered[date];
            if (date in formattedData) {
              formattedData[date] += confirmedThatDay;
              formattedRecovered[date] += recoveredThatDay
            } else {
              formattedData[date] = confirmedThatDay;
              formattedRecovered[date] = recoveredThatDay;
            }
          }
        }
        this.setCountriesData(data);
        return {formattedData, formattedRecovered, countries};
      },
      /**
       * Pushes number of infection to each country in the scroll bar.
       * @param data to push to the scroll bar.
       */
      setCountriesData(data) {
        const formatted = {};
        const currentView = {}
        for (let j = 0; j < data.length; j++) {
          let country = data[j];
          let countryName = country['name'];
          let confirmed = country['confirmed'];
          let recovered = country['recovered'];
          currentView[countryName] = {
            infected: confirmed[Object.keys(confirmed).reduce((a, b) => confirmed[a] > confirmed[b] ? a : b)],
            recovered: recovered[Object.keys(recovered).reduce((a, b) => recovered[a] > recovered[b] ? a : b)]
          };
          formatted[countryName] = confirmed[Object.keys(confirmed).reduce((a, b) => confirmed[a] > confirmed[b] ? a : b)] // largest value (current infections)
          // also change dataCollection ( for the graph )

        }
        this.countryData = currentView;
        let k = Object.keys(formatted);
        let v = Object.values(formatted);
        for (let j = 0; j < k.length; j++) {
          this.mapData.push([k[j], v[j]]);
        }
        console.log('This map data is: ', this.mapData);
        InfectionScrollBar.methods.updateCountryData(formatted);
      },
      AutoComplete() {
        new autoComplete({
          data: {
            src: async () => {
              const query = document.querySelector("#autoComplete").value;
              console.log(query);
              let data = [];
              for (let i = 0; i < this.countries.length; i++) {
                data.push({
                  "name": this.countries[i]
                })
              }
              return data;
            },
            key: ['name'],
            cache: false
          },
          placeholder: "Search country",
          selector: "#autoComplete",
          threshold: 0,
          debounce: 300,
          searchEngine: "strict",
          highlight: true,
          maxResults: 3,
          onSelection: feedback => {
            let country = feedback.results[0].name
            let topOffset = document.getElementById(country).offsetTop;
            document.getElementById('countries').scrollTop = topOffset;
            this.countryObj = {country: country, topOffset: topOffset};
          },
          resultsList: {                       // Rendered results list object      | (Optional)
            render: true,
            container: source => {
              source.setAttribute("id", "country_list");
              source.setAttribute("style", "position: absolute; top: 47vh; width: 55vw; left: 10vw;");

            },
            destination: document.querySelector("#autoComplete"),
            position: "afterend",
            element: "ul",
          }
        });
      },
      onChildClick(value) {
        console.log('kur')
        console.log('value is ', value)
        this.country = value;
        this.infectionsWorldwide = this.countryData[this.country].infected;
        this.recoveredWorldwide = this.countryData[this.country].recovered;
        let obj = {}
        for (let i = 0; i < this.allData.length; i++) {
          let country = this.allData[i];
          if (country['name'] === value)
            obj = country;
        }
        console.log('Country Data: ')
        // let X = Object.keys(obj.confirmed)
        this.datacollection = {
          labels: Object.keys(obj.confirmed),
          datasets: [
            {
              label: 'Infected people',
              backgroundColor: '#f87979',
              gridLines: {
                color: '#FFFFFF',
                display: false
              },
              data: Object.values(obj.confirmed)
            }
          ]
        }
      },
      loadMap() {
        GoogleCharts.load(drawRegionsMap, {
          'packages': ['geochart'],
          'mapsApiKey': 'AIzaSyBYE0h2H2ywXhQQuMeyC_8Ms26PfF_JtEI'
        });
        let d = this.mapData;

        function drawRegionsMap() {
          let data = GoogleCharts.api.visualization.arrayToDataTable(d);

          let options = {
            colorAxis: {colors: ['#dd755f', '#FF0000']},
          };

          let chart = new GoogleCharts.api.visualization.GeoChart(document.getElementById('regions_div'));


          chart.draw(data, options);

        }
      },
    }
  }
</script>

<style>
  body {
    /*background: url('../img/jc-gellidon-UIp163xCV6w-unsplash.jpg') no-repeat center center fixed;*/
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
  }

  .infected, .recovered {
    font-family: 'Kalam';
    font-size: 25px;
  }

  .recovered-number, .infected-number {
    font-family: 'Kalam';
    font-size: 30px;
  }

  .recovered-number {
    color: green;
  }

  .infected-number {
    color: red;
  }

  .infected-worldwide-box, .recovered-worldwide-box {
    margin: 0 auto;
    width: 40vw;
    height: 5vh;
    outline: black solid 1px;
  }

  .R {
    margin-top: 2vw;
  }

  .numericalDataWrapper {
    display: inline-block;
    position: absolute;
    right: 40vw;
    top: 25vh;
  }

  .small {
    max-width: 70vw;
    margin: 100px auto;
  }

  #worldData {
    /*height: 20vh;*/
    width: 20vw;
    display: inline-block;
    position: absolute;
    right: 17vw;
  }

  #navbar {
    top: 2vh;
    position: absolute;
    width: 70vw;
    /*left: 10vw;*/
  }

  #regions_div {
    position: absolute;
    top: 55vh;
    left: 20vw;
  }

  #currentCountry {
    font-family: 'Kalam';
    font-size: 30px;
    margin-right: 20vw;
  }

  .fa {
    padding: 7px;
    width: 30px;
  }

  .fa:hover {
    opacity: 0.7;
  }

  .fa-facebook {
    background: #3B5998;
    color: white;
    position: absolute;
    bottom: 3vh;
    left: 30vw;
  }

  .fa-instagram {
    background: #125688;
    color: white;
    position: absolute;
    bottom: 3vh;
    left: 20vw;

  }

  .fa-linkedin {
    background: #007bb5;
    color: white;
    position: absolute;
    bottom: 3vh;
    left: 25vw;
  }

</style>
