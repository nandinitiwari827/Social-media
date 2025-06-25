import multer from "multer"

let storage=multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "uploads/")
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + "-" + file.originalname)
    },
})

export let upload=multer({
    storage,
     limits: { fileSize: 500 * 1024 * 1024 }, 
})
