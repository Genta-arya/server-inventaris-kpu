import prisma from "../../../../prisma/Config.js";
import { handleError } from "../../../utils/errorHandler.js";
import { getIndonesianDate } from "../BarangKeluar/GetBarangKeluarController.js";

export const UpdateBarangMasuk = async (req, res) => {
  const { barangId, qty, keterangan } = req.body;

  console.log(barangId, qty, keterangan);

  if (!barangId || qty === undefined) {
    return res.status(400).json({ message: "Barang ID dan qty harus diisi" });
  }

  try {
    const newBarangMasuk = await prisma.barangMasuk.create({
      data: {
        barangId,
        qty: parseInt(qty),
        keterangan,
      },
    });

    const updatedBarang = await prisma.barang.update({
      where: { id: barangId },
      data: {
        qty: {
          increment:  parseInt(qty),
        },
      },
    });

    return res.status(200).json({
      message: "Barang masuk berhasil diperbarui",
      data: {
        newBarangMasuk,
        updatedBarang,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error });
  }
};

// export const getBarangMasuk = async (req, res) => {
//   let { date } = req.body;

//   // Menentukan rentang tanggal
//   if (!date) {
//     const today = getIndonesianDate();
//     const startOfDay = new Date(today.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(today.setHours(23, 59, 59, 999));
//     date = { gte: startOfDay, lt: endOfDay };
//   } else {
//     const specifiedDate = new Date(date);
//     const startOfDay = new Date(specifiedDate.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(specifiedDate.setHours(23, 59, 59, 999));
//     date = { gte: startOfDay, lt: endOfDay };
//   }

//   try {
//     // Mengambil data barang masuk dari database
//     const barangMasuk = await prisma.barangMasuk.findMany({
//       where: {
//         tanggal: date,
        
//       },
//       select: {
//         keterangan: true,
//         qty: true,
//         tanggal: true,
//         barang: true,
        
//       },
//       orderBy: {
//         tanggal: "desc",
//       },
//     });

//     res.status(200).json({ data: barangMasuk });
//   } catch (error) {
//     handleError(res, error);
//   }
// };


export const getBarangMasuk = async (req, res) => {
  let { date } = req.body;

  let dateFilter = undefined;

  if (date) {
    const specifiedDate = new Date(date);
    const startOfDay = new Date(specifiedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(specifiedDate.setHours(23, 59, 59, 999));
    dateFilter = { gte: startOfDay, lt: endOfDay };
  }

  try {
    const barangMasuk = await prisma.barangMasuk.findMany({
      where: dateFilter
        ? { tanggal: dateFilter }
        : undefined, // Jangan filter tanggal kalau tidak dikirim
      select: {
        keterangan: true,
        qty: true,
        tanggal: true,
        barang: true,
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    res.status(200).json({ data: barangMasuk });
  } catch (error) {
    handleError(res, error);
  }
};

