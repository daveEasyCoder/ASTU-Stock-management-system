import multer from "multer";
import path from "path";
import fs from "fs";

const uploadImage = (folder) => {
    const uploadDir = `uploads/${folder}`;

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },

        filename: (req, file, cb) => {
            const uniqueName =
                `${Date.now()}-${Math.round(Math.random() * 1E9)}` +
                path.extname(file.originalname);

            cb(null, uniqueName);
        },
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error("Only JPEG, PNG, and WebP images are allowed."),
                false
            );
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5 MB
        },
    });
};

export default uploadImage;