import { Router } from "express";
import { activitiesQuery as actQueriesControllers } from "../controllers/activitiesForUser.js";

const router = Router();

router.get("/:user_id", actQueriesControllers.getActivitiesUsers);

export default router;