import prisma from "../../../prisma/Config.js";
import { handleError } from "../../utils/errorHandler.js";

export const updatePermintaan = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;

  try {
    // Ambil permintaan berdasarkan ID
    const permintaan = await prisma.permintaan.findUnique({
      where: { id: parseInt(id) },
      include: {
        barang: true, // Include data barang untuk mendapatkan stok saat ini
      },
    });

    if (!permintaan) {
      return res.status(404).json({ message: "Permintaan tidak ditemukan , silahkan refresh halaman" });
    }

    if (permintaan.status === true) {
      return res
        .status(400)
        .json({ message: "Status permintaan ini sudah disetujui" });
    }

    // Validasi stok barang
    if (data.qty > permintaan.barang.qty) {
      return res.status(400).json({ message: "Stok tidak mencukupi" });
    }

    // Validasi apakah ruanganId ada di dalam data
    if (!data.ruanganId) {
      return res.status(400).json({ message: "Ruangan ID tidak ditemukan" });
    }

    // Ambil ruangan berdasarkan ID
    const ruangan = await prisma.ruangan.findUnique({
      where: { id: data.ruanganId },
      include: {
        inventaris: true,
      },
    });

    // Cek jenis barang dan lakukan logika yang sesuai
    if (permintaan.barang.jenis === 'Habis Pakai') {
      // Untuk barang habis pakai, buat entri di BarangKeluar
      await prisma.barangKeluar.create({
        data: {
          barangId: permintaan.barang.id,
          qty: data.qty,
          tanggal: new Date(),
          keterangan: 'Permintaan barang habis pakai',
          ruanganId: data.ruanganId, // Sertakan ID ruangan tujuan
        },
      });

      // Update stok barang di data master
      await prisma.barang.update({
        where: { id: permintaan.barang.id },
        data: {
          qty: permintaan.barang.qty - data.qty,
        },
      });

    } else if (permintaan.barang.jenis === 'Asset') {
      // Untuk barang asset, cek jika barang sudah ada di inventaris ruangan
      const inventarisDiRuangan = ruangan.inventaris.find(
        (i) => i.barangId === permintaan.barang.id
      );

      if (inventarisDiRuangan) {
        await prisma.inventaris.update({
          where: { id: inventarisDiRuangan.id },
          data: {
            qty: inventarisDiRuangan.qty + data.qty,
          },
        });
      } else {
        await prisma.inventaris.create({
          data: {
            qty: data.qty,
            barangId: permintaan.barang.id,
            ruanganId: data.ruanganId,
          },
        });
      }

      // Juga buat entri di BarangKeluar
       await prisma.barangKeluar.create({
        data: {
          barangId: permintaan.barang.id,
          qty: data.qty,
          tanggal: new Date(),
          keterangan: 'Permintaan barang Asset',
          ruanganId: data.ruanganId, // Sertakan ID ruangan tujuan
        },
      });

      // Update stok barang di data master
      await prisma.barang.update({
        where: { id: permintaan.barang.id },
        data: {
          qty: permintaan.barang.qty - data.qty,
        },
      });
    }

    // Update status dan qty permintaan
    const updatedPermintaan = await prisma.permintaan.update({
      where: { id: parseInt(id) },
      data: {
        status: true,
        qty: data.qty, // Update qty permintaan
        ruangan: {
          connect: { id: data.ruanganId },
        },
      },
    });

    res.status(200).json({
      message: "Permintaan disetujui",
      updatedPermintaan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating permintaan", error });
  }
};

  export const RejectPermintaan = async (req, res) => {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({ message: "Id is required" });
    }
  
    try {
      const permintaan = await prisma.permintaan.findUnique({
        where: { id: parseInt(id) },
        include: {
          barang: true,
          ruangan: {
            include: {
              inventaris: true,
            },
          },
        },
      });
  
      if (!permintaan) {
        return res.status(404).json({ message: "Permintaan tidak ditemukan, silahkan refresh halaman" });
      }
  
      if (permintaan.status === false) {
        return res.status(400).json({ message: "Status Permintaan ini sudah ditolak" });
      }
  
      // Hapus entri di BarangKeluar jika ada
      const barangKeluar = await prisma.barangKeluar.findFirst({
        where: {
          barangId: permintaan.barang.id,
          tanggal: {
            gte: new Date(permintaan.createdAt), // Pastikan tanggal lebih besar dari tanggal permintaan
          },
        },
      });
  
      if (barangKeluar) {
        await prisma.barangKeluar.delete({
          where: {
            id: barangKeluar.id,
          },
        });
      }
  
      // Update inventaris jika barang ada di inventaris ruangan
      const inventarisDiRuangan = permintaan.ruangan.inventaris.find(
        (i) => i.barangId === permintaan.barang.id
      );
  
      if (inventarisDiRuangan) {
        await prisma.inventaris.update({
          where: { id: inventarisDiRuangan.id },
          data: {
            qty: inventarisDiRuangan.qty - permintaan.qty,
          },
        });
  
        // Hapus inventaris jika kuantitas menjadi 0
        if ((inventarisDiRuangan.qty - permintaan.qty) <= 0) {
          await prisma.inventaris.delete({
            where: { id: inventarisDiRuangan.id },
          });
        }
      }
  
      // Kembalikan stok barang di data master
      await prisma.barang.update({
        where: { id: permintaan.barang.id },
        data: {
          qty: permintaan.barang.qty + permintaan.qty,
        },
      });
  
      // Update status permintaan
      const updatedPermintaan = await prisma.permintaan.update({
        where: { id: parseInt(id) },
        data: {
          status: false,
        },
      });
  
      res.status(200).json({
        message: "Permintaan ditolak, barang dikembalikan, dan entri BarangKeluar dihapus jika ada.",
        updatedPermintaan,
      });
    } catch (error) {
      handleError(res, error);
    }
  };
  