import prisma from "../../../prisma/Config.js";
import { handleError } from "../../utils/errorHandler.js";

export const GetAllRuangan = async (req, res) => {
  try {
    const findAllRuangan = await prisma.ruangan.findMany({
      include: {
        inventaris: {
          include: { barang: true },
        },
      },
    });
    res.status(200).json({ data: findAllRuangan });
  } catch (error) {
    handleError(res, error);
  }
};
export const GetSingleRuangan = async (req, res) => {
  const { id } = req.params;

  try {
    const findOneRuangan = await prisma.ruangan.findUnique({
      where: { id: parseInt(id) },
      include: {
        inventaris: {
          include: { barang: true },
        },
        permintaan: {
          where: {
            status: true,
             
             
          },
          include: {
            barang: {
              include: {
                inventaris: true,
              },
            },
          },
        },
      },
    });

    if (!findOneRuangan) {
      return res.status(404).json({ message: "Ruangan tidak ditemukan" });
    }

   
    const permintaanGroupedByMonth = findOneRuangan.permintaan.reduce((acc, permintaan) => {
      const barangId = permintaan.barang.id;
      const month = new Date(permintaan.createdAt).toISOString().slice(0, 7); // Format YYYY-MM

      if (!acc[barangId]) {
        acc[barangId] = {};
      }

      if (!acc[barangId][month]) {
        acc[barangId][month] = {
          id: permintaan.id, 
          qty: 0, 
          status: permintaan.status,
          barangId: permintaan.barangId,
          ruanganId: permintaan.ruanganId,
          createdAt: permintaan.createdAt,
          updatedAt: permintaan.updatedAt,
          barang: permintaan.barang,
        };
      }

    
      acc[barangId][month].qty += permintaan.qty;

      return acc;
    }, {});

   
    const formattedPermintaan = Object.keys(permintaanGroupedByMonth).map(barangId => {
      return {
        barangId,
        months: Object.keys(permintaanGroupedByMonth[barangId]).map(month => ({
          month,
          permintaan: [permintaanGroupedByMonth[barangId][month]],
        })),
      };
    });

    res.status(200).json({
      data: {
        ...findOneRuangan,
        permintaan: formattedPermintaan,
      },
    });
  } catch (error) {
    
    handleError(res, error);
    
    
  }
};
