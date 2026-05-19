import "server-only";
import { z } from "zod";
import { getCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

/**
 * `cloudinaryMetadata` tool — fetches metadata for one captured image from the
 * Wanderlearn Cloudinary tenant.
 *
 * Fail-soft: with no `CLOUDINARY_URL`, or when the image id does not resolve,
 * it returns empty metadata rather than throwing.
 */

export const CloudinaryMetadataInputSchema = z.object({
  imageId: z.string().min(1),
});
export type CloudinaryMetadataInput = z.infer<
  typeof CloudinaryMetadataInputSchema
>;

export interface ImageMetadata {
  imageId: string;
  tags: string[];
  /** ISO timestamp the asset was created in Cloudinary, when available. */
  capturedAt: string | null;
  /** GPS, when the asset's metadata carries it. */
  location?: { lat: number; lng: number };
  dimensions: { width: number; height: number };
}

/** The slice of the Cloudinary resource response this tool reads. */
const CloudinaryResourceSchema = z.object({
  tags: z.array(z.string()).optional(),
  created_at: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

function emptyMetadata(imageId: string): ImageMetadata {
  return {
    imageId,
    tags: [],
    capturedAt: null,
    dimensions: { width: 0, height: 0 },
  };
}

export async function cloudinaryMetadata(
  input: CloudinaryMetadataInput,
): Promise<ImageMetadata> {
  const { imageId } = CloudinaryMetadataInputSchema.parse(input);

  if (!isCloudinaryConfigured()) {
    console.warn(
      "[cloudinaryMetadata] CLOUDINARY_URL not set — returning empty metadata.",
    );
    return emptyMetadata(imageId);
  }

  try {
    const resource: unknown = await getCloudinary().api.resource(imageId);
    const parsed = CloudinaryResourceSchema.safeParse(resource);
    if (!parsed.success) {
      console.error(
        `[cloudinaryMetadata] unexpected response shape for ${imageId}.`,
      );
      return emptyMetadata(imageId);
    }
    return {
      imageId,
      tags: parsed.data.tags ?? [],
      capturedAt: parsed.data.created_at ?? null,
      dimensions: {
        width: parsed.data.width ?? 0,
        height: parsed.data.height ?? 0,
      },
    };
  } catch (err) {
    console.error(`[cloudinaryMetadata] lookup failed for ${imageId}:`, err);
    return emptyMetadata(imageId);
  }
}
