const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

mongoose.connect('mongodb://0.0.0.0:27017/RestAPI', {
    useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => {
    console.log("Successfully connected to Mongodb");
}).catch((error) => {
    console.log("Error connecting to Mongodb", error);
});

const ShopRoute = require('./Routes/ShopRoutes');
app.use('/shops', ShopRoute);

app.use((req, res, next) => {
    const err = new Error("Page not found!");
    err.status = 404;
    next(err);
})

//Error handling
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error:{
            status : err.status || 500,
            message : err.message
        }
    })
})

app.listen(3000, () => {
    console.log("Server started on port 3000");
});