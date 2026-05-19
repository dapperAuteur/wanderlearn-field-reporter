import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { getEnv } from "./env";

/**
 * Cloudinary client access.
 *
 * Cloudinary reads its credentials from the `CLOUDINARY_URL` connection string.
 * Configuration is lazy — a missing `CLOUDINARY_URL` never breaks module
 * import, so the agent still runs without it (PRD §16); the `cloudinaryMetadata`
 * tool degrades gracefully when it is unset.
 */

let configured = false;

/** The Cloudinary v2 client, configured from `CLOUDINARY_URL` on first use. */
export function getCloudinary(): typeof cloudinary {
  if (!configured) {
    if (getEnv().CLOUDINARY_URL) {
      cloudinary.config({ secure: true });
    }
    configured = true;
  }
  return cloudinary;
}

/** Whether Cloudinary credentials are present in the environment. */
export function isCloudinaryConfigured(): boolean {
  return Boolean(getEnv().CLOUDINARY_URL);
}
