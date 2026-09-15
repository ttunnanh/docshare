import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiFileText, FiSave, FiUploadCloud, FiX } from 'react-icons/fi';
import { getCategories } from '../services/categoryService';
import { uploadDocument } from '../services/documentService';

const MAX_SIZE = 20 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar'];

const readableSize = (bytes) => {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function Upload() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category_id: '' });
  const [file, setFile] = useState(null);
  const [busyMode, setBusyMode] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories()
      .then((items) => {
        setCategories(items);
        if (items[0]) setForm((current) => ({ ...current, category_id: String(items[0].id) }));
      })
      .catch(() => setError('Không thể tải danh mục. Hãy thử tải lại trang.'));
  }, []);

  const chooseFile = (selected) => {
    if (!selected) return;
    const extension = selected.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError('Định dạng file chưa được hỗ trợ.');
      setFile(null);
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError('File vượt quá giới hạn 20MB.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
  };

  const submit = async (event, mode = 'submit') => {
    event?.preventDefault();
    if (!file) return setError('Hãy chọn file tài liệu trước khi lưu.');
    if (form.title.trim().length < 3) return setError('Tiêu đề tối thiểu 3 ký tự.');

    setBusyMode(mode);
    setError('');
    const payload = new FormData();
    payload.append('title', form.title.trim());
    payload.append('description', form.description.trim());
    payload.append('category_id', form.category_id);
    payload.append('submission_mode', mode === 'draft' ? 'draft' : 'submit');
    payload.append('file', file);

    try {
      const result = await uploadDocument(payload);
      alert(result.message || (mode === 'draft' ? 'Đã lưu bản nháp.' : 'Đã gửi tài liệu chờ duyệt.'));
      navigate('/profile');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu tài liệu.');
    } finally {
      setBusyMode('');
    }
  };

  const busy = Boolean(busyMode);

  return (
    <main className="section shell upload-shell">
      <div className="page-title">
        <span className="eyebrow">Đóng góp cho cộng đồng</span>
        <h1>Đăng tài liệu mới</h1>
        <p>Lưu bản nháp để hoàn thiện sau hoặc gửi ngay vào hàng đợi kiểm duyệt trước khi công khai.</p>
      </div>

      <div className="upload-layout">
        <form className="panel form-stack upload-form" onSubmit={(event) => submit(event, 'submit')}>
          {error && <div className="alert error">{error}</div>}

          <div className="field-grid two">
            <label>
              Tiêu đề tài liệu
              <input
                className="input"
                value={form.title}
                maxLength={180}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Ví dụ: Giáo trình Mạng máy tính căn bản"
                required
              />
              <small className="field-hint">{form.title.length}/180 ký tự</small>
            </label>

            <label>
              Danh mục
              <select
                className="input"
                value={form.category_id}
                onChange={(event) => setForm({ ...form, category_id: event.target.value })}
                required
              >
                {categories.length === 0 && <option value="">Đang tải danh mục...</option>}
                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
          </div>

          <label>
            Mô tả
            <textarea
              className="input textarea"
              value={form.description}
              maxLength={5000}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Mô tả nội dung, môn học, đối tượng phù hợp hoặc những điểm nổi bật của tài liệu..."
            />
            <small className="field-hint">Mô tả rõ ràng giúp người học tìm đúng tài liệu nhanh hơn.</small>
          </label>

          <div
            className={dragging ? 'dropzone dragging' : 'dropzone'}
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              chooseFile(event.dataTransfer.files?.[0]);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
            <span className="dropzone-icon"><FiUploadCloud /></span>
            <strong>Kéo thả file vào đây hoặc nhấn để chọn</strong>
            <p>PDF, Word, Excel, PowerPoint, TXT, ZIP/RAR · tối đa 20MB</p>
          </div>

          {file && (
            <div className="selected-file">
              <span className="selected-file-icon"><FiFileText /></span>
              <div>
                <strong>{file.name}</strong>
                <small>{readableSize(file.size)}</small>
              </div>
              <FiCheckCircle className="file-ok" />
              <button type="button" className="file-remove" onClick={() => setFile(null)} title="Bỏ file"><FiX /></button>
            </div>
          )}

          <div className="upload-action-row">
            <button
              disabled={busy || !file || !categories.length}
              className="btn ghost"
              type="button"
              onClick={() => submit(null, 'draft')}
            >
              <FiSave /> {busyMode === 'draft' ? 'Đang lưu nháp...' : 'Lưu bản nháp'}
            </button>
            <button disabled={busy || !file || !categories.length} className="btn primary" type="submit">
              <FiUploadCloud /> {busyMode === 'submit' ? 'Đang gửi...' : 'Gửi chờ duyệt'}
            </button>
          </div>
        </form>

        <aside className="panel upload-guide">
          <span className="eyebrow">Trước khi đăng</span>
          <h3>Checklist học liệu tốt</h3>
          <div className="guide-item"><FiCheckCircle /><div><strong>Tiêu đề dễ hiểu</strong><p>Ghi rõ môn học hoặc chủ đề chính.</p></div></div>
          <div className="guide-item"><FiCheckCircle /><div><strong>Mô tả đủ thông tin</strong><p>Nêu nội dung và đối tượng phù hợp.</p></div></div>
          <div className="guide-item"><FiCheckCircle /><div><strong>File đúng định dạng</strong><p>Kiểm tra file mở được trước khi tải lên.</p></div></div>
          <div className="guide-item"><FiCheckCircle /><div><strong>Quy trình rõ ràng</strong><p>Bản nháp chỉ bạn và admin nhìn thấy; gửi duyệt khi nội dung đã sẵn sàng.</p></div></div>
          <div className="guide-item"><FiCheckCircle /><div><strong>Tôn trọng bản quyền</strong><p>Chỉ chia sẻ tài liệu bạn có quyền sử dụng.</p></div></div>
        </aside>
      </div>
    </main>
  );
}
