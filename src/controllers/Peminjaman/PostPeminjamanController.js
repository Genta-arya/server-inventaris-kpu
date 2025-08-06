import prisma from "../../../prisma/Config.js";
import { handleError } from "../../utils/errorHandler.js";
import { getIndonesianDate } from "../Barang/BarangKeluar/GetBarangKeluarController.js";

export const PostPeminjaman = async (req, res) => {
  const { data } = req.body;

  const { barangId, nama, qty } = data;

  console.log(barangId, nama, qty);
  if (!barangId || !qty || !nama) {
    return res.status(400).json({ message: "Barang ID dan qty harus diisi" });
  }
  try {
    const newPeminjaman = await prisma.peminjaman.create({
      data: {
        barangId,
        nama,
        qty,
        status: "belum",
      },
    });

    return res.status(200).json({
      message: "Peminjaman berhasil ditambahkan",
      data: newPeminjaman,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getPeminjaman = async (req, res) => {
  let { date } = req.body;
  console.log(date);

  if (!date) {
  
  } else {
    const specifiedDate = new Date(date);
    const startOfDay = new Date(specifiedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(specifiedDate);
    endOfDay.setHours(23, 59, 59, 999);

    date = { gte: startOfDay, lt: endOfDay };
  }
  try {
    let peminjaman;

    if (!date) {
      console.log("tidak ada tanggal");
      peminjaman = await prisma.peminjaman.findMany({
        include: {
          barang: true,
        },
      });
    } else {
      peminjaman = await prisma.peminjaman.findMany({
        where: {
          createdAt: date,
        },
        include: {
          barang: true,
        },
      });
    }
   
    return res.status(200).json({
      message: "Data peminjaman",
      data: peminjaman,
    });
  } catch (error) {
    handleError(res, error);
  }
};
export const updateStatusPeminjaman = async (req, res) => {
  const { data } = req.body;
  const { peminjamanId, status } = data;

  if (!peminjamanId || !status) {
    return res
      .status(400)
      .json({ message: "Peminjaman ID dan status harus diisi" });
  }

  try {
    // Update status peminjaman saja jika status adalah 'tolak'
    if (status === "tolak") {
      const peminjaman = await prisma.peminjaman.update({
        where: {
          id: peminjamanId,
        },
        data: {
          status,
          status_kembali: "-",
        },
      });
      
      await prisma.barangKeluar.deleteMany({
        where: {
          barangId: peminjaman.barangId,
        },
      });

      return res.status(200).json({
        message: "Status peminjaman ditolak",
        data: peminjaman,
      });
    }

    // Jika bukan 'tolak', lakukan update status dan proses lainnya
    const peminjaman = await prisma.peminjaman.update({
      where: {
        id: peminjamanId,
      },
      data: {
        status,
        status_kembali: "pinjam",
      },
    });

    if (peminjaman) {
      await prisma.barang.update({
        where: {
          id: peminjaman.barangId,
        },
        data: {
          qty: {
            decrement: peminjaman.qty,
          },
        },
      });

      await prisma.barangKeluar.create({
        data: {
          qty: peminjaman.qty,
          keterangan: "peminjaman",
          barang: {
            connect: {
              id: peminjaman.barangId,
            },
          },
        },
      });
    }

    return res.status(200).json({
      message: "Status peminjaman updated",
      data: peminjaman,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const ReturPeminjaman = async (req, res) => {
  const { data } = req.body;
  const { peminjamanId } = data;
  // tanggal indonesia
  const today = getIndonesianDate ();
  console.log(today);
  if (!peminjamanId) {
    return res
      .status(400)
      .json({ message: "Peminjaman ID dan status harus diisi" });
  }
 
  try {
    const peminjaman = await prisma.peminjaman.update({
      where: {
        id: peminjamanId,
      },
      data: {
        status_kembali: "kembali",
        updatedAt: today,
      },
    });

    // get qty id peminjaman
    const qty = peminjaman.qty;
    console.log(qty);

    if (peminjaman) {
      await prisma.barang.update({
        where: {
          id: peminjaman.barangId,
        },
        data: {
          qty: {
            increment: qty,
          },
        },
      });
      // decrement barang keluar
      await prisma.barangKeluar.updateMany({
        where: {
          barangId: peminjaman.barangId,
          keterangan: "peminjaman",
        },
        data: {
          qty: {
            decrement: qty,
          },
        },
      });
      // jika barang keluar 0 maka hapus
      await prisma.barangKeluar.deleteMany({
        where: {
          qty: 0,
          keterangan: "peminjaman",
        },
      });
    }
    return res.status(200).json({
      message: "Retur peminjaman updated",
      data: peminjaman,
    });
  } catch (error) {
    handleError(res, error);
  }
};
