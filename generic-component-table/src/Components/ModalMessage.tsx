
interface ModalMessageProps {
  modalMessageOpen: boolean;
  onClick: (data: any) => void;
  modalMessage: string;
}

export const ModalMessage : React.FC<ModalMessageProps> = ({
  modalMessageOpen,
  onClick,
  modalMessage,
}) => {
  console.log(modalMessage);
  return(
    <>
    {modalMessageOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm text-center">
        <h3 className="text-lg font-semibold mb-4 text-black">{modalMessage}</h3>
        <button
          onClick={onClick}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Aceptar
        </button>
      </div>
    </div>
  )}
    </>
  );
}
