import express from "express";
import { getReportBarangKeluar, GetReportKIR, getReportTahunan } from "../../controllers/Report/GetReportController.js";
import { AccesEndpoint } from "../../Midleware/Midleware.js";


const ReportRouter = express.Router();

ReportRouter.post("/report/inventaris",AccesEndpoint,getReportTahunan)
ReportRouter.get("/report/kir/:id", AccesEndpoint,GetReportKIR)
ReportRouter.post("/report/barangkeluar", AccesEndpoint,getReportBarangKeluar)
export default ReportRouter