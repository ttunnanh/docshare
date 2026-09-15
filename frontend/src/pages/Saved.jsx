import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookmark, FiSearch } from 'react-icons/fi';
import DocumentCard from '../components/DocumentCard';
import { downloadDocument, getSaved, toggleSave } from '../services/documentService';

export default function Saved() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setDocuments(await getSaved());
    } catch {
      setError('Không thể tải danh sách đã lưu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (id) => {
    try {
      await toggleSave(id);
      setDocuments((items) => items.filter((item) => item.id !== id));
    } catch (requestError) {
      alert(requestError.response?.data?.message || 'Không thể bỏ lưu tài liệu.');
    }
  };

  const handleDownload = async (id) => {
    try {
      const result = await downloadDocument(id);
      window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
      setDocuments((items) => items.map((item) => item.id === id
        ? { ...item, downloads: Number(item.downloads || 0) + 1 }
        : item));
    } catch (requestError) {
      alert(requestError.response?.data?.message || 'Không thể tải tài liệu.');
    }
  };

  return (
    <main className="section shell">
      <div className="page-title">
        <span className="eyebrow">Bộ sưu tập cá nhân</span>
        <h1>Tài liệu đã lưu</h1>
        <p>Lưu lại những học liệu quan trọng để quay lại bất cứ lúc nào.</p>
      </div>

      {loading ? (
        <div className="doc-grid">{Array.from({ length: 3 }).map((_, index) => <div className="doc-card skeleton-card" key={index} />)}</div>
      ) : error ? (
        <div className="state-card error">{error}</div>
      ) : documents.length ? (
        <div className="doc-grid">
          {documents.map((document) => (
            <DocumentCard key={document.id} doc={document} saved onSave={handleSave} onDownload={handleDownload} />
          ))}
        </div>
      ) : (
        <div className="state-card empty-state">
          <FiBookmark />
          <h3>Thư viện cá nhân đang trống</h3>
          <p>Khám phá học liệu và nhấn biểu tượng lưu để tạo bộ sưu tập của riêng bạn.</p>
          <Link className="btn primary small" to="/"><FiSearch /> Khám phá tài liệu</Link>
        </div>
      )}
    </main>
  );
}
