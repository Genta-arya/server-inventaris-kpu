import prisma from "../../../prisma/Config.js";
import { handleError } from "../../utils/errorHandler.js";
// export const PostReturBarang = async (req, res) => {
//   const { barangId, ruangId , qty } = req.body;

//   console.log("Received barangId:", barangId);
//   console.log("Received ruangId:", ruangId);

//   if (!barangId) {
//     console.log("Error: Barang ID diperlukan");
//     return res.status(400).json({ message: "Barang ID diperlukan" });
//   }

//   try {
//     // Cari inventaris berdasarkan barangId
//     const inventarisList = await prisma.inventaris.findMany({
//       where: { ruanganId: parseInt(ruangId) , barangId:barangId},
//       include: {
//         barang: true,
//       },
//     });

//     console.log("Inventaris List:", inventarisList);

//     if (inventarisList.length === 0) {
//       console.log("Error: Inventaris tidak ditemukan");
//       return res.status(404).json({ message: "Inventaris tidak ditemukan" });
//     }

//     // Mengambil inventaris pertama dari list
//     const inventaris = inventarisList.find(item => item.barangId=== barangId);
//     console.log("Selected Inventaris:", inventaris);

//     // Update stok barang di master
//     const updatedBarang = await prisma.barang.update({
//       where: { id: barangId  },
//       data: {
//         qty: inventaris.barang.qty + inventaris.qty, // Tambah qty ke stok barang
//       },
//     });

//     console.log("Updated Barang:", updatedBarang);

//     // Hapus data dari tabel BarangKeluar berdasarkan barangId
//     const deletedBarangKeluar = await prisma.barangKeluar.deleteMany({
//       where: { barangId: barangId, ruanganId: parseInt(ruangId) },
//     });

//     console.log("Deleted BarangKeluar:", deletedBarangKeluar);

//     // Hapus data permintaan terkait
//     const deletedPermintaan = await prisma.permintaan.deleteMany({
//       where: { ruanganId: parseInt(ruangId), barangId: barangId }, // Menggunakan parseInt() untuk mengkonversi ruangId },
//     });

//     console.log("Deleted Permintaan:", deletedPermintaan);

//     // Hapus semua inventaris terkait barangId
//     const deletedInventaris = await prisma.inventaris.deleteMany({
//       where: { ruanganId: parseInt(ruangId), barangId: barangId },
//     });

//     console.log("Deleted Inventaris:", deletedInventaris);

//     return res.status(200).json({
//       message: "Barang berhasil di-retur",
//       updatedBarang,
//     });
//   } catch (error) {
//     console.error("Error occurred:", error);
//     handleError(res, error);
//   }
// };

