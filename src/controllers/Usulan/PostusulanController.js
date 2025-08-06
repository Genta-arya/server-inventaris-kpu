import prisma from "../../../prisma/Config.js";
import { handleError } from "../../utils/errorHandler.js";

export const PostUsul = async (req, res) => {
  const { data  } = req.body;
 const { namaBarang , unit , nama } = data
  console.log("Received data:", req.body);
  if (!namaBarang || !unit || !nama) {
    return res
      .status(400)
      .json({ message: "Semua data harus diisi , coba lagi" });
  }
  try {
    const newUsul = await prisma.usulan.create({
      data: {
        namaBarang,
        unit,
        nama,
        status: "belum",
      },
    });
    return res.status(200).json({
      message: "Usulan Berhasil ditambahkan",
      data: newUsul,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateStatusUsulan = async (req, res) => {
  const { id } = req.params;
  let { status } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Id is required" });
  }
  if (!status) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (status === "true") {
    status = "setuju";
  } else if (status === "false") {
    status = "tolak";
  } else if (status === "-") {
    status = "belum";
  }
  try {
    const updateUsul = await prisma.usulan.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status,
      },
    });
    return res.status(200).json({
      message: "Usulan Berhasil ditambahkan",
      data: updateUsul,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateNamaBarang = async (req, res) => {
  const { id } = req.params;
  const { namaBarang   } = req.body;
  if (!id ) {
    return res.status(400).json({ message: "Lengkapi semua form" });
  }
  if (!namaBarang) {
    return res.status(400).json({ message: "Semua Form Harus diisi" });
  }
  try {
    const updateUsul = await prisma.usulan.update({
      where: {
        id: parseInt(id),
      },
      data: {
        namaBarang,
      

      },
    });
    return res.status(200).json({
      message: "Usulan Berhasil ditambahkan",
      data: updateUsul,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteUsul = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Id is required" });
  }
  try {
    const deleteUsul = await prisma.usulan.delete({
      where: {
        id: parseInt(id),
      },
    });
    return res.status(200).json({
      message: "Usulan Berhasil dihapus",
      data: deleteUsul,
    });
  } catch (error) {
    handleError(res, error);
  }
};
