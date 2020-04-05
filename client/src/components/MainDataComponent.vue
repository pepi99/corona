<template>
  <div id="main">
    <navbar-component id="navbar"/>
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tarekraafat/autocomplete.js@7.2.0/dist/css/autoComplete.min.css">
    <link href='https://fonts.googleapis.com/css?family=Kalam' rel='stylesheet'>
    <input id="autoComplete" tabindex="1" style="width: 35vw; right: 10.5vw; top: 33vh;">
    <!-- Default "id" value = "autoComplete"> -->
    <infection-scroll-bar :scroll-info="countryObj" :parentData="country" v-on:childToParent="onChildClick" style="position:absolute; left:0;"
                          countries-data="222"></infection-scroll-bar>
    <div>{{country}}</div>
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
  </div>
</template>

<script>


  import LineChart from './Chart.js'
  import CountryService from "../services/CountryService";
  import autoComplete from '@tarekraafat/autocomplete.js'
  import NavbarComponent from "./NavbarComponent";
  import BarChart from './BarChart.js'
  import InfectionScrollBar from './InfectionScrollBar';

  export default {
    components: {
      NavbarComponent,
      LineChart,
      BarChart,
      InfectionScrollBar
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
        countryObj: {} // used for fixing offset
      }
    },
    async mounted() {
      await this.fillData();
      let autoComplete = document.createElement('script');
      autoComplete.setAttribute('src', 'https://cdn.jsdelivr.net/npm/@tarekraafat/autocomplete.js@7.2.0/dist/js/autoComplete.min.js');
      document.head.appendChild(autoComplete);
      this.AutoComplete();
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
        console.log(this.countryData);
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
  }

</style>
