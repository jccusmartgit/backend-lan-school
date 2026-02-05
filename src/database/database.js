//import mysql from "promise-mysql";
import mysql from "mysql2/promise";
import config from "../config.js";

const  connection = mysql.createPool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    timezone: "local"
});



export const getConnection = () => {
    return connection;
};