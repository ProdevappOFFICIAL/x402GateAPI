import { Router, Response } from "express";
import prisma from "../configs/database";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { createStoreSchema, updateStoreSchema } from "../middleware/schemas";
import { utapi, getFileKeyFromUrl } from "../utils/upload";

const router = Router();

// Create store
router.post(
  "/",
  authenticateToken,
  validate(createStoreSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { storeName, storeSlug, storeIcon, storeBanner, description } =
        req.body;
      const userId = req.user!.id;

      // Check if slug is already taken
      const existingStore = await prisma.store.findUnique({
        where: { slug: storeSlug },
      });

      if (existingStore) {
        return res.status(409).json({
          success: false,
          error: {
            code: "STORE_SLUG_TAKEN",
            message: "Store slug already exists",
          },
        });
      }

      // Validate uploaded image URLs if provided
      if (storeIcon && !storeIcon.startsWith("https://utfs.io/")) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ICON_URL",
            message: "Store icon must be uploaded through the upload endpoint",
          },
        });
      }

      if (storeBanner && !storeBanner.startsWith("https://utfs.io/")) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_BANNER_URL",
            message:
              "Store banner must be uploaded through the upload endpoint",
          },
        });
      }

      const store = await prisma.store.create({
        data: {
          name: storeName,
          slug: storeSlug,
          description,
          iconUrl: storeIcon,
          bannerUrl: storeBanner,
          ownerId: userId,
          settings: {
            currency: "SOL",
            language: "English",
            timezone: "UTC",
            theme: "light",
          },
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          description: store.description,
          icon: store.iconUrl,
          banner: store.bannerUrl,
          ownerId: store.ownerId,
          status: store.status.toLowerCase(),
          createdAt: store.createdAt,
        },
      });
    } catch (error) {
      console.error("Create store error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create store",
        },
      });
    }
  }
);

// Get user stores
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const stores = await prisma.store.findMany({
      where: { ownerId: userId },
      include: {
        products: {
          select: { id: true, status: true },
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            currency: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const storesWithStats = stores.map((store) => {
      const totalRevenue = store.orders
        .filter((order) => order.status === "COMPLETED")
        .reduce((sum, order) => sum + Number(order.totalAmount), 0);

      const totalOrders = store.orders.length;
      const totalProducts = store.products.length;

      return {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        revenue: totalRevenue.toString(),
        orders: totalOrders,
        products: totalProducts,
        status: store.status.toLowerCase(),
        icon: store.iconUrl || "🏪",
        createdAt: store.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      data: storesWithStats,
    });
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch stores",
      },
    });
  }
});

// Get store by slug (public route)
router.get("/:storeSlug",  async (req, res) => {
  try {
    const { storeSlug } = req.params;

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      include: {
        owner: {
          select: { walletAddress: true },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Store not found",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        icon: store.iconUrl,
        banner: store.bannerUrl,
        settings: store.settings,
        owner: {
          walletAddress: store.owner.walletAddress,
        },
      },
    });
  } catch (error) {
    console.error("Get store by slug error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch store",
      },
    });
  }
});

// Update store
router.put(
  "/:storeId",
  authenticateToken,
  validate(updateStoreSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { storeId } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;

      // Verify store ownership
      const store = await prisma.store.findFirst({
        where: {
          id: storeId,
          ownerId: userId,
        },
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Store not found or access denied",
          },
        });
      }

      // Validate uploaded image URLs if provided
      if (
        updateData.iconUrl &&
        !updateData.iconUrl.startsWith("https://utfs.io/")
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ICON_URL",
            message: "Store icon must be uploaded through the upload endpoint",
          },
        });
      }

      if (
        updateData.bannerUrl &&
        !updateData.bannerUrl.startsWith("https://utfs.io/")
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_BANNER_URL",
            message:
              "Store banner must be uploaded through the upload endpoint",
          },
        });
      }

      // Delete old images if new ones are provided
      if (
        updateData.iconUrl &&
        store.iconUrl &&
        store.iconUrl !== updateData.iconUrl
      ) {
        try {
          const oldIconKey = getFileKeyFromUrl(store.iconUrl);
          await utapi.deleteFiles(oldIconKey);
        } catch (error) {
          console.warn("Failed to delete old icon:", error);
        }
      }

      if (
        updateData.bannerUrl &&
        store.bannerUrl &&
        store.bannerUrl !== updateData.bannerUrl
      ) {
        try {
          const oldBannerKey = getFileKeyFromUrl(store.bannerUrl);
          await utapi.deleteFiles(oldBannerKey);
        } catch (error) {
          console.warn("Failed to delete old banner:", error);
        }
      }

      // Merge settings if provided
      const updatedSettings = updateData.settings
        ? { ...(store.settings as any), ...updateData.settings }
        : store.settings;

      const updatedStore = await prisma.store.update({
        where: { id: storeId },
        data: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.description !== undefined && {
            description: updateData.description,
          }),
          ...(updateData.iconUrl !== undefined && {
            iconUrl: updateData.iconUrl,
          }),
          ...(updateData.bannerUrl !== undefined && {
            bannerUrl: updateData.bannerUrl,
          }),
          settings: updatedSettings,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          id: updatedStore.id,
          name: updatedStore.name,
          slug: updatedStore.slug,
          description: updatedStore.description,
          icon: updatedStore.iconUrl,
          banner: updatedStore.bannerUrl,
          settings: updatedStore.settings,
          updatedAt: updatedStore.updatedAt,
        },
      });
    } catch (error) {
      console.error("Update store error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update store",
        },
      });
    }
  }
);

// Note: Analytics endpoint moved to /v1/stores/{storeId}/analytics in analytics.ts router

// Delete store
router.delete(
  "/:storeId",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { storeId } = req.params;
      const userId = req.user!.id;

      // Verify store ownership
      const store = await prisma.store.findFirst({
        where: {
          id: storeId,
          ownerId: userId,
        },
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Store not found or access denied",
          },
        });
      }

      // Delete associated images from UploadThing
      const filesToDelete = [];
      if (store.iconUrl) {
        filesToDelete.push(getFileKeyFromUrl(store.iconUrl));
      }
      if (store.bannerUrl) {
        filesToDelete.push(getFileKeyFromUrl(store.bannerUrl));
      }

      if (filesToDelete.length > 0) {
        try {
          await utapi.deleteFiles(filesToDelete);
        } catch (error) {
          console.warn("Failed to delete store images:", error);
        }
      }

      await prisma.store.delete({
        where: { id: storeId },
      });

      res.status(200).json({
        success: true,
        data: {
          message: "Store deleted successfully",
        },
      });
    } catch (error) {
      console.error("Delete store error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete store",
        },
      });
    }
  }
);

export default router;
