import prisma from "../../../prisma/Config.js";
import { handleError } from "../../utils/errorHandler.js";
import path from "path";

import QRCode from "qrcode";
import { storage } from "../../Config/Firebase.js";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import formidable from "formidable";
import FormData from "form-data";
import fs from "fs";

import os from "os";
import { uploadProfile } from "../../Config/Uploads.js";
const BASE_URL = process.env.BASE_URL || "http://localhost:5001";
const URL_QR = "https://web-invetaris.vercel.app/";
// export const handlePostBarang = async (req, res) => {
//   const {
//     kodeBarang,
//     namaBarang,
//     nomorRegister,
//     merkType,
//     ukuran,
//     qty,
//     jenis,
//     hargaBarang,
//     kondisi,
//     perolehan,
//     ruanganId,
//   } = req.body;

//   const foto = req.file ? `${BASE_URL}/image/${req.file.filename}` : null;
//   const uploadedFilePath = req.file ? path.join('public', 'image', req.file.filename) : null;

//   try {

//     const newBarang = await prisma.barang.create({
//       data: {
//         kodeBarang,
//         namaBarang,
//         nomorRegister,
//         merkType,
//         ukuran,
//         jenis,
//         qty: parseInt(qty),
//         tahun: new Date().getFullYear(),
//         hargaBarang: parseInt(hargaBarang),
//         kondisi,
//         foto,
//         perolehan,

//         ...(ruanganId ? { ruanganId } : {}),
//       },
//     });

//     const imageFolderPath = path.join('public', 'image');

//     try {
//       await fs.access(imageFolderPath);
//     } catch (error) {

//       await fs.mkdir(imageFolderPath, { recursive: true });
//     }

//     const qrCodeData = `${URL_QR}/detail/${newBarang.id}`;
//     const qrCodeImage = await QRCode.toBuffer(qrCodeData, {
//       errorCorrectionLevel: 'H',
//       type: 'png',
//       width: 300,
//     });

//     const qrCodeImagePath = path.join(imageFolderPath,`${namaBarang}-${newBarang.id}.png`);
//     await fs.writeFile(qrCodeImagePath, qrCodeImage);

//     const qrCodeURL = `${BASE_URL}/image/${namaBarang}-${newBarang.id}.png`;
//     const updatedBarang = await prisma.barang.update({
//       where: { id: newBarang.id },
//       data: { imageBarcode: qrCodeURL },
//     });

//     res.status(201).json(updatedBarang);
//   } catch (error) {

//     if (uploadedFilePath) {
//       try {
//         await fs.unlink(uploadedFilePath);
//       } catch (unlinkError) {
//         console.error("Failed to delete uploaded file:", unlinkError);
//       }
//     }

//     handleError(res, error);
//   }
// };

export const handlePostBarang = async (req, res) => {
  const {
    kodeBarang,
    namaBarang,
    nomorRegister,
    merkType,
    ukuran,
    tahun,

    jenis,
    hargaBarang,
    kondisi,
    perolehan,
  } = req.body;

  if (!kodeBarang || !namaBarang || !hargaBarang || !kondisi || !perolehan) {
    return res
      .status(400)
      .json({ message: "Semua data harus diisi , coba lagi" });
  }

  const existingBarang = await prisma.barang.findFirst({
    where: {
      namaBarang: {
        equals: namaBarang.toLowerCase(),
      },
    },
  });

  if (existingBarang) {
    return res
      .status(400)
      .json({ message: "Nama barang sudah ada. Harap gunakan nama lain." });
  }

  let newBarang;
  let fotoURL = null;
  let qrCodeURL = null;
  try {
    // Buat barang baru di database
    newBarang = await prisma.barang.create({
      data: {
        kodeBarang,
        namaBarang,
        nomorRegister,
        merkType,
        ukuran,
        jenis,
        qty: 0,
        tahun: parseInt(tahun)|| new Date().getFullYear(),
        hargaBarang: parseInt(hargaBarang),
        kondisi,
        perolehan,
      },
    });

    // Upload foto ke Firebase Storage
    if (req.file && req.file.buffer) {
      const tempPath = path.join(os.tmpdir(), req.file.originalname);
      fs.writeFileSync(tempPath, req.file.buffer);
      const formData = new FormData();
      formData.append("file", fs.createReadStream(tempPath));

      const uploadResponse = await uploadProfile(formData);

      fotoURL = uploadResponse.data.file_url; // Pastikan respons mengandung URL yang valid
    }

    // Generate QR code
    const qrCodeData = `https://siaska.smkn2ketapang.sch.id/detail/${newBarang.id}`;
    const qrCodeImage = await QRCode.toBuffer(qrCodeData, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 300,
    });

    // Upload QR code ke penyimpanan eksternal
    const formDataQR = new FormData();
    formDataQR.append("file", qrCodeImage, `qrcode-${newBarang.id}.png`);

    const qrUploadResponse = await uploadProfile(formDataQR);
    qrCodeURL = qrUploadResponse.data.file_url;

    newBarang = await prisma.barang.update({
      where: { id: newBarang.id },
      data: { foto: fotoURL, imageBarcode: qrCodeURL },
    });

    res.status(201).json(newBarang);
  } catch (error) {
    // Jika ada kesalahan pada salah satu langkah, hapus data barang yang telah dibuat
    if (newBarang) {
      await prisma.barang.delete({
        where: { id: newBarang.id },
      });
    }
    // Tangani error dengan benar
    handleError(res, error);
  }
};

export const handleEditBarang = async (req, res) => {
  const {
    kodeBarang,
    namaBarang,
    nomorRegister,
    merkType,
    ukuran,
tahun,
    jenis,
    hargaBarang,
    kondisi,
    perolehan,
  } = req.body;

  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "id harus diisi" });
  }

  if (
    !kodeBarang ||
    !namaBarang ||
    !jenis ||
    !nomorRegister ||
    !merkType ||
    !ukuran ||
    !hargaBarang ||
    !kondisi ||
    !perolehan
  ) {
    return res.status(400).json({ message: "semua field harus diisi" });
  }

  try {
    const findItem = await prisma.barang.findFirst({
      where: {
        id: id,
      },
    });
    if (!findItem) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    const existingBarang = await prisma.barang.findFirst({
      where: {
        namaBarang: {
          equals: namaBarang.toLowerCase(),
        },
      },
    });

    console.log(id);
if (existingBarang && existingBarang.id !== id) {

      return res.status(400).json({
        message: "Nama barang sudah ada. Harap gunakan nama lain.",
      });
    }

    console.log("test", existingBarang);

    await prisma.barang.update({
      where: { id: id },
      data: {
        kodeBarang,
        namaBarang,
        nomorRegister,
        merkType,
        ukuran,
    tahun: parseInt(tahun),

        jenis,
        hargaBarang: parseInt(hargaBarang),
        kondisi,
        perolehan,
      },
    });

    res.status(200).json({ message: "Barang Berhasil diupdate" });
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
};
