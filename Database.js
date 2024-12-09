const mysql = require('mysql');
//buat configurasi ke koneksi
const koneksi=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'latihanrestapi'
});
//koneksi database
koneksi.connect((err)=>{
    if(err)throw err;
    console.log('MYSQL Connected...');
});
module.exports=koneksi