# corona
A website which provides graphical and numerical data about the COVID-19. Data: JSON format data of the data provided by 
Johns Hopkins University Center for Systems Science and Engineering (JHU CSSE). Github repo: https://github.com/pomber/covid19.
API: https://pomber.github.io/covid19/timeseries.json

The data from the API is saved in local Mongo database. There is a local instance of a server running which is connected to the Mongo database and is interface between client requests and database. Vue.js is used for this project.

Running
To run the application, the local Mongo database has to be running. On Linux machine, it can be started with the following command: 
sudo systemctl start mongod 
You can verify that Mongo is running with the following command:
sudo systemctl status mongod

To start the application, first make sure an Internet connection is present.
First run the server with the following command in server directory:
node app.js
Then run the client in the client directory with the following command:
npm run dev

Go to http://0.0.0.0:8000 and you should see the website.


