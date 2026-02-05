import { config } from "dotenv";

config();
//railway servr backend
export default {
    database: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    }
    
};

//local
/*export default {
    host: process.env.MYSQL_HOST || "",
    database: process.env.MYSQL_DATABASE || "",
    user: process.env.MYSQL_USER || "",
    password: process.env.MYSQL_PASSWORD || ""
}*/