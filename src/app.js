import express from "express";
import session from "express-session";
import morgan from "morgan";
import cookieParser from "cookie-parser";
//Routes
import activitiesRoute from "./routes/activities-routes.js";
import userRoutes from "./routes/users-routes.js";
import userActivitiesRoutes from "./routes/activitiesQueriesRoutes.js";
import cors from "cors";
import sendRecoveryCode from "./routes/sendEmail-routes.js";

const app = express();

app.use(session({
    secret: 'Areasverdes55',  // Cambia esto por un secreto más seguro en producción
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Usa `true` si estás utilizando HTTPS
}));

//setting
//app.set("port", 4000);
/*const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});*/
//middleware

const allowedOrigins = [
  'http://192.168.10.16:3000', // Desarrollo local
  'https://agendapp-frontend.vercel.app' // Producción
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

/*app.use(cors({
  origin: '  http://192.168.10.16:3000', // Puedes reemplazar '*' por 'http://192.168.10.4:3000' para mayor seguridad
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));*/
/*app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));*/
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended:true})); //new
app.use(cookieParser() );

//routes
app.use("/api/activities", activitiesRoute);
app.use("/api/activities/actuser", activitiesRoute);
app.use("/api/act-user", userActivitiesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", sendRecoveryCode);

export default app;
