
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import api from '../api';

const NewGrave = () => {
  const modalHeaderColor = useTheme()?.style?.modalHeaderColor ?? "#8a63a6";
  const { closeModal, openModal } = useModal();
  const { isLoggedIn } = useAuth();
  
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    birth: '',
    death: '',
    block: '',
    epitaph: '',
    memorial: '',
    photo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await api.get('/blocks');
        setBlocks(res.data.blocks);
        if (res.data.blocks.length > 0) {
          setFormData(prev => ({ ...prev, block: res.data.blocks[0]._id }));
        }
      } catch (err) {
        console.error("Failed to load blocks", err);
        setError("Failed to load blocks.");
      } finally {
        setLoadingBlocks(false);
      }
    };
    fetchBlocks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const payload = {
      name: formData.name,
      birth: formData.birth,
      death: formData.death,
      block: formData.block,
      epitaph: formData.epitaph,
      memorial: formData.memorial,
      photos: formData.photo ? [formData.photo] : [],
    };

    try {
      await api.post('/grave', payload);
      setSuccess(true);
    } catch (err: any) {
      console.error("Failed to create grave. Detailed error:", err);
      setError(err.response?.data?.error || "Failed to create grave.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-w-[320px] min-h-[200px] gap-4 p-4">
        <h2 className="text-2xl font-bold" style={{ color: modalHeaderColor }}>
          Login Required
        </h2>
        <p className="text-gray-700 text-center font-medium">
          You must be logged in to create a new grave.
        </p>
        <div className="flex gap-6 mt-4">
          <button
            onClick={closeModal}
            className="header-icon-button inline-block px-4 py-2 text-lg font-bold"
          >
            Cancel
          </button>
          <button
            onClick={() => openModal(<Login />)}
            className="header-icon-button inline-block px-4 py-2 text-lg font-bold"
          >
            Login / Register
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-w-[320px] min-h-[200px] gap-4">
        <h2 className="text-2xl font-bold" style={{ color: modalHeaderColor }}>
          Creation Successful
        </h2>
        <p className="text-gray-700 text-center">
          The new grave has been added successfully.
        </p>
        <button
          onClick={closeModal}
          className="header-icon-button inline-block px-4 py-2 mt-4 text-lg font-bold"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-[90vw] md:w-[50vw] md:h-[55vh] max-w-4xl max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar">
        <h2 className="text-3xl font-extrabold text-center mb-6" style={{ color: modalHeaderColor }}>
          Add a new grave
        </h2>

        {error && <p className="text-red-600 text-sm font-bold text-center -mt-2">{error}</p>}

        <div className="flex items-center justify-between gap-8" style={{ color: modalHeaderColor }}>
          <label className="text-xl font-bold whitespace-nowrap" htmlFor="name">Name</label>
          <input
            id="name" name="name" type="text" required
            value={formData.name} onChange={handleChange}
            placeholder="Name"
            className="w-1/2 md:w-auto max-w-[50%] p-2 text-lg font-bold outline-none transition-colors bg-transparent border-[3px] rounded-md text-gray-800 text-center"
            style={{ borderColor: modalHeaderColor }}
          />
        </div>

        <div className="flex items-center justify-between gap-8" style={{ color: modalHeaderColor }}>
          <label className="text-xl font-bold whitespace-nowrap" htmlFor="birth">Birth</label>
          <input
            id="birth" name="birth" type="date" required
            value={formData.birth} onChange={handleChange}
            className="w-1/2 md:w-auto max-w-[50%] p-2 text-lg font-bold outline-none transition-colors bg-transparent border-[3px] rounded-md text-gray-800 text-center"
            style={{ borderColor: modalHeaderColor }}
          />
        </div>

        <div className="flex items-center justify-between gap-8" style={{ color: modalHeaderColor }}>
          <label className="text-xl font-bold whitespace-nowrap" htmlFor="death">Death</label>
          <input
            id="death" name="death" type="date" required
            value={formData.death} onChange={handleChange}
            className="w-1/2 md:w-auto max-w-[50%] p-2 text-lg font-bold outline-none transition-colors bg-transparent border-[3px] rounded-md text-gray-800 text-center"
            style={{ borderColor: modalHeaderColor }}
          />
        </div>

        <div className="flex items-center justify-between gap-8" style={{ color: modalHeaderColor }}>
          <label className="text-xl font-bold whitespace-nowrap" htmlFor="block">Block</label>
          <div className="relative flex items-center w-1/2 md:w-auto max-w-[50%]">
            <select
              id="block" name="block" required
              value={formData.block} onChange={handleChange}
              disabled={loadingBlocks}
              className="w-full p-2 pr-8 text-lg font-bold outline-none transition-colors bg-transparent border-[3px] rounded-md text-gray-800 text-center appearance-none"
              style={{ textAlignLast: 'center', borderColor: modalHeaderColor }}
            >
              {loadingBlocks ? (
                <option value="">Loading...</option>
              ) : (
                blocks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name || b.blockID}
                  </option>
                ))
              )}
            </select>
            <div className="absolute right-2 pointer-events-none flex items-center" style={{ color: modalHeaderColor }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between gap-8" style={{ color: modalHeaderColor }}>
          <label className="text-xl font-bold whitespace-nowrap mt-2" htmlFor="epitaph">Epitaph</label>
          <textarea
            id="epitaph" name="epitaph" rows={2}
            value={formData.epitaph} onChange={handleChange}
            placeholder="Epitaph"
            className="w-1/2 md:w-auto max-w-[50%] p-2 text-lg font-bold outline-none transition-colors resize-none bg-transparent border-[3px] rounded-md text-gray-800 text-left"
            style={{ borderColor: modalHeaderColor }}
          />
        </div>

        <div className="flex items-start justify-between gap-8" style={{ color: modalHeaderColor }}>
          <label className="text-xl font-bold whitespace-nowrap mt-2" htmlFor="memorial">Memorial</label>
          <textarea
            id="memorial" name="memorial" rows={3}
            value={formData.memorial} onChange={handleChange}
            placeholder="Memorial"
            className="w-1/2 md:w-auto max-w-[50%] p-2 text-lg font-bold outline-none transition-colors resize-none bg-transparent border-[3px] rounded-md text-gray-800 text-left"
            style={{ borderColor: modalHeaderColor }}
          />
        </div>

        <div className="flex items-center justify-between gap-8" style={{ color: modalHeaderColor }}>
          <label className="text-xl font-bold whitespace-nowrap" htmlFor="photo">Photo URL</label>
          <input
            id="photo" name="photo" type="url"
            value={formData.photo} onChange={handleChange}
            placeholder="https://..."
            className="w-1/2 md:w-auto max-w-[50%] p-2 text-lg font-bold outline-none transition-colors bg-transparent border-[3px] rounded-md text-gray-800 text-left"
            style={{ borderColor: modalHeaderColor }}
          />
        </div>

        <button
          type="submit"
          className="header-icon-button inline-block self-center px-6 py-3 mt-6 text-xl font-bold"
          disabled={loading || loadingBlocks}
        >
          {loading ? 'Creating...' : 'Create Grave'}
        </button>
      </form>
    </div>
  );
};

export default NewGrave;