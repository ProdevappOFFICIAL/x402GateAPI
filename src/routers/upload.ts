import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { utapi } from '../utils/upload';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload store icon
router.post('/store-icon', authenticateToken, upload.single('icon'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    // Convert buffer to File object for UploadThing
    const file = new File([req.file.buffer], req.file.originalname, {
      type: req.file.mimetype,
    });

    const response = await utapi.uploadFiles(file);

    if (response.error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: response.error.message
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        url: response.data.url,
        key: response.data.key,
        name: response.data.name,
        size: response.data.size
      }
    });
  } catch (error) {
    console.error('Upload store icon error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to upload icon'
      }
    });
  }
});

// Upload store banner
router.post('/store-banner', authenticateToken, upload.single('banner'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    // Convert buffer to File object for UploadThing
    const file = new File([req.file.buffer], req.file.originalname, {
      type: req.file.mimetype,
    });

    const response = await utapi.uploadFiles(file);

    if (response.error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: response.error.message
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        url: response.data.url,
        key: response.data.key,
        name: response.data.name,
        size: response.data.size
      }
    });
  } catch (error) {
    console.error('Upload store banner error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to upload banner'
      }
    });
  }
});

// Upload product images
router.post('/product-images', authenticateToken, upload.array('images', 5), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES',
          message: 'No files uploaded'
        }
      });
    }

    const files = req.files as Express.Multer.File[];
    
    // Convert buffers to File objects for UploadThing
    const uploadFiles = files.map(file => 
      new File([file.buffer], file.originalname, {
        type: file.mimetype,
      })
    );

    const responses = await utapi.uploadFiles(uploadFiles);

    // Check for any upload errors
    const failedUploads = responses.filter(response => response.error);
    if (failedUploads.length > 0) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: `Failed to upload ${failedUploads.length} file(s)`
        }
      });
    }

    const uploadedFiles = responses.map(response => ({
      url: response.data!.url,
      key: response.data!.key,
      name: response.data!.name,
      size: response.data!.size
    }));

    res.status(200).json({
      success: true,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length
      }
    });
  } catch (error) {
    console.error('Upload product images error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to upload product images'
      }
    });
  }
});

// Delete file
router.delete('/file/:fileKey', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { fileKey } = req.params;

    await utapi.deleteFiles(fileKey);

    res.status(200).json({
      success: true,
      data: {
        message: 'File deleted successfully'
      }
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete file'
      }
    });
  }
});

export default router;