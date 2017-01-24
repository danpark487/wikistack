const express = require('express');
const nunjucks = require('nunjucks');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const models = require('./models');

const Page = models.Page;
const User = models.User;

const app = express();
const wikiRouter = require('./routes/wiki.js');
const usersRouter = require('./routes/users.js');
const path = require('path');

//nunjucks//
app.engine('html', nunjucks.render);
app.set('view engine', 'html');
nunjucks.configure('views', {noCache: true});

//morgan logging//
app.use(morgan('dev'));

//bodyparser for post requests//
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//static requests//
app.use(express.static(path.join(__dirname, './node_modules')));
app.use(express.static(path.join(__dirname, './public')));

//wiki routes//
app.use('/wiki', wikiRouter);

//users routes//
app.use('/users', usersRouter);

//default route//
app.get('/', function(req, res) {
    res.render('index');
});

//error handling middleware//
app.use(function(err, req, res, next) {
    console.error(err);
    res.status(500).send(err.message);
});


User.sync()
    .then(function() {
        return Page.sync();
    })
    .then(function() {
        app.listen(3001, function() {
            console.log('Server is listening on port 3001!');
        });
    });


