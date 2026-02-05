import { DateTime } from "luxon";
import {getConnection} from "../database/database.js";


const getActivities = async (req, res) => {
   try {
    const connection = await getConnection()
    const result = await connection.query("SELECT id, description, done,user_id FROM tasks");
    console.log(result);
    res.json(result);
   } catch (error) {
    res.status(500);
    res.send(error.message);
   }
};

const getActivitiesUser = async (req, res) =>{
    try {
        const userId = req.user.id;
        const connection = await getConnection();
        const result = await connection.query("SELECT id, description, done, user_id, start_date, end_date FROM tasks WHERE user_id = ?", [userId]);
        console.log(result);
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const getActivity = async(req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const connection = await getConnection();
        const result = await connection.query("SELECT id,description,done,user_id FROM tasks WHERE id = ?", id);
        console.log(result);
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const addActivity = async (req, res) => {
    try {
        const { description, start_date, end_date, user_id } = req.body;

        if (!description || !start_date || !end_date || !user_id) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // Convertir fechas al formato correcto si es necesario**
        const formattedStartDate = DateTime.fromISO(start_date, { zone: "America/Bogota" }).toFormat("yyyy-MM-dd HH:mm:ss");
        const formattedEndDate = DateTime.fromISO(end_date, { zone: "America/Bogota" }).toFormat("yyyy-MM-dd HH:mm:ss");


        const activity = {
            description,
            start_date: formattedStartDate, // Usar fechas formateadas
            end_date: formattedEndDate, // Usar fechas formateadas
            user_id,
        };

        const connection = await getConnection();
        const result = await connection.query("INSERT INTO tasks SET ?", activity);

        res.json({ message: "Tarea creada exitosamente", result });
    } catch (error) {
        console.error("Error al crear la tarea:", error);
        res.status(500).send(error.message);
    }
};


const patchTask = async(req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const updates = req.body;
        if (Object.keys(updates).length === 0 ) {
            res.status(400).json({message: "No fields provided for update"});
        }

                // Convertir las fechas al formato MySQL 'YYYY-MM-DD HH:MM:SS'
                if (updates.start_date) {
                    updates.start_date = DateTime.fromISO(updates.start_date, { zone: "America/Bogota" }).toFormat("yyyy-MM-dd HH:mm:ss");
                }
        
                if (updates.end_date) {
                    updates.end_date = DateTime.fromISO(updates.end_date, { zone: "America/Bogota" }).toFormat("yyyy-MM-dd HH:mm:ss");
                }

        const connection = await getConnection();
        const result = await connection.query("UPDATE tasks SET ? WHERE id = ?", [updates, id]);
        console.log(result);
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};


const deleteActivity = async(req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const connection = await getConnection();
        const result = await connection.query("DELETE FROM tasks WHERE id = ?", id);
        console.log(result);
        res.json({ message: "Tarea eliminada", result });
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const clearTasks = async(req, res) => {
    try {
        console.log(req.params);
        const { user_id } = req.params;
        const connection = await getConnection();
        const result = await connection.query("DELETE FROM tasks WHERE user_id=?", [user_id]);
        console.log(result);
        res.json({ message: "Lista eliminada", result });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const updateActivity = async(req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const { description, done, user_id } = req.body;

        if (id === undefined ||description === undefined || done === undefined || user_id === undefined ) {
            res.status(400).json({message: "The fields are required"});
        }

        const activity = { id, description, done, user_id };
        const connection = await getConnection();
        const result = await connection.query("UPDATE tasks SET ? WHERE id = ?", [activity, id] );
        console.log(result);
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};


export const methods = {
    getActivities,
    getActivity,
    getActivitiesUser,
    addActivity,
    patchTask,
    deleteActivity,
    clearTasks,
    updateActivity
}

