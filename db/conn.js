const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://pradip:123@cluster0.d1eepxk.mongodb.net/google-2fa')
    .then(()=>{
        console.log("database connected successfully.💥");
}).catch((e)=>{
    console.log(e);
})