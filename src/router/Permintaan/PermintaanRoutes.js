import express from "express";
import { addPermintaan } from "../../controllers/Permintaan/PostPermintaanController.js";
import { getPermintaan } from "../../controllers/Permintaan/GetPermintaanController.js";
import {
  RejectPermintaan,
  updatePermintaan,
} from "../../controllers/Permintaan/UpdatePermintaanController.js";
import { AccesEndpoint } from "../../Midleware/Midleware.js";

const PermintaanRouter = express.Router();
PermintaanRouter.post("/permintaan",AccesEndpoint, addPermintaan);
PermintaanRouter.post("/filter/permintaan", AccesEndpoint, getPermintaan);
PermintaanRouter.put("/permintaan/:id", AccesEndpoint,updatePermintaan);
PermintaanRouter.put("/reject/permintaan/:id", AccesEndpoint,RejectPermintaan);
export default PermintaanRouter;
