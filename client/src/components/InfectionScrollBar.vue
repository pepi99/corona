<template>
  <div @click="emitToParent($event)" id="countries">

  </div>
</template>

<script>
  import $ from 'jquery'
  import MainDataComponent from "./MainDataComponent";

  export default {
    components: {
      MainDataComponent
    },
    data() {
      return {
        countryData: {},
        currentCountry: ''
      }
    },
    mounted() {
    },
    methods: {
      updateCountryData(cd) {
        this.countryData = cd;
        this.appendCountries();
      },
      appendCountries() { // push countries to scroll menu
        let d = this.countryData;
        let keysSorted = Object.keys(d).sort(function (a, b) {
          return d[b] - d[a]
        });
        let menu = document.getElementById('countries');
        for (let i = 0; i < keysSorted.length; i++) {
          let country = document.createElement('button');
          country.className = 'country';
          country.id = keysSorted[i];
          let countryName = document.createElement('div');
          let infections = document.createElement('div');
          countryName.className = 'countryName';
          infections.className = 'infectedd';
          countryName.innerText = keysSorted[i];
          infections.innerText = d[keysSorted[i]]
          country.appendChild(countryName);
          country.appendChild(infections);
          menu.appendChild(country)
        }
      },
      emitToParent: function (event) {
        if (event) { // fixed some reeeealy bad bugs
          let countryClicked = '';
          let className = event.target.className;
          let id = event.target.id;
          if (className === 'country') {
            countryClicked = id;
          } else if (className === 'countryName') {
            countryClicked = event.target.innerText;
          } else {
            countryClicked = event.target.parentNode.id;
          }
          this.currentCountry = countryClicked;
          console.log(this.currentCountry)
          console.log(this.countryData)
          this.$emit('childToParent', this.currentCountry);
          // MainDataComponent.methods.receiveCurrentCountry(countryClicked);
        }
      }

    },
  }
</script>

<style>
  #countries {
    overflow-y: scroll;
    height: 76vh;
    width: 12vw;
  }

  .country {
    border-bottom: 1px solid black;
    height: 45px;
    width: 100%;
  }

  .infectedd, .countryName {
    display: inline-block;

  }

  .infectedd {
    margin-left: 20px;
  }
</style>
