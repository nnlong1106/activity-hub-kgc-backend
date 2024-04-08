require('dotenv').config();
const port = parseInt(process.env.PORT) || 3000;
const db = require('./app/config/db');
const express = require('express');
const path = require('path');
const route = require('./routes');

const app = express();

//Connect to DB
db.connect();

//Use body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Routes api
route(app);
// Đường dẫn tới thư mục build của client React
const reactBuildPath = path.resolve('..', 'activity-hub-kgc-frontend', 'build');
// Phục vụ các tài nguyên tĩnh từ thư mục build của React
app.use(express.static(reactBuildPath));
// Route để phục vụ index.html của React
app.get('*', (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
});

//Start server
const server = app.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);
    console.log(`Server listening on port ${server.address().port}`);
});
