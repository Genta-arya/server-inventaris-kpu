import prisma from "../../../prisma/Config.js";
import { handleError } from "./../../utils/errorHandler.js";

export const addRuangan = async (req, res) => {
  const { namaRuangan, kode } = req.body;

  if (!namaRuangan || !kode) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Cek apakah nama ruangan sudah ada
    const findName = await prisma.ruangan.findFirst({
      where: {
        nama: namaRuangan,
      },
    });

    if (findName) {
      return res.status(400).json({ message: "Nama Ruangan sudah ada" });
    }

    // Cek apakah kode ruangan sudah ada
    const findKode = await prisma.ruangan.findFirst({
      where: {
        kodeRuang: kode,
      },
    });

    if (findKode) {
      return res.status(400).json({ message: "Kode Ruangan sudah ada" });
    }

    // Jika tidak ada, buat ruangan baru
    const createRuangan = await prisma.ruangan.create({
      data: {
        nama: namaRuangan,
        kodeRuang: kode,
      },
    });

    return res.status(200).json({ data: createRuangan });

  } catch (error) {
    handleError(res, error);
  }
};
