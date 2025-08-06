import { handleError } from "../../utils/errorHandler.js";
import { getIndonesianDate } from "../Barang/BarangKeluar/GetBarangKeluarController.js";
import prisma from "./../../../prisma/Config.js";

export const getPermintaan = async (req, res) => {
  let { date } = req.body;
  console.log(date);

  if (!date) {
    const today = getIndonesianDate();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    date = { gte: startOfDay, lt: endOfDay };
  } else {
    const specifiedDate = new Date(date);
    const startOfDay = new Date(specifiedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(specifiedDate);
    endOfDay.setHours(23, 59, 59, 999);

    date = { gte: startOfDay, lt: endOfDay };
  }

  try {

    if (!date) {
      console.log("tidak ada tanggal");
      const permintaan = await prisma.permintaan.findMany({
        include: {
          barang: true,
          ruangan: true,
        },
      });
      return res.status(200).json({ data: permintaan });
    }
    const permintaan = await prisma.permintaan.findMany({
      where: {
        createdAt: date,
      },
      include: {
        barang: true,
        ruangan: true,
      },
    });

    return res.status(200).json({ data: permintaan });
  } catch (error) {
    handleError(res, error);
  }
};
