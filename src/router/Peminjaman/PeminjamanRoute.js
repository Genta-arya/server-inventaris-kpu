import express from "express";
import {
  getPeminjaman,
  PostPeminjaman,
  ReturPeminjaman,
  updateStatusPeminjaman,
} from "../../controllers/Peminjaman/PostPeminjamanController.js";
import { AccesEndpoint } from "../../Midleware/Midleware.js";

const PeminjamanRouter = express.Router();

PeminjamanRouter.post("/peminjaman", AccesEndpoint, PostPeminjaman);
PeminjamanRouter.put("/peminjaman",AccesEndpoint, updateStatusPeminjaman);
PeminjamanRouter.put("/retur/peminjaman",AccesEndpoint, ReturPeminjaman);
PeminjamanRouter.post("/filter/peminjaman",AccesEndpoint, getPeminjaman);

export default PeminjamanRouter;
