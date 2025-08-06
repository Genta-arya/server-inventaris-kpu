import { handleError } from "../../utils/errorHandler.js";
import prisma from "./../../../prisma/Config.js";

export const addPermintaan = async (req, res) => {
  const { data } = req.body;

  if (
    !data ||
    !data.nama ||
    !data.ruangan ||
    !data.items ||
    !Array.isArray(data.items)
  ) {
    return res.status(400).json({
      message: "Data ruangan dan items diperlukan dan harus dalam bentuk array",
    });
  }

  try {
    const ruanganId = parseInt(data.ruangan);

    for (const item of data.items) {
      const barang = await prisma.barang.findFirst({
        where: {
          namaBarang: item.namaBarang,
        },
      });

      if (!barang) {
        return res.status(404).json({
          message: `Barang dengan nama ${item.namaBarang} tidak ditemukan`,
        });
      }

      await prisma.permintaan.create({
        data: {
          qty: parseInt(item.jumlah),
          nama: data.nama,
          barangId: barang.id,
          ruanganId: ruanganId,
          status: null,
        },
      });
    }

    return res.status(200).json({ message: "Permintaan berhasil ditambahkan" });
  } catch (error) {
    handleError(res, error);
  }
};


