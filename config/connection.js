const mongoose = require("mongoose");
// const mongoURI = "mongodb://109.106.255.114:27017/InsafAcademy";
const mongoURI = "mongodb://insaf:insaf%40123@109.106.255.114:27017/InsafAcademy?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"


const dbConnection = async function connection(){  
    try{    
        var connection = await mongoose.connect(mongoURI,{ useNewUrlParser: true })
        return connection
    }catch(e){
        console.log("Error", e)
    }

}
module.exports = dbConnection