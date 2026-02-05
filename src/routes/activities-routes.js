import { Router } from "express";
import { methods as activitiesControllers } from "../controllers/activities-controllers.js";

const router = Router();

router.get("/", activitiesControllers.getActivities);
router.get("/:id", activitiesControllers.getActivity);
router.get("/actuser:user_id", activitiesControllers.getActivitiesUser);
router.post("/", activitiesControllers.addActivity);
router.delete("/:id", activitiesControllers.deleteActivity);
router.delete("/clear/:user_id", activitiesControllers.clearTasks);
router.put("/:id", activitiesControllers.updateActivity);
router.patch("/:id", activitiesControllers.patchTask);

export default router;