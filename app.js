var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");

var searchRouter = require("./routes/search"); // Add search router

var loginRouter = require("./routes/login");  
var app = express();




app.use(express.json()); // Habilita la lectura de JSON en el body
app.use(express.urlencoded({ extended: true })); // Habilita la lectura de formularios URL-encoded


const signupRoutes = require("./routes/signup"); // Correct path

app.use("/signup", signupRoutes); // Ensure this line exists

app.use("/", loginRouter);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs'); // or another engine of your choice
app.set('views', path.join(__dirname, 'views'));

app.use("/", indexRouter)
app.use("/api/search", searchRouter); // Add search endpoint



module.exports = app;