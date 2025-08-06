import prisma from "../../../prisma/Config.js";
import { handleError } from "../../utils/errorHandler.js";
//  Report Tahunan Inventaris
export const getReportTahunan = async (req, res) => {
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ message: "Tahun tidak boleh kosong" });
  }

  try {
    const findAllInventaris = await prisma.inventaris.findMany({
      where: {
        createdAt: {
          gte: new Date(`${date}-01-01`),
          lt: new Date(`${Number(date) + 1}-01-01`),
        },
      },
      select: {
        id: true,
        qty: true,
        createdAt: true,
        updatedAt: true,
        barang: {
          select: {
            id: true,
            kodeBarang: true,
            namaBarang: true,
            nomorRegister: true,
            merkType: true,
            ukuran: true,
            qty: true,
            tahun: true,
            hargaBarang: true,
            kondisi: true,
            jenis: true,
            foto: true,
            perolehan: true,
            imageBarcode: true,
          },
        },
        ruangan: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    res.status(200).json(findAllInventaris);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil data" });
  }
};

export const GetReportKIR = async (req, res) => {
  const { id } = req.params;

  try {
    const findOneRuangan = await prisma.ruangan.findUnique({
      where: { id: parseInt(id) },
      include: {
        inventaris: {
          include: { barang: true },
        },
      },
    });

    if (!findOneRuangan) {
      return res.status(404).json({ message: "Ruangan tidak ditemukan" });
    }

    res.status(200).json({ data: findOneRuangan });
  } catch (error) {
    handleError(res, error);
  }
};

export const getReportBarangKeluar = async (req, res) => {
  const { year } = req.body;
  const parsedDate = new Date(year);
  const yearValue = parsedDate.getFullYear();
  
  try {

    const startOfYear = new Date(yearValue, 0, 1); 
    const endOfYear = new Date(yearValue + 1, 0, 1);


    const barangKeluarData = await prisma.barangKeluar.findMany({
      where: {
        tanggal: {
          gte: startOfYear,
          lt: endOfYear,
        },
        barang: {
          jenis: "Habis Pakai", // Filter berdasarkan jenis barang
        },
      },
      select: {
        barangId: true,
        qty: true,
        ruanganId: true,
      },
    });

    // Hitung total qty untuk setiap barangId dan ruanganId
    const totalQtyPerBarangPerRuangan = barangKeluarData.reduce((acc, item) => {
      const key = `${item.barangId}-${item.ruanganId}`;
      if (!acc[key]) {
        acc[key] = {
          totalQty: 0,
          barangId: item.barangId,
          ruanganId: item.ruanganId,
        };
      }
      acc[key].totalQty += item.qty;
      return acc;
    }, {});

    // Ambil data barang untuk menggabungkan nama barang
    const barangIds = [
      ...new Set(
        Object.values(totalQtyPerBarangPerRuangan).map((item) => item.barangId)
      ),
    ];
    const barangData = await prisma.barang.findMany({
      where: {
        id: { in: barangIds },
      },
      select: {
        id: true,
        namaBarang: true,
        jenis: true,
      },
    });

    // Ambil data ruangan untuk menggabungkan nama ruangan
    const ruanganIds = [
      ...new Set(
        Object.values(totalQtyPerBarangPerRuangan).map((item) => item.ruanganId)
      ),
    ];
    const ruanganData = await prisma.ruangan.findMany({
      where: {
        id: { in: ruanganIds },
      },
      select: {
        id: true,
        nama: true,
      },
    });

    
    const result = Object.values(totalQtyPerBarangPerRuangan).map((item) => {
      const barang = barangData.find((b) => b.id === item.barangId);
      const ruangan = ruanganData.find((r) => r.id === item.ruanganId);
      return {
        id: item.barangId,
        namaBarang: barang?.namaBarang || "Nama Barang Tidak Tersedia",
        jenis: barang?.jenis || "Jenis Tidak Tersedia",
        namaRuangan: ruangan?.nama || "Nama Ruangan Tidak Tersedia",
        totalQty: item.totalQty, // Total qty untuk barang per ruangan
      };
    });

    // Mengirimkan hasil ke client
    res.json({ data: result, tahun: yearValue });
  } catch (error) {
    handleError(res, error);
  }
};
