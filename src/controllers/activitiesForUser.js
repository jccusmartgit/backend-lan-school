import {getConnection} from "../database/database.js";

const getActivitiesUsers = async(req, res) => {
    try {
        console.log(req.params);
        const { user_id } = req.params;
        //const { user_id } = req.user.id;
        //console.log(req.user.id)
        const connection = await getConnection();
        const result = await connection.query("SELECT tk.id, tk.description, done, tk.start_date, tk.end_date, tk.user_id FROM tasks tk, users us WHERE us.id = ? AND tk.user_id = us.id ", [user_id]  );
        console.log(result);
        console.log("Resultado de DB:", result);
        res.json(result[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const activitiesQuery = {
    getActivitiesUsers
}
