const errorMessages = JSON.parse(process.env.ERROR_MESSAGES);

class GeneralController {
    // [GET] /api/general
    show = async (req, res) => {
        try {
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: errorMessages.internalServerError,
            });
        }
    };
}
module.exports = new GeneralController();
