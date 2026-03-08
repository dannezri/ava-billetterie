/**
 * Configuration Uploadcare
 * Gestion centralisée des paramètres d'upload de fichiers
 */

export const uploadcareConfig = {
  publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || '',
  
  // Contraintes de sécurité pour les billets PDF
  constraints: {
    maxFileSize: 5 * 1024 * 1024, // 5 MB en bytes
    allowedFileTypes: ['application/pdf'] as readonly string[],
    allowedExtensions: ['.pdf'] as readonly string[],
  },

  // Configuration du widget
  widget: {
    tabs: 'file', // Uniquement upload depuis device (pas URL, camera, etc.)
    multiple: false, // Un seul fichier à la fois
    clearable: true, // Permet de supprimer le fichier sélectionné
    previewStep: true, // Afficher un aperçu avant upload
    imagesOnly: false, // Autoriser les PDFs
    locale: 'fr', // Interface en français
  },

  // Messages d'erreur personnalisés
  errors: {
    fileSizeExceeded: 'Le fichier ne doit pas dépasser 5 MB',
    invalidFileType: 'Seuls les fichiers PDF sont acceptés',
    uploadFailed: 'Erreur lors de l\'upload. Veuillez réessayer.',
    virusScanFailed: 'Le fichier n\'a pas passé la vérification de sécurité',
  },

  // Configuration de sécurité
  security: {
    secureSignature: true, // Signature des requêtes
    secureExpire: 3600, // Expiration signature (1h)
    effects: 'preview', // Pas d'effets appliqués aux PDFs
  },
} as const;

/**
 * Validation côté client d'un fichier avant upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const { maxFileSize, allowedFileTypes } = uploadcareConfig.constraints;

  // Vérifier la taille
  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: uploadcareConfig.errors.fileSizeExceeded,
    };
  }

  // Vérifier le type MIME
  if (!allowedFileTypes.includes(file.type)) {
    return {
      valid: false,
      error: uploadcareConfig.errors.invalidFileType,
    };
  }

  // Vérifier l'extension
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!uploadcareConfig.constraints.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: uploadcareConfig.errors.invalidFileType,
    };
  }

  return { valid: true };
}

/**
 * Type pour les informations de fichier uploadé
 */
export interface UploadedFileInfo {
  uuid: string;
  name: string;
  size: number;
  mimeType: string;
  cdnUrl: string;
  originalUrl: string;
}

/**
 * Extraction des informations depuis le résultat Uploadcare
 */
export function extractFileInfo(fileInfo: any): UploadedFileInfo {
  return {
    uuid: fileInfo.uuid,
    name: fileInfo.name,
    size: fileInfo.size,
    mimeType: fileInfo.mimeType,
    cdnUrl: fileInfo.cdnUrl,
    originalUrl: fileInfo.originalUrl,
  };
}
