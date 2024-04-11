const express = require('express');
const app = express();
const path = require('path');
const PORT = 8000 || process.env.PORT;
require('./db/conn');
const router = require('./router/user.router');
const session = require('express-session');
const flash = require('connect-flash');

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(session({
    secret:"secret",
    cookie:{maxAge:60000},
    resave:false,
    saveUninitialized:false
}))

app.use(flash())

app.set('view engine','ejs');
app.set('views',path.resolve('./views'));



app.use('/api/v1/auth',router);

app.listen(PORT,()=>{
    console.log(`Server run at port:${PORT}💫`);
})