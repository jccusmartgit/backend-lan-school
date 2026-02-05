import { getConnection } from  "../database/database.js";
import crypto from "crypto";
//import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { promisify } from "util";

const getUsers = async(req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query("SELECT name, fullname, email, password FROM users");
        console.log(result);
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        const result = await connection.query(
            "SELECT id, name, fullname, email FROM users WHERE id = ?",
            [id]
        );

        console.log("Resultado crudo de la consulta:", result); // Agrega este log

        if (!Array.isArray(result) || result.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        //  Si result[0] también es array, tomamos el primer elemento del primer array
        const userData = Array.isArray(result[0]) ? result[0][0] : result[0];
        res.json(userData);
    } catch (error) {
        res.status(500).send(error.message);
    }
};



/*const addUser = async (req, res) => {
    try {
        const name = req.body.name
        const fullname = req.body.fullname
        const email = req.body.email
        const pass = req.body.pass
        let passHash = await bcrypt.hash(pass, 8)
        console.log(name, " ", fullname, " ", email, " ", pass, " ", passHash);
        const conexion = await getConnection();
        const resultado = await conexion.query("INSERT INTO users SET ?" , {name: name, fullname: fullname, email: email, password: passHash }, (error, results) => {
            if (error) {console.log(error)}
            //res.redirect("/login");
            console.log("Welcome")
            res.json(resultado)
        }  );
    } catch (error) {
        res.status(500).send(error.message);
    }
};*/

const addUser = async(req, res) => {
    try {
        const { name, fullname, email, password } = req.body;

        if (name === undefined || fullname === undefined || email === undefined || password === undefined) {
            res.status(400).json({message: "All fields are required"});
        };

        //hash
        const hash = crypto.createHash("sha256");
        hash.update(password);
        const hashedPassword = hash.digest("hex");

        const user = {
            name, fullname, email, password: hashedPassword
        };
        const connection = await getConnection();
        const result = await connection.query("INSERT INTO users SET ?", user);
        console.log(result);
        return res.status(201).json({ message: "User created successfully" });
        //res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const deleteUser = async (req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const connection = await getConnection();
        const result = await connection.query("DELETE FROM users WHERE id = ?", id);
        console.log(result);
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const updateUser = async (req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const { name, fullname, email, password } = req.body;

        if (name === undefined || fullname === undefined || email === undefined || password === undefined) {
            res.status(400).json({message:"All fields are required"});
        }

        const user = {
            name, fullname, email, password
        }
        const connection = await getConnection();
        const result = await connection.query("UPDATE users SET ? WHERE id = ?", [user, id]);
        console.log(result);
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const patchUser = async(req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const updates = req.body;
        if (Object.keys(updates).length === 0 ) {
            res.status(400).json({message: "No fields provided for update"});
        }

        if (updates.password) {
            const hash = crypto.createHash("sha256");
            hash.update(updates.password);
            updates.password = hash.digest("hex");
        };

        const connection = await getConnection();
        const result = await connection.query("UPDATE users SET ? WHERE id = ?", [updates, id]);
        console.log(result);
        res.json(result);
    } catch (error) {
        res.status(500);
        res,send(error.message);
    }
};

const checkActiveStatus = async (req, res) => {
    try {
        const { email } = req.body;
        const connection = await getConnection();
        const [rows] = await connection.query("SELECT active FROM users WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        //res.json({ active: result[0].active });
        res.json({ active: Boolean(rows[0].active) });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const activateUser = async (req, res) => {
    try {
        const { email } = req.params;  // Obtener el email desde los parámetros de la URL

        if (!email) {
            return res.status(400).json({ message: "El email es requerido" });
        }

        const connection = await getConnection();
        const userCheck = await connection.query("SELECT * FROM users WHERE email = ?", [email]);

        if (userCheck.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const result = await connection.query("UPDATE users SET active = 1 WHERE email = ?", [email]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "No se pudo activar la cuenta" });
        }

        res.json({ message: "Cuenta activada correctamente", result });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === undefined || password === undefined) {
            return res.status(400).json({ message: "Email y contraseña son requeridos" });
        }

        const connection = await getConnection();
        const [ rows ] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Email o contraseña inválidos" });
        }

        const user = rows[0];

        // Verificar si la cuenta está desactivada
        if (!user.active) {
            return res.status(403).json({ message: "Su cuenta está desactivada. Contacte al administrador o reactívela." });
        }

        // Verificar la contraseña
        const hash = crypto.createHash('sha256');
        hash.update(password);
        const hashedPassword = hash.digest('hex');

        if (user.password !== hashedPassword) {
            return res.status(401).json({ message: "Email o contraseña inválidos" });
        }

        // Login exitoso
        const id = user.id;
        const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
            expiresIn: process.env.JWT_TIEMPO_EXPIRA
        });

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            httpOnly: true
        });

        return res.json({ message: "Login exitoso", user: { id: user.id, name: user.name, fullname: user.fullname, email: user.email } });

    } catch (error) {
        res.status(500).send(error.message);
    }
};

/*const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === undefined || password === undefined) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const connection = await getConnection();
        const result = await connection.query("SELECT * FROM users WHERE email = ?", [email]);

        if (result.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = result[0];
        
        // Hash the provided password and compare with stored hash
        const hash = crypto.createHash('sha256');
        hash.update(password);
        const hashedPassword = hash.digest('hex');

        if (user.password !== hashedPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        } else {
            // Login successful
            const id = result[0].id;
            const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
                expiresIn: process.env.JWT_TIEMPO_EXPIRA
            });
            console.log("Token generado: ", token);

            const cookiesOptions = {
                expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                httpOnly: true
                //secure: process.env.NODE_ENV === 'production' // La cookie solo se enviará a través de HTTPS en producción
            };
            res.cookie("jwt", token, cookiesOptions);
            console.log(result);
            return res.json({ message: "Login successful", user: { id: user.id, name: user.name, fullname: user.fullname, email: user.email, password: user.password } });

        }
        
    } catch (error) {
        res.status(500).send(error.message);
    }
}; */

const isAutheticated = async(req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
            const connection = await getConnection();
            const result = await connection.query("SELECT * FROM users WHERE id = ?", [decodificada.id], (error, results) => {
               if (!results) {return next() } 
               req.user = results[0]
               return next()
            } )
            res.json(result)
        } catch (error) {
            res.status(500).send(error.message);
            console.log(error);
            return next();  
        }
    }else{
        res.redirect("/login")
        
    }
};

const logout = (req, res) => {
    res.clearCookie("jwt")
    return res.redirect("/")
}

export const methods = {
    getUsers,
    getUser,
    addUser,
    deleteUser,
    updateUser,
    patchUser,
    checkActiveStatus,
    activateUser,
    loginUser,
    isAutheticated,
    logout
}