export const PostReturBarang = async (req, res) => {
  const { barangId, ruangId, qty } = req.body;

  console.log("Received barangId:", barangId);
  console.log("Received ruangId:", ruangId);
  console.log("Received qty:", qty);

  if (!barangId) {
    console.log("Error: Barang ID diperlukan");
    return res.status(400).json({ message: "Barang ID diperlukan" });
  }

  if (!qty || qty <= 0) {
    console.log("Error: Quantity yang valid diperlukan");
    return res.status(400).json({ message: "Quantity yang valid diperlukan" });
  }

  try {
    // Cari inventaris berdasarkan barangId dan ruangId
    const inventarisList = await prisma.inventaris.findMany({
      where: { ruanganId: parseInt(ruangId), barangId: barangId },
      include: {
        barang: true,
      },
    });

    console.log("Inventaris List:", inventarisList);

    if (inventarisList.length === 0) {
      console.log("Error: Inventaris tidak ditemukan");
      return res.status(404).json({ message: "Inventaris tidak ditemukan" });
    }

    // Mengambil inventaris pertama dari list
    const inventaris = inventarisList.find(
      (item) => item.barangId === barangId
    );
    console.log("Selected Inventaris:", inventaris);

    // Update stok barang di master dengan qty dari input user
    const updatedBarang = await prisma.barang.update({
      where: { id: barangId },
      data: {
        qty: inventaris.barang.qty + parseInt(qty), // Tambah qty input ke stok barang
      },
    });

    await prisma.inventaris.updateMany({
      where: { ruanganId: parseInt(ruangId), barangId: barangId },
      data: {
        qty: inventaris.qty - parseInt(qty),
      },
    });

    // jika barang inventaris sudah 0 maka delete
    await prisma.inventaris.deleteMany({
      where: { ruanganId: parseInt(ruangId), barangId: barangId, qty: 0 },
    });

    // jika permintaan 0 maka delete
    await prisma.permintaan.updateMany({
      where: { ruanganId: parseInt(ruangId), barangId: barangId },
      data: {
        qty: inventaris.qty - parseInt(qty),
      },
    });

    await prisma.permintaan.deleteMany({
      where: { ruanganId: parseInt(ruangId), barangId: barangId, qty: 0 },
    });

    console.log("Updated Barang:", updatedBarang);

    // Mengurangi qty di barangKeluar berdasarkan qty yang di-retur
    const updatedBarangKeluar = await prisma.barangKeluar.updateMany({
      where: { barangId: barangId, ruanganId: parseInt(ruangId) },
      data: {
        qty: {
          decrement: parseInt(qty), // Kurangi qty barang keluar sesuai dengan retur
        },
      },
    });

    console.log("Updated BarangKeluar:", updatedBarangKeluar);

    // Jika qty di barangKeluar sudah habis, hapus entri tersebut
    await prisma.barangKeluar.deleteMany({
      where: {
        barangId: barangId,
        ruanganId: parseInt(ruangId),
        qty: 0,
        keterangan: "Permintaan barang",
      },
    });

    console.log("Deleted BarangKeluar jika qty habis");

    return res.status(200).json({
      message: "Barang berhasil di-retur",
      updatedBarang,
    });
  } catch (error) {
    console.error("Error occurred:", error);
    handleError(res, error);
  }
};

// export const PostReturBarang = async (req, res) => {
//     const { barangId, ruangId } = req.body;

//     console.log("Received ruangId:", ruangId); // Log ruangId yang diterima dari request
//     console.log("Received barangId:", barangId); // Log barangId yang diterima dari request

//     if (!barangId) {
//         console.log("Error: Barang ID diperlukan");
//         return res.status(400).json({ message: "Barang ID diperlukan" });
//     }

//     try {
//         // Cari inventaris berdasarkan barangId dan ruangId
//         const inventarisList = await prisma.inventaris.findMany({
//             where: {
//                 barangId: barangId,
//                 ruanganId: parseInt(ruangId), // Menggunakan parseInt() untuk mengkonversi ruangId // Menambahkan filter untuk ruangId
//             },
//             include: {
//                 barang: true,
//             },
//         });

//         console.log("Inventaris List:", inventarisList); // Log hasil pencarian inventaris

//         if (inventarisList.length === 0) {
//             console.log("Error: Inventaris tidak ditemukan untuk barangId dan ruangId yang diberikan");
//             return res.status(404).json({ message: "Inventaris tidak ditemukan" });
//         }

//         // Mengambil inventaris pertama dari list
//         const inventaris = inventarisList[0];
//         console.log("Selected Inventaris:", inventaris); // Log inventaris yang dipilih

//         // Log barang yang akan diperbarui
//         console.log("Barang to be updated:", {
//             where: { id: inventaris.barangId },
//             data: {
//                 qty: inventaris.barang.qty + inventaris.qty, // Tambah qty ke stok barang
//             },
//         });

//         // Log penghapusan data dari tabel BarangKeluar
//         console.log("BarangKeluar delete criteria:", {
//             where: { barangId: inventaris.barangId },
//         });

//         // Log penghapusan data permintaan
//         console.log("Permintaan delete criteria:", {
//             where: { barangId: inventaris.barangId },
//         });

//         // Log penghapusan inventaris
//         console.log("Inventaris delete criteria:", {
//             where: { barangId: barangId, ruangId: ruangId },
//         });

//         // Hanya mengembalikan respons tanpa melakukan update atau penghapusan
//         return res.status(200).json({
//             message: "Data berhasil diproses untuk di-retur",
//             inventaris,
//         });
//     } catch (error) {
//         console.error("Error occurred:", error); // Log error jika terjadi kesalahan
//         handleError(res, error);
//     }
// };
