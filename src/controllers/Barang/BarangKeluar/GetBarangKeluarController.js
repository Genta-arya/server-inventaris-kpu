import prisma from "../../../../prisma/Config.js";
import { handleError } from "../../../utils/errorHandler.js";

// Fungsi untuk mendapatkan waktu di Indonesia (WIB, UTC+7)
export const getIndonesianDate = () => {
  const now = new Date();

  const offset = 7;
  const indonesianTime = new Date(now.getTime() + offset * 60 * 60 * 1000);
  return indonesianTime;
};
export const getBarangKeluar = async (req, res) => {
  let { date } = req.body;

  if (!date) {
   
  } else {
    const specifiedDate = new Date(date);
    const startOfDay = new Date(specifiedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(specifiedDate.setHours(23, 59, 59, 999));

    date = { gte: startOfDay, lt: endOfDay };
  }

  try {
    let barangKeluarData;



    if (!date) {
      console.log("tidak ada tanggal");
      barangKeluarData = await prisma.barangKeluar.findMany({
        include: {
          barang: true,
          ruangan: true, // Ambil data ruangan
        },
      });
    } else {
      barangKeluarData = await prisma.barangKeluar.findMany({
        where: {
          tanggal: date,
        },
        include: {
          barang: true,
          ruangan: true, // Ambil data ruangan
        },
      });
    }

    // Kelompokkan data berdasarkan ruanganId dan barangId serta hitung qty
    const rekapQtyKeluarRuangId = barangKeluarData.reduce((acc, item) => {
      const key = `${item.ruanganId}-${item.barangId}`;
      if (!acc[key]) {
        acc[key] = {
          barangId: item.barangId,
          _sum: { qty: 0 },
          tanggal: item.tanggal,
          ket: item.keterangan,
          barangJenis: item.barang.jenis,
          sisaStok: item.barang.qty,
          ruanganNama: item.ruangan ? item.ruangan.nama : "-",
          barangNama: item.barang.namaBarang, // Ambil nama barang
        };
      }
      acc[key]._sum.qty += item.qty;
      return acc;
    }, {});

    // Convert object ke array
    const rekapArray = Object.values(rekapQtyKeluarRuangId);

    return res.status(200).json({
      message: "Data barang keluar berhasil diambil",
      data: rekapArray,
    });
  } catch (error) {
    handleError(res, error);
  }
};
