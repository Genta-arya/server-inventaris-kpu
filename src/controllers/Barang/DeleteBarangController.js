import prisma from "../../../prisma/Config.js";
import fs from 'fs';
import path from 'path';
import { storage } from "../../Config/Firebase.js";
import { deleteObject, ref } from "firebase/storage";

// export const DeleteBarang = async (req, res) => {
//     const { id } = req.params; // Mengambil ID dari URL params atau request body

//     try {
//         // 1. Temukan barang untuk mendapatkan URL gambar
//         const barang = await prisma.barang.findUnique({
//             where: { id: id },
//             select: { foto: true, imageBarcode: true }
//         });

//         if (!barang) {
//             return res.status(404).json({ message: 'Barang tidak ditemukan' });
//         }

//         await prisma.permintaan.deleteMany({
//             where: { barangId: id }
//         });

//         await prisma.inventaris.deleteMany({
//             where: { barangId: id }
//         });

//         // 3. Hapus barang dari database
//         await prisma.barang.delete({
//             where: { id: id }
//         });
//         await prisma.barang.delete({
//             where: { id: id }
//         });


//         // 3. Hapus gambar dari server lokal
//         // Jika gambar disimpan di server lokal
//         if (barang.foto) {
//             const fotoPath = path.resolve("public", "image", path.basename(barang.foto));
//             if (fs.existsSync(fotoPath)) {
//                 fs.unlinkSync(fotoPath);
//             }
//         }

//         if (barang.imageBarcode) {
//             const barcodePath = path.resolve("public", "image", path.basename(barang.imageBarcode));
//             if (fs.existsSync(barcodePath)) {
//                 fs.unlinkSync(barcodePath);
//             }
//         }

//         // Jika menggunakan penyimpanan cloud, gunakan SDK untuk menghapus gambar

//         res.status(200).json({ message: 'Barang berhasil dihapus' });
//     } catch (error) {
//         console.error('Error deleting barang:', error);
//         res.status(500).json({ message: 'Terjadi kesalahan saat menghapus barang' });
//     }
// }




export const DeleteBarang = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Temukan barang untuk mendapatkan URL gambar dan relasi
        const barang = await prisma.barang.findUnique({
            where: { id: id },
            select: { foto: true, imageBarcode: true, permintaan: true, inventaris: true }
        });

        if (!barang) {
            return res.status(404).json({ message: 'Barang tidak ditemukan' });
        }

        // 2. Hapus relasi di Permintaan, Inventaris, dan BarangKeluar
        await prisma.permintaan.deleteMany({
            where: { barangId: id }
        });

        await prisma.inventaris.deleteMany({
            where: { barangId: id }
        });

        await prisma.barangKeluar.deleteMany({
            where: { barangId: id }
        });

        await prisma.barangMasuk.deleteMany({
            where: { barangId: id }
        });

        await prisma.peminjaman.deleteMany({
            where: { barangId: id }
        });

        // 3. Hapus barang dari database
        await prisma.barang.delete({
            where: { id: id }
        });

        // 4. Hapus gambar dari Firebase Storage
        // if (barang.foto) {
        //     const fotoPath = decodeURIComponent(barang.foto.split('/o/')[1].split('?')[0]);
        //     const fotoRef = ref(storage, fotoPath);
        //     try {
        //         console.log(`Attempting to delete file at path: ${fotoPath}`);
        //         await deleteObject(fotoRef);
        //         console.log(`File deleted successfully at path: ${fotoPath}`);
        //     } catch (error) {
        //         console.error('Error deleting foto:', error);
        //     }
        // }

        // if (barang.imageBarcode) {
        //     const barcodePath = decodeURIComponent(barang.imageBarcode.split('/o/')[1].split('?')[0]);
        //     const barcodeRef = ref(storage, barcodePath);
        //     try {
        //         console.log(`Attempting to delete file at path: ${barcodePath}`);
        //         await deleteObject(barcodeRef);
        //         console.log(`File deleted successfully at path: ${barcodePath}`);
        //     } catch (error) {
        //         console.error('Error deleting imageBarcode:', error);
        //     }
        // }

        // 5. Kirim respons sukses
        res.status(200).json({ message: 'Barang berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting barang:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus barang' });
    }
};
