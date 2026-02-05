import app from "./app.js";

//Para configración en railway
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

//Local
/*const main = () => {
    app.listen(app.get("port"));
    console.log(`Server on port:  ${app.get("port")}`);
}

main() */