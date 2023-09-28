const mongoose = require('mongoose');

const connectDatabase=()=>{
       
        console.log("aguardando conexao ao banco");
        const MONGODB_URI = 'mongodb+srv://'+process.env.MONGODB_USER+':'+process.env.MONGODB_PASSWORD+'@cluster0.ddn1jpw.mongodb.net/'+process.env.MONGODB_DATABASE+'?retryWrites=true&w=majority';

        mongoose.connect(MONGODB_URI, { 
                useNewUrlParser: true, 
                useUnifiedTopology: true 
})

.then(db => console.log("Conexão estabelecida com o banco "))//, db.connection.host))
.catch(err => console.log(err),
        console.log("Erro ao conectar com o banco...")); 

}

module.exports = connectDatabase;