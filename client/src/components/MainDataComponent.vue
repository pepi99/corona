<template>
  <div id="main">
    <div id="navbar" style="width: 100vw;">
      <div id='cssmenu'>
        <ul>
          <li class='active'><a href='#'>Home</a></li>
          <li><a href='#'>Products</a></li>
          <li><a href='#'>Contact</a></li>
          <li><a href='#'>About</a></li>
        </ul>
      </div>
    </div>
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tarekraafat/autocomplete.js@7.2.0/dist/css/autoComplete.min.css">
    <link href='https://fonts.googleapis.com/css?family=Kalam' rel='stylesheet'>
    <input id="autoComplete" tabindex="1" style="width: 35vw; right: 10.5vw; top: 33vh;">
    <!-- Default "id" value = "autoComplete"> -->
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
    <div id="regions_div" style="width: 700px; height: 300px;"></div>
  </div>
</template>

<script>
  import LineChart from './Chart.js'
  import CountryService from "../services/CountryService";
  import autoComplete from '@tarekraafat/autocomplete.js'
  import NavbarComponent from "./NavbarComponent";
  import BarChart from './BarChart.js'
  import InfectionScrollBar from './InfectionScrollBar';
  import {GoogleCharts} from 'google-charts';

  export default {
    components: {
      NavbarComponent,
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
        mapData: [['Country', 'Popularity']] // 2D array of the form [['Country', 'Number']]
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
      }
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

  @import url(http://fonts.googleapis.com/css?family=Raleway);
  #cssmenu,
  #cssmenu ul,
  #cssmenu ul li,
  #cssmenu ul li a {
    margin: 0;
    padding: 0;
    border: 0;
    list-style: none;
    line-height: 1;
    display: block;
    position: relative;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  #cssmenu {
  }

  #cssmenu:after,
  #cssmenu > ul:after {
    content: ".";
    display: block;
    clear: both;
    visibility: hidden;
    line-height: 0;
    height: 0;
  }

  #cssmenu {
    width: auto;
    border-bottom: 3px solid #47c9af;
    font-family: Raleway, sans-serif;
    line-height: 1;
  }

  #cssmenu ul {
    background: #ffffff;
  }

  #cssmenu > ul > li {
    float: left;
  }

  #cssmenu.align-center > ul {
    font-size: 0;
    text-align: center;
  }

  #cssmenu.align-center > ul > li {
    display: inline-block;
    float: none;
  }

  #cssmenu.align-right > ul > li {
    float: right;
  }

  #cssmenu.align-right > ul > li > a {
    margin-right: 0;
    margin-left: -4px;
  }

  #cssmenu > ul > li > a {
    z-index: 2;
    padding: 18px 25px 12px 25px;
    font-size: 15px;
    font-weight: 400;
    text-decoration: none;
    color: #444444;
    -webkit-transition: all .2s ease;
    -moz-transition: all .2s ease;
    -ms-transition: all .2s ease;
    -o-transition: all .2s ease;
    transition: all .2s ease;
    margin-right: -4px;
  }

  #cssmenu > ul > li.active > a,
  #cssmenu > ul > li:hover > a,
  #cssmenu > ul > li > a:hover {
    color: #ffffff;
  }

  #cssmenu > ul > li > a:after {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: -1;
    width: 100%;
    height: 120%;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    content: "";
    -webkit-transition: all .2s ease;
    -o-transition: all .2s ease;
    transition: all .2s ease;
    -webkit-transform: perspective(5px) rotateX(2deg);
    -webkit-transform-origin: bottom;
    -moz-transform: perspective(5px) rotateX(2deg);
    -moz-transform-origin: bottom;
    transform: perspective(5px) rotateX(2deg);
    transform-origin: bottom;
  }

  #cssmenu > ul > li.active > a:after,
  #cssmenu > ul > li:hover > a:after,
  #cssmenu > ul > li > a:hover:after {
    background: #47c9af;
  }


</style>
