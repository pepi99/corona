# corona
A website which provides graphical and numerical data about the COVID-19. Data: JSON format data of the data provided by 
Johns Hopkins University Center for Systems Science and Engineering (JHU CSSE). Github repo: https://github.com/pomber/covid19.
API: https://pomber.github.io/covid19/timeseries.json

The data from the API is saved in local Mongo database. There is a local instance of a server running which is connected to the Mongo database and is interface between client requests and database. Vue.js is used for this project.
