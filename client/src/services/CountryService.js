import Api from '../services/Api'

export default {
  getCountry(country) {
    return Api().get('countries/countryData/', {
      params: {
        country: country
      }
    })
  },
  getCountries() {
    return Api().get('countries/getAllData/')
  }
}
