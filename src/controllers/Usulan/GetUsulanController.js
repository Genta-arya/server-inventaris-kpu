import prisma from "../../../prisma/Config.js";
import { handleError } from "../../utils/errorHandler.js";
import { getIndonesianDate } from "../Barang/BarangKeluar/GetBarangKeluarController.js";

export const getDataUsulan = async (req, res) => {
  let { date, status } = req.body;

  let usulan;
  if (status === "true") {
    status = "setuju";
  } else if (status === "false") {
    status = "tolak";
  } else if (status === "-") {
    status = "belum";
  }
  if (!date) {
    const today = getIndonesianDate();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    date = { gte: startOfDay, lt: endOfDay };
  } else {
    const specifiedDate = new Date(date);
    const startOfDay = new Date(specifiedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(specifiedDate.setHours(23, 59, 59, 999));

    date = { gte: startOfDay, lt: endOfDay };
  }

  try {
    if (status) {
      console.log("data yang dipilih:", status);
      usulan = await prisma.usulan.findMany({
        where: {
          status: status,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      usulan = await prisma.usulan.findMany({
        where: {
          createdAt: date,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    res.status(200).json({ data: usulan });
  } catch (error) {
    handleError(res, error);
  }
};

export const getSingleUsulan = async (req, res) => {
  const { id } = req.params;
  try {
    const usulan = await prisma.usulan.findUnique({
      where: {
        id: parseInt(id),
        status: "setuju",
      },
    });
    res.status(200).json({ data: usulan });
  } catch (error) {
    handleError(res, error);
  }
};
