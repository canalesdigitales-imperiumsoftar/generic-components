import React from 'react';

interface ModalProps {
  modalMessageOpen: boolean;
  onClick: () => void;
  modalMessage: string;
}

export const ModalMessage: React.FC<ModalProps> = ({ modalMessageOpen, onClick, modalMessage }) => {
  if (!modalMessageOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
        <p className="mb-4 text-gray-800">{modalMessage}</p>
        <button onClick={onClick} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Cerrar
        </button>
      </div>
    </div>
  );
};