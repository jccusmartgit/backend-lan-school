import { Router } from "express";
import { methods as usersControllers } from "../controllers/user-controllers.js";

const router = Router();

router.get("/", usersControllers.getUsers);
router.get("/:id", usersControllers.getUser);
router.post("/", usersControllers.addUser);
router.delete("/:id", usersControllers.deleteUser);
router.put("/:id", usersControllers.updateUser);
router.patch("/:id", usersControllers.patchUser);
router.post("/login", usersControllers.loginUser);
router.get("/logout", usersControllers.logout);
router.post("/check-active", usersControllers.checkActiveStatus);
router.patch("/activate/:email", usersControllers.activateUser);

export default router;