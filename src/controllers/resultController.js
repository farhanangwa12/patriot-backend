// controllers/resultController.js
export default class ResultController {
    constructor(resultService) {
        this.resultService = resultService;

        // binding supaya "this" tetap mengacu ke class
        this.getAllResults = this.getAllResults.bind(this);
        this.getResultById = this.getResultById.bind(this);
        this.deleteResult = this.deleteResult.bind(this);
    }

    // Ambil semua result
    async getAllResults(req, res, next) {
        try {

            const userId = req.user.id; // atau req.user.id (tergantung schema User)
          
            const results = await this.resultService.getAllResult(userId);
            return res.status(200).json({
                success: true,
                message: 'Berhasil mengambil semua result',
                data: results
            });
        } catch (error) {
            next(error);
        }
    }

    // Ambil result berdasarkan id
    async getResultById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this.resultService.getResultById(id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Result tidak ditemukan'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Berhasil mengambil result',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Hapus result berdasarkan id
    async deleteResult(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await this.resultService.deleteResult(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Result tidak ditemukan atau gagal dihapus'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Berhasil menghapus result'
            });
        } catch (error) {
            next(error);
        }
    }
}
