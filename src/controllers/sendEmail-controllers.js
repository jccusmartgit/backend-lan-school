import nodemailer from "nodemailer";
import { getConnection } from  "../database/database.js";
import cryptos from "crypto";

const checkEmailExists = async (req, res) => {
    try {
        const { email } = req.body;
        const connection = await getConnection();
        const result = await connection.query("SELECT id FROM users WHERE email = ?", [email]);

        if (result.length > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};


const sendRecoveryEmailCode = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Generar un código de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Guardar el código en una variable temporal (puedes usar un almacenamiento más persistente)
    req.session.recoveryCode = code;

    // Configuración del transportador de correo (puede requerir ajustes según tu proveedor de correo)
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Cambia esto si usas otro servicio
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Configuración del mensaje
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperación de Contraseña',
        text: `Su código para recuperar su contraseña es: ${code}`
    };

    try {
        // Enviar el correo
        await transporter.sendMail(mailOptions);
        res.json({ message: "Código enviado al correo.", code });
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        res.status(500).json({ message: "Error al enviar el correo." });
    }
};

/*const sendRecoveryEmailCode = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Generar un código de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Guardar el código en una variable temporal (puedes usar un almacenamiento más persistente)
    req.session.recoveryCode = code;

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperación de Contraseña',
        text: `Su código para recuperar su contraseña es: ${code}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Código enviado al correo.", recoveryCode: code }); // Incluir el código en la respuesta
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        res.status(500).json({ message: "Error al enviar el correo." });
    }
};*/

const resetKey = async(req, res) => {
    
    try {
        console.log(req.params);
        const { email } = req.params; 
        const updates = req.body;

        if (Object.keys(updates).length === 0) {
            res.status(400).json({message: "No fields provided for update"})
        };

        if (updates.password) {
            const hash = cryptos.createHash("sha256");
            hash.update(updates.password);
            updates.password = hash.digest("hex");
        };

        const connection = await getConnection();
        const result = await connection.query("UPDATE users SET ? WHERE email = ?", [updates, email]);;
        console.log(result);
        res.json(result);
    } catch (error) {
        console.error("Error al intentar la actualizaciòn de clave de usuario", error);
        res.status(500).json({message: "Error en el servidor."});
    }
}

export const methods = { 
    sendRecoveryEmailCode,
    resetKey,
    checkEmailExists
};
