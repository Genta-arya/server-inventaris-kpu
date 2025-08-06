import prisma from "../../../prisma/Config.js";
import { handleError } from "../../utils/errorHandler.js";

export const RekapData = async (req, res) => {
  try {
    const totalUser = await prisma.user.count({
      where: {
        role: {
          not: "admin",
        },
      },
    });

    const totalInventaris = await prisma.inventaris.count();

    const totalBarangKeluar = await prisma.barangKeluar.count();

    const totalBarangMasuk = await prisma.barangMasuk.count();

    const totalPermintaan = await prisma.permintaan.count();

    const totalBarang = await prisma.barang.count();

    const totalUsulan = await prisma.usulan.count();
    const totalRuangan = await prisma.ruangan.count();
    const totalPinjaman = await prisma.peminjaman.count();

    res.status(200).json({
      data: {
        totalUser,
        totalInventaris,
        totalUsulan,
        totalPermintaan,
        totalRuangan,
        totalBarang,
        totalPinjaman,
        totalBarangKeluar,
        totalBarangMasuk,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const CountPengeluaran = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const convertToWIB = (date) => {
      const utcTime = new Date(date).getTime();
      const wibOffset = 7 * 60 * 60 * 1000;
      return new Date(utcTime + wibOffset);
    };

    const barangTahunIni = await prisma.barang.findMany({
      where: {
        createdAt: {
          gte: convertToWIB(`${currentYear}-01-01T00:00:00Z`),
          lte: convertToWIB(`${currentYear}-12-31T23:59:59Z`),
        },
      },
      select: {
        qty: true,
        hargaBarang: true,
      },
    });

    const totalPengeluaran = barangTahunIni.reduce((acc, barang) => {
      return acc + barang.qty * barang.hargaBarang;
    }, 0);

    res.status(200).json({
      data: {
        totalPengeluaran,
        tahun: currentYear,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};
