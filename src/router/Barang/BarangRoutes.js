import express from "express";
import {
  handleEditBarang,
  handlePostBarang,
} from "../../controllers/Barang/PostBarangController.js";

import {
  GetBarang,
  GetSingleBarang,
  PrintQrCode,
} from "../../controllers/Barang/GetBarangController.js";
import { DeleteBarang } from "../../controllers/Barang/DeleteBarangController.js";
import { upload } from "../../Config/Firebase.js";
import { PostReturBarang } from "../../controllers/Retur/PostReturBarang.js";
import { getBarangKeluar } from "../../controllers/Barang/BarangKeluar/GetBarangKeluarController.js";
import {
  getBarangMasuk,
  UpdateBarangMasuk,
} from "../../controllers/Barang/BarangMasuk/PostBarangMasukController.js";
import { AccesEndpoint } from "../../Midleware/Midleware.js";

const BarangRouter = express.Router();
BarangRouter.post("/barang/upload", upload.single("image") ,AccesEndpoint, handlePostBarang);
BarangRouter.get("/barang", AccesEndpoint, GetBarang);
BarangRouter.post("/barang/keluar", AccesEndpoint, getBarangKeluar);
BarangRouter.put("/barang/:id",AccesEndpoint, handleEditBarang);
BarangRouter.delete("/barang/:id",AccesEndpoint, DeleteBarang);
BarangRouter.get("/barang/:id", GetSingleBarang);
BarangRouter.post("/retur/barang",AccesEndpoint, PostReturBarang);
BarangRouter.post("/barang/masuk",AccesEndpoint, UpdateBarangMasuk);
BarangRouter.post("/filter/barang/masuk",AccesEndpoint, getBarangMasuk);
BarangRouter.get("/report/barang/qrcode",AccesEndpoint, PrintQrCode);
export default BarangRouter;
