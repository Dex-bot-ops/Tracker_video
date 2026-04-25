import { useState, useRef, useCallback, type ChangeEvent } from 'react';
import type { Camera } from '../types';

/**
 * Propriétés du composant SourceSelector.
 * @interface Props
 * @property {Camera[]} cameras - Liste des caméras disponibles.
 * @property {(source: number | string | null) => void} onSelectSource - Fonction de rappel pour appliquer la nouvelle source (ID, chemin du fichier, ou null).
 * @property {boolean} disabled - Indique si la sélection est temporairement désactivée.
 */
interface Props {
  cameras: Camera[];
  onSelectSource: (source: number | string | null) => void;
  disabled: boolean;
}

/**
 * Composant permettant de choisir la source vidéo pour le tracker.
 * Gère une liste pré-chargée (caméras physiques) et l'upload de médias locaux (MP4).
 */
export const SourceSelector = ({ cameras, onSelectSource, disabled }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Gère les changements de sélection dans le menu déroulant.
   * Ouvre la boîte de dialogue d'upload, sélectionne aucune caméra, ou sélectionne un ID.
   * @param {ChangeEvent<HTMLSelectElement>} e - L'événement de changement HTML.
   */
  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val === 'upload') {
        fileInputRef.current?.click();
        // Réinitialise la valeur via la ref pour permettre de re-sélectionner
        if (selectRef.current) selectRef.current.value = '';
      } else if (val === 'none') {
        onSelectSource(null); // Envoi de "null" pour désactiver la caméra
      } else {
        onSelectSource(Number(val));
      }
    },
    [onSelectSource],
  );

  /**
   * Intercepte l'ajout d'un fichier vidéo et lance son analyse (upload vers le backend).
   * @async
   * @param {ChangeEvent<HTMLInputElement>} e - L'événement contenant le fichier MP4.
   */
  const handleFileUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.status === 'success') {
          onSelectSource(data.file_path); // Le backend nous renvoie "uploads/nomdufichier.mp4"
        } else {
          alert('Erreur: ' + data.message);
        }
      } catch (error) {
        console.error('Erreur réseau', error);
        alert('Serveur injoignable pour le transfert.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [onSelectSource],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <select
        ref={selectRef}
        className="btn-control"
        onChange={handleSelectChange}
        disabled={disabled || isUploading}
        defaultValue=""
        style={{ width: '100%' }}
      >
        <option value="" disabled>
          -- Choisir une source --
        </option>
        <option value="none">❌ Désactiver la caméra</option>
        {cameras.map((cam) => (
          <option key={cam.id} value={cam.id}>
            {cam.name}
          </option>
        ))}
        <option value="upload">📁 Importer un format MP4...</option>
      </select>

      <input
        type="file"
        accept="video/mp4"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      {isUploading && (
        <span style={{ fontSize: '0.8rem', color: '#e9730c', fontWeight: 'bold' }}>
          Upload en cours...
        </span>
      )}
    </div>
  );
};
