import prisma from "../../../prisma/Config.js";
import { handleError } from "../../utils/errorHandler.js";

export const GetAllInventaris = async (req, res) => {
    try {
        const findAllInventaris = await prisma.inventaris.findMany({
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
                        
                    }
                },
                ruangan: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
                
            },
        });
        
        res.status(200).json({ data: findAllInventaris });
    } catch (error) {
        handleError(res, error);
    }
};
