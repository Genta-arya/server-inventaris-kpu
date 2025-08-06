import express from "express";
import {
  CountPengeluaran,
  RekapData,
} from "../../controllers/Dashboard/DashboardController.js";
import { AccesEndpoint } from "../../Midleware/Midleware.js";

const DashboardRouter = express.Router();

DashboardRouter.get("/dashboard",AccesEndpoint, RekapData);
DashboardRouter.get("/pengeluaran/tahunan",AccesEndpoint, CountPengeluaran);
export default DashboardRouter;
