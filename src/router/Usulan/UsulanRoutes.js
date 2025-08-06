import express from "express";
import {
  deleteUsul,
  PostUsul,
  updateNamaBarang,
  updateStatusUsulan,
} from "../../controllers/Usulan/PostusulanController.js";
import {
  getDataUsulan,
  getSingleUsulan,
} from "../../controllers/Usulan/GetUsulanController.js";
import { AccesEndpoint } from "../../Midleware/Midleware.js";

const UsulanRouter = express.Router();
UsulanRouter.post("/usulan", AccesEndpoint, PostUsul);
UsulanRouter.post("/data/usulan",AccesEndpoint, getDataUsulan);
UsulanRouter.get("/usulan/:id",AccesEndpoint, getSingleUsulan);
UsulanRouter.put("/usulan/:id",AccesEndpoint, updateStatusUsulan);
UsulanRouter.put("/nama/usulan/:id",AccesEndpoint, updateNamaBarang);
UsulanRouter.delete("/usulan/:id",AccesEndpoint, deleteUsul);
export default UsulanRouter;
