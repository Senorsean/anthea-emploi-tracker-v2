// Utilities for accessing the Pôle Emploi API
// The API key is expected to be provided via the VITE_POLE_EMPLOI_API_KEY
// environment variable defined in your .env file.

export const POLE_EMPLOI_API_KEY = import.meta.env.VITE_POLE_EMPLOI_API_KEY as string | undefined;

