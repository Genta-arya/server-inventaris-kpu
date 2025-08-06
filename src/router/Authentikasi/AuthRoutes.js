import express from "express";
import {
  checkLogin,
  getUser,
  handleDeleteUser,
  handleLogin,
  handleLogout,
  handleRegister,
  updateAvatarProfil,
  updateDataNameUser,
} from "../../controllers/Authentikasi/LoginController.js";
import { upload } from "../../Config/Firebase.js";
import { AccesEndpoint } from "../../Midleware/Midleware.js";

const AuthRouter = express.Router();
AuthRouter.post("/login", handleLogin);
AuthRouter.post("/user", checkLogin);
AuthRouter.get("/user", AccesEndpoint, getUser);
AuthRouter.post("/register",  handleRegister);
AuthRouter.post("/logout", AccesEndpoint, handleLogout);
AuthRouter.delete("/user/:id", AccesEndpoint, handleDeleteUser);
AuthRouter.put("/user/name/:id", AccesEndpoint, updateDataNameUser);
AuthRouter.post(
  "/user/avatar/:id",
  upload.single("image"),
  AccesEndpoint,
  updateAvatarProfil
);
export default AuthRouter;
