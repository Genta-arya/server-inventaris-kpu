import express from "express";
import { GetAllInventaris } from "../../controllers/Inventaris/GetInventarisController.js";
import { AccesEndpoint } from "../../Midleware/Midleware.js";



const InventarisRouter = express.Router();
InventarisRouter.get("/inventaris",AccesEndpoint, GetAllInventaris);
export default InventarisRouter;
