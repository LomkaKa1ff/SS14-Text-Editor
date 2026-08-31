import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://ss14-api.unitone.app';

const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

const TRANSLATIONS = {
  ru: {
    placeholder: "Начни писать свой отчет здесь...",
    bold: "Жирный",
    italic: "Курсив",
    underline: "Подчеркнутый",
    colorTitle: "Цвет",
    monoTitle: "Моноширинный шрифт (Mono)",
    listTitle: "Список",
    formatTitle: "Формат",
    normalText: "Текст",
    heading1: "Заг. 1",
    heading2: "Заг. 2",
    heading3: "Заг. 3",
    templates: "Шаблоны",
    empty: "Пустой бланк",
    interrogation: "Допрос (СБ)",
    medical: "Мед. карта",
    cargo: "Заказ Карго",
    importBtn: "📥 ИМПОРТ",
    importTitle: "ВСТАВЬТЕ ВАШ КОД",
    importPrompt: "Вставьте скопированный код SS14 ниже:",
    importPlaceholder: "[head=1]КОНФИДЕНЦИАЛЬНО[/head]\n[bold]Тема:[/bold]...",
    importCancel: "ОТМЕНА",
    importSubmit: "ЗАГРУЗИТЬ",
    importSuccess: "КОД УСПЕШНО ИМПОРТИРОВАН!",
    copyBtn: "📋 КОПИЯ",
    alertCopy: "КОД УСПЕШНО СКОПИРОВАН В БУФЕР!",
    statusStable: "СВЯЗЬ С ЦК: СТАБИЛЬНА",
    autosaveLabel: "ЛОКАЛЬНАЯ ЗАЩИТА:",
    autosaveStatus: "АКТИВНА",
    chars: "СИМВОЛЫ",
    tplInterrogation: "<b>БЛАНК ДОПРОСА</b><br><br><b>Имя подозреваемого:</b><br><b>Должность:</b><br><b>Причина задержания:</b><br><br><b>Ход допроса:</b><br><br><i>Подпись офицера СБ:</i>",
    tplMedical: "<b>МЕДИЦИНСКОЕ ЗАКЛЮЧЕНИЕ</b><br><br><b>Пациент:</b><br><b>Диагноз:</b><br><b>Назначенное лечение:</b><br><br><i>Подпись Главного Врача:</i>",
    tplCargo: "<b>ЗАЯВКА НА СНАБЖЕНИЕ</b><br><br><b>Отдел:</b><br><b>Запрашиваемые предметы:</b><br><br><i>Подпись Квартермейстера:</i>",
    tplInterrogationPreview: "БЛАНК ДОПРОСА\nИмя:\nПричина:",
    tplMedicalPreview: "МЕД. ЗАКЛЮЧЕНИЕ\nПациент:\nДиагноз:",
    tplCargoPreview: "ЗАЯВКА НА СНАБЖЕНИЕ\nОтдел:\nПредметы:",
    loginBtn: "ВОЙТИ",
    loginRequired: "ТРЕБУЕТСЯ АВТОРИЗАЦИЯ!",
    loginPromptDashboard: "Авторизуйтесь через SS14, чтобы завести собственную папку с отчетами.",
    authSuccess: "АВТОРИЗАЦИЯ УСПЕШНА",
    myDocs: "ПАПКА",
    terms: "Условия использования",
    privacy: "Политика конфиденциальности",
    cookies: "Информация о Cookies",
    logoutBtn: "ВЫЙТИ",
    logoutSuccess: "Вы успешно вышли из аккаунта",
    createDocHeader: "СОЗДАТЬ ДОКУМЕНТ",
    savedDocsHeader: "СОХРАНЕННЫЕ ДОКУМЕНТЫ",
    docCountUnit: "ДОК.",
    emptyDocsMsg: "У вас пока нет сохраненных бумаг",
    deleteTooltip: "Удалить",
    authCallbackTitle: "Авторизация через SS14...",
    authCallbackDesc: "Обработка ответа сервера...",
    authSuccessToast: "Успешная авторизация!",
    authErrorToast: "Ошибка авторизации",
    serverErrorToast: "Ошибка соединения с сервером",
    ss14LoginErrorToast: "Ошибка входа через SS14",
    saveBtn: "💾 СОХР.",
    saveModalTitle: "СОХРАНЕНИЕ ДОКУМЕНТА",
    saveModalPrompt: "ВВЕДИТЕ НАЗВАНИЕ ДОКУМЕНТА",
    saveModalPlaceholder: "Например: Отчет о допросе клоуна",
    saveModalSubmit: "СОХРАНИТЬ В БАЗУ",
    deleteModalTitle: "ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ",
    deleteModalPrompt: "Вы действительно хотите удалить этот документ?",
    deleteModalSubtext: "Это действие невозможно отменить, данные будут стираться из базы данных.",
    deleteModalSubmit: "УДАЛИТЬ",
    deleteSuccessToast: "Документ успешно удален!",
    deleteErrorToast: "Ошибка при удалении документа",
    renameTooltip: "Переименовать",
    renameModalTitle: "ПЕРЕИМЕНОВАНИЕ ДОКУМЕНТА",
    renameModalPrompt: "ВВЕДИТЕ НОВОЕ НАЗВАНИЕ",
    renameModalPlaceholder: "Например: Отчет о допросе клоуна v2",
    renameModalSubmit: "СОХРАНИТЬ",
    renameSuccessToast: "Название документа успешно обновлено!",
    renameErrorToast: "Ошибка при переименовании документа",
    limitReachedToast: "Достигнут лимит (максимум 50 документов)!",
  },
  en: {
    placeholder: "Start writing your report here...",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    colorTitle: "Color",
    monoTitle: "Monospace",
    listTitle: "List",
    formatTitle: "Format",
    normalText: "Text",
    heading1: "Head 1",
    heading2: "Head 2",
    heading3: "Head 3",
    templates: "Templates",
    empty: "Blank Template",
    interrogation: "Interrogation",
    medical: "Medical",
    cargo: "Cargo Order",
    importBtn: "📥 IMPORT",
    importTitle: "IMPORT YOUR CODE",
    importPrompt: "Paste your SS14 code below:",
    importPlaceholder: "[head=1]CONFIDENTIAL[/head]\n[bold]Subject:[/bold]...",
    importCancel: "CANCEL",
    importSubmit: "LOAD",
    importSuccess: "CODE SUCCESSFULLY IMPORTED!",
    copyBtn: "📋 COPY",
    alertCopy: "CODE SUCCESSFULLY COPIED TO CLIPBOARD!",
    statusStable: "CC CONNECTION: STABLE",
    autosaveLabel: "LOCAL PROTECTION:",
    autosaveStatus: "ACTIVE",
    chars: "CHARS",
    tplInterrogation: "<b>INTERROGATION FORM</b><br><br><b>Suspect Name:</b><br><b>Job Title:</b><br><b>Reason for Detention:</b><br><br><b>Interrogation Log:</b><br><br><i>Security Officer Signature:</i>",
    tplMedical: "<b>MEDICAL REPORT</b><br><br><b>Patient:</b><br><b>Diagnosis:</b><br><b>Prescribed Treatment:</b><br><br><i>Chief Medical Officer Signature:</i>",
    tplCargo: "<b>CARGO ORDER REQUEST</b><br><br><b>Department:</b><br><b>Requested Items:</b><br><br><i>Quartermaster Signature:</i>",
    tplInterrogationPreview: "INTERROGATION FORM\nName:\nReason:",
    tplMedicalPreview: "MEDICAL REPORT\nPatient:\nDiagnosis:",
    tplCargoPreview: "SUPPLY REQUEST\nDept:\nItems:",
    loginBtn: "LOG IN",
    loginRequired: "LOGIN REQUIRED!",
    loginPromptDashboard: "Log in via SS14 to manage your personal document folder.",
    authSuccess: "LOGIN SUCCESSFUL",
    myDocs: "FOLDER",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    cookies: "Cookie Info",
    logoutBtn: "LOG OUT",
    logoutSuccess: "You have successfully logged out",
    createDocHeader: "CREATE DOCUMENT",
    savedDocsHeader: "SAVED DOCUMENTS",
    docCountUnit: "DOCS",
    emptyDocsMsg: "You don't have any saved documents yet",
    deleteTooltip: "Delete",
    authCallbackTitle: "Authorizing via SS14...",
    authCallbackDesc: "Processing server response...",
    authSuccessToast: "Successful authorization!",
    authErrorToast: "Authorization error",
    serverErrorToast: "Server connection error",
    ss14LoginErrorToast: "Error logging in via SS14",
    saveBtn: "💾 SAVE",
    saveModalTitle: "SAVE DOCUMENT",
    saveModalPrompt: "ENTER DOCUMENT TITLE",
    saveModalPlaceholder: "e.g., Clown Interrogation Log",
    saveModalSubmit: "SAVE TO DATABASE",
    deleteModalTitle: "DELETE CONFIRMATION",
    deleteModalPrompt: "Are you sure you want to delete this document?",
    deleteModalSubtext: "This action cannot be undone, data will be erased from database.",
    deleteModalSubmit: "DELETE",
    deleteSuccessToast: "Document successfully deleted!",
    deleteErrorToast: "Error deleting document",
    renameTooltip: "Rename",
    renameModalTitle: "RENAME DOCUMENT",
    renameModalPrompt: "ENTER NEW TITLE",
    renameModalPlaceholder: "e.g., Clown Interrogation Log v2",
    renameModalSubmit: "SAVE",
    renameSuccessToast: "Document title successfully updated!",
    renameErrorToast: "Error renaming document",
    limitReachedToast: "Document limit reached (max 50 documents)!",
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [showClown, setShowClown] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const [lang, setLang] = useState(() => localStorage.getItem('ss14_paper_lang') || 'en');
  const t = TRANSLATIONS[lang];
  const MAX_CHARS = 4000;

  const navigate = useNavigate();
  const location = useLocation();

  const [showCookieModal, setShowCookieModal] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage({ text: message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUsername = localStorage.getItem('username');
    if (!token) return;

    if (savedUsername) {
      setUser({ username: savedUsername });
    }

    fetchWithAuth(`${API_URL}/api/auth/me`)
        .then(res => res.json())
        .then(data => {
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else if (!data.authenticated && !savedUsername) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('username');
            setUser(null);
          }
        })
        .catch(err => console.error('Authorization check error:', err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFolderClick = () => {
    if (!user) {
      showToast(t.loginRequired, 'error');
      return;
    }
    if (location.pathname === '/dashboard') {
      navigate('/');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSS14Login = () => {
    window.location.href = `${API_URL}/api/auth/login`;
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    setUser(null);
    showToast(t.logoutSuccess);
    if (location.pathname === '/dashboard') {
      navigate('/');
    }
  };

  useEffect(() => {
    const clownInterval = setInterval(() => {
      setShowClown(true);
      setTimeout(() => setShowClown(false), 8000);
    }, 600000);
    return () => clearInterval(clownInterval);
  }, []);

  useEffect(() => {
    localStorage.setItem('ss14_paper_lang', lang);
  }, [lang]);

  return (
      <div className="main-layout">
        <header className="app-header">
          <div
              onClick={() => navigate('/')}
              className="header-left logo-link"
              style={{ cursor: 'pointer' }}
          >
            <img src="https://spacestation14.com/images/main/icon.png" alt="SS14 Logo" className="app-logo" />
            <div className="brand-text">
              <span className="brand-company">PAPERWORK</span>
              <span className="brand-product">TEXT EDITOR</span>
            </div>
          </div>
          <div className="header-right">
            <select className="station-tag lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>

            <button
                className={`btn-header ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={handleFolderClick}
                title={t.myDocs}
            >
              📁 {t.myDocs}
            </button>

            {!user ? (
                <button className="btn-header btn-login" onClick={handleSS14Login}>
                  {t.loginBtn}
                </button>
            ) : (
                <div className="user-menu-wrapper" ref={userMenuRef}>
                  <button
                      className={`btn-header btn-user ${showUserMenu ? 'active' : ''}`}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <span className="user-dot"></span>
                    {user.username}
                    <span className="dropdown-arrow">{showUserMenu ? '▲' : '▼'}</span>
                  </button>

                  {showUserMenu && (
                      <div className="user-dropdown-menu">
                        <button className="user-dropdown-item logout" onClick={handleLogout}>
                          {t.logoutBtn}
                        </button>
                      </div>
                  )}
                </div>
            )}
          </div>
        </header>

        <main className={`app-container ${lang === 'ru' ? 'lang-ru' : ''}`}>
          <Routes>
            <Route path="/" element={<EditorView t={t} lang={lang} user={user} showToast={showToast} setCharCount={setCharCount} />} />
            <Route path="/doc/:id" element={<EditorView t={t} lang={lang} user={user} showToast={showToast} setCharCount={setCharCount} />} />
            <Route path="/dashboard" element={<DashboardView t={t} user={user} showToast={showToast} />} />
            <Route path="/auth/callback" element={<AuthCallbackView t={t} showToast={showToast} setUser={setUser} />} />
            <Route path="*" element={<EditorView t={t} lang={lang} user={user} showToast={showToast} setCharCount={setCharCount} />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="footer-top">
            <div className="footer-status">
              <span className="blink-dot"></span> {t.statusStable}
              <span className="footer-divider">|</span>
              <span>{t.autosaveLabel} <strong className="status-green">{t.autosaveStatus}</strong></span>
              <span className="footer-divider">|</span>
              <span className="footer-version">v1.3</span>
            </div>

            <div className={`footer-chars ${charCount > MAX_CHARS ? 'warning' : ''}`}>
              {t.chars}: {charCount} / {MAX_CHARS}
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-socials">
              <a
                  href="https://github.com/lomkaka1ff/SS14-Text-Editor"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                  title="GitHub"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GITHUB</span>
              </a>
            </div>

            <div className="footer-policies">
              <span className="footer-divider"></span>
              <a
                  href="#cookies"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowCookieModal(true);
                  }}
              >
                {t.cookies}
              </a>
            </div>
          </div>

          {showCookieModal && (
              <div className="nt-modal-overlay" onClick={() => setShowCookieModal(false)}>
                <div className="nt-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                  <div className="nt-modal-header">COOKIE POLICY</div>
                  <div className="nt-modal-body">
                    <p style={{ margin: 0, color: '#e0e0e0', fontSize: '18px', lineHeight: '1.4' }}>
                      We use essential cookies for user authorization (SS14 OAuth) and Yandex Metrica for anonymous usage statistics.
                      We don't see your work here and it's only for better UX. By using this site, you agree to our use of cookies.
                    </p>
                  </div>
                  <div className="nt-modal-footer">
                    <button
                        className="nt-modal-btn submit"
                        onClick={() => setShowCookieModal(false)}
                    >
                      GOT IT
                    </button>
                  </div>
                </div>
              </div>
          )}
        </footer>

        {toastMessage && (
            <div className={`nt-toast ${toastMessage.type === 'error' ? 'error' : ''}`}>
              <div className="nt-toast-text">{toastMessage.text}</div>
            </div>
        )}

        <div className={`clown-secret-message ${showClown ? 'active' : ''}`}>
          <img src="https://i.redd.it/6j0xclcoqs861.png" alt="Clown" className="clown-sprite" />
          <div className="clown-speech-bubble">
            For feedback write <b>komkalive</b> on Discord! Honk!
          </div>
        </div>
      </div>
  );
}

function EditorView({ t, lang, user, showToast, setCharCount }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = useRef(null);
  const [textColor, setTextColor] = useState('#000000');
  const [currentFormat, setCurrentFormat] = useState('p');
  const [docTitle, setDocTitle] = useState('Untitled Document');

  const [showImportModal, setShowImportModal] = useState(false);
  const [importInput, setImportInput] = useState("");

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitleInput, setSaveTitleInput] = useState("");

  const updateCount = () => {
    if (editorRef.current) {
      setCharCount(editorRef.current.innerText.length);
    }
  };

  const saveContentLocally = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    updateCount();
    localStorage.setItem(id ? `ss14_paper_draft_${id}` : 'ss14_paper_save', html);
  };

  useEffect(() => {
    if (id) {
      fetchWithAuth(`${API_URL}/api/documents/${id}`)
          .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then(data => {
            setDocTitle(data.title || 'Untitled Document');
            if (editorRef.current) {
              const localDraft = localStorage.getItem(`ss14_paper_draft_${id}`);
              editorRef.current.innerHTML = localDraft || data.content || '';
              updateCount();
            }
          })
          .catch(() => {
            showToast('Failed to download document from server', 'error');
          });
    } else {
      const suggestedTitle = location.state?.initialTitle;
      if (suggestedTitle) {
        setDocTitle(suggestedTitle);
      }

      const saved = localStorage.getItem('ss14_paper_save');
      if (saved && editorRef.current) {
        editorRef.current.innerHTML = saved;
        updateCount();
      } else if (editorRef.current) {
        editorRef.current.innerHTML = t.placeholder;
      }
    }
  }, [id, lang, location.state, t.placeholder]);

  const handleSaveButtonClick = () => {
    if (!user) {
      showToast(t.loginRequired, 'error');
      return;
    }
    setSaveTitleInput(docTitle === 'Untitled Document' ? '' : docTitle);
    setShowSaveModal(true);
  };

  const handleSaveModalSubmit = async () => {
    const finalTitle = saveTitleInput.trim() || 'Untitled Document';
    const contentHtml = editorRef.current ? editorRef.current.innerHTML : '';

    try {
      const res = await fetchWithAuth(`${API_URL}/api/documents`, {
        method: 'POST',
        body: JSON.stringify({
          title: finalTitle,
          content: contentHtml,
          type: 'custom'
        })
      });

      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok) {
        localStorage.removeItem('ss14_paper_save');
        setShowSaveModal(false);
        showToast('Document was saved successfully!');
        navigate(`/doc/${data._id || data.id}`);
      } else {
        showToast(data.error || (res.status === 401 ? t.loginRequired : 'Failed to save document'), 'error');
      }
    } catch (err) {
      console.error('Save document error:', err);
      showToast('Server connection error', 'error');
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    saveContentLocally();
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setTextColor(newColor);
    formatText('foreColor', newColor);
  };

  const handleFormatBlock = (tag) => {
    document.execCommand('formatBlock', false, tag);
    setCurrentFormat(tag.toLowerCase());
    editorRef.current.focus();
    saveContentLocally();
  };

  const formatMono = () => {
    document.execCommand('fontName', false, 'monospace');
    editorRef.current.focus();
    saveContentLocally();
  };

  const handleSelectionChange = () => {
    if (!editorRef.current) return;

    let node = document.getSelection().anchorNode;
    let format = 'p';
    while (node && node !== editorRef.current) {
      if (node.nodeType === 1) {
        const tagName = node.tagName.toLowerCase();
        if (['h1', 'h2', 'h3'].includes(tagName)) {
          format = tagName;
          break;
        }
      }
      node = node.parentNode;
    }
    setCurrentFormat(format);
  };

  const rgbToHex = (rgbString) => {
    const rgb = rgbString.match(/\d+/g);
    if (!rgb || rgb.length < 3) return "#000000";
    return "#" + ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1).toUpperCase();
  };

  const generateSS14Code = () => {
    if (!editorRef.current) return "";

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorRef.current.innerHTML;

    tempDiv.querySelectorAll('font[color]').forEach(el => {
      el.outerHTML = `[color=${el.getAttribute('color')}]${el.innerHTML}[/color]`;
    });

    let currentHtml = tempDiv.innerHTML;

    currentHtml = currentHtml.replace(/<span[^>]+style=["'](?:[^"']*;\s*)?color:\s*([^;"']+)["'][^>]*>(.*?)<\/span>/gi, (m, color, content) =>
        `[color=${color.startsWith('rgb') ? rgbToHex(color) : color}]${content}[/color]`);

    currentHtml = currentHtml.replace(/<span[^>]*style=["'][^"']*font-family:\s*monospace[^"']*["'][^>]*>(.*?)<\/span>/gi, '[mono]$1[/mono]');
    currentHtml = currentHtml.replace(/<font[^>]*face=["']?monospace["']?[^>]*>(.*?)<\/font>/gi, '[mono]$1[/mono]');

    currentHtml = currentHtml.replace(/<li[^>]*>(.*?)<\/li>/gi, '\n[bullet]$1[/bullet]');
    currentHtml = currentHtml.replace(/<ul[^>]*>|<\/ul>/gi, '');
    currentHtml = currentHtml.replace(/<h([1-3])[^>]*>(.*?)<\/h\1>/gi, '\n[head=$1]$2[/head]\n');

    currentHtml = currentHtml
        .replace(/<(b|strong)>(.*?)<\/\1>/gi, '[bold]$2[/bold]')
        .replace(/<(i|em)>(.*?)<\/\1>/gi, '[italic]$2[/italic]')
        .replace(/<u>(.*?)<\/u>/gi, '[underline]$1[/underline]');

    currentHtml = currentHtml.replace(/\[(bold|italic|underline)\]\s*\[\/\1\]/gi, '');

    currentHtml = currentHtml
        .replace(/<div><br><\/div>/gi, '\n')
        .replace(/<div>(.*?)<\/div>/gi, '\n$1')
        .replace(/<p>(.*?)<\/p>/gi, '\n$1')
        .replace(/<br\s*[\/]?>/gi, '\n');

    currentHtml = currentHtml.replace(/\n\s*\n\s*\n/g, '\n\n');

    const finalDiv = document.createElement('div');
    finalDiv.innerHTML = currentHtml;
    return finalDiv.textContent.trim();
  };

  const parseSS14ToHTML = (rawText) => {
    let html = rawText.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    html = html.replace(/\[bold\]([\s\S]*?)\[\/bold\]/gi, '<b>$1</b>');
    html = html.replace(/\[italic\]([\s\S]*?)\[\/italic\]/gi, '<i>$1</i>');
    html = html.replace(/\[underline\]([\s\S]*?)\[\/underline\]/gi, '<u>$1</u>');
    html = html.replace(/\[color=(.*?)\]([\s\S]*?)\[\/color\]/gi, '<span style="color: $1;">$2</span>');
    html = html.replace(/\[mono\]([\s\S]*?)\[\/mono\]/gi, '<span style="font-family: monospace;">$1</span>');
    html = html.replace(/\[head=([1-3])\]([\s\S]*?)\[\/head\]/gi, '<h$1>$2</h$1>');

    html = html.replace(/\[bullet\]([\s\S]*?)\[\/bullet\]/gi, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>(\s*<li>[\s\S]*?<\/li>)*)/gi, '<ul>$1</ul>');

    html = html.replace(/\[\/?(bold|italic|underline|mono|bullet|color|head)[^\]]*\]/gi, '');

    html = html.replace(/\n/g, '<br>');
    html = html.replace(/<br>\s*<h/gi, '<h');
    html = html.replace(/<\/h([1-3])>\s*<br>/gi, '</h$1>');
    html = html.replace(/<br>\s*<ul/gi, '<ul');
    html = html.replace(/<\/ul>\s*<br>/gi, '</ul>');

    return html;
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text/plain');

    const hasSS14Tags = /\[\/?(bold|italic|underline|color|mono|bullet|head)[^\]]*\]/i.test(pastedText);

    if (hasSS14Tags) {
      const formattedHTML = parseSS14ToHTML(pastedText);
      document.execCommand('insertHTML', false, formattedHTML);
    } else {
      const plainHtml = pastedText
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>');
      document.execCommand('insertHTML', false, plainHtml);
    }
    saveContentLocally();
  };

  const handleImportSubmit = () => {
    if (!importInput.trim()) {
      setShowImportModal(false);
      return;
    }

    const html = parseSS14ToHTML(importInput);

    if (editorRef.current) {
      editorRef.current.innerHTML = html;
      saveContentLocally();
      showToast(t.importSuccess);
    }

    setShowImportModal(false);
    setImportInput("");
  };

  const handleImportCancel = () => {
    setShowImportModal(false);
    setImportInput("");
  };

  const copyToClipboard = () => {
    const ss14Code = generateSS14Code();
    navigator.clipboard.writeText(ss14Code);
    showToast(t.alertCopy);
  };

  const loadTemplate = (e) => {
    const templateKey = e.target.value;
    if (!templateKey || !editorRef.current) return;
    if (templateKey === 'empty') editorRef.current.innerHTML = "";
    else if (templateKey === 'interrogation') editorRef.current.innerHTML = t.tplInterrogation;
    else if (templateKey === 'medical') editorRef.current.innerHTML = t.tplMedical;
    else if (templateKey === 'cargo') editorRef.current.innerHTML = t.tplCargo;
    saveContentLocally();
    e.target.value = "";
  };

  return (
      <>
        <div className="toolbar">
          <button onClick={() => formatText('bold')} title={t.bold}><b>B</b></button>
          <button onClick={() => formatText('italic')} title={t.italic}><i>I</i></button>
          <button onClick={() => formatText('underline')} title={t.underline}><u>U</u></button>

          <button onClick={formatMono} title={t.monoTitle}><span style={{fontFamily: 'monospace', fontWeight: 'bold'}}>M</span></button>
          <button onClick={() => formatText('insertUnorderedList')} title={t.listTitle}>•</button>

          <div className="color-picker-wrapper" title={t.colorTitle}>
            <input type="color" value={textColor} onChange={handleColorChange} className="color-picker-input" />
            <span className="color-picker-icon" style={{borderBottomColor: textColor}}>A</span>
          </div>

          <select
              className="format-select"
              value={currentFormat}
              onChange={(e) => handleFormatBlock(e.target.value)}
              title={t.formatTitle}
          >
            <option value="p">{t.normalText}</option>
            <option value="h1">{t.heading1}</option>
            <option value="h2">{t.heading2}</option>
            <option value="h3">{t.heading3}</option>
          </select>

          <select onChange={loadTemplate} defaultValue="" className="format-select">
            <option value="" disabled>{t.templates}</option>
            <option value="empty">{t.empty}</option>
            <option value="interrogation">{t.interrogation}</option>
            <option value="medical">{t.medical}</option>
            <option value="cargo">{t.cargo}</option>
          </select>

          <div className="action-buttons">
            <button className="btn-save" onClick={handleSaveButtonClick}>{t.saveBtn || "💾 СОХРАНИТЬ"}</button>
            <button className="btn-import" onClick={() => setShowImportModal(true)}>{t.importBtn}</button>
            <button className="btn-copy" onClick={copyToClipboard}>{t.copyBtn}</button>
          </div>
        </div>

        <div className="paper-container">
          <div
              ref={editorRef}
              className="paper ym-hide-content ym-disable-keys"
              contentEditable="true"
              onInput={saveContentLocally}
              onBlur={saveContentLocally}
              onMouseUp={handleSelectionChange}
              onKeyUp={handleSelectionChange}
              onPaste={handlePaste}
          ></div>
        </div>

        {showImportModal && (
            <div className="nt-modal-overlay">
              <div className="nt-modal">
                <div className="nt-modal-header">{t.importTitle}</div>
                <div className="nt-modal-body">
                  <label>{t.importPrompt}</label>
                  <textarea
                      className="nt-modal-textarea"
                      value={importInput}
                      onChange={(e) => setImportInput(e.target.value)}
                      placeholder={t.importPlaceholder}
                      autoFocus
                  />
                </div>
                <div className="nt-modal-footer">
                  <button className="nt-modal-btn cancel" onClick={handleImportCancel}>{t.importCancel}</button>
                  <button className="nt-modal-btn submit" onClick={handleImportSubmit}>{t.importSubmit}</button>
                </div>
              </div>
            </div>
        )}

        {showSaveModal && (
            <div className="nt-modal-overlay">
              <div className="nt-modal">
                <div className="nt-modal-header">{t.saveModalTitle}</div>
                <div className="nt-modal-body">
                  <label>{t.saveModalPrompt}</label>
                  <input
                      type="text"
                      className="nt-modal-textarea"
                      value={saveTitleInput}
                      onChange={(e) => setSaveTitleInput(e.target.value)}
                      placeholder={t.saveModalPlaceholder}
                      autoFocus
                      style={{ height: '42px', minHeight: '42px', resize: 'none' }}
                  />
                </div>
                <div className="nt-modal-footer">
                  <button className="nt-modal-btn cancel" onClick={() => setShowSaveModal(false)}>{t.importCancel}</button>
                  <button className="nt-modal-btn submit" onClick={handleSaveModalSubmit}>{t.saveModalSubmit}</button>
                </div>
              </div>
            </div>
        )}
      </>
  );
}

function DashboardView({ t, user, showToast }) {
  const navigate = useNavigate();

  const [savedDocs, setSavedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docToDelete, setDocToDelete] = useState(null);

  const [docToRename, setDocToRename] = useState(null);
  const [renameTitleInput, setRenameTitleInput] = useState('');

  const templates = [
    { id: 'blank', name: t.empty, isPlus: true }
  ];

  // Загрузка документов из MongoDB с токеном
  useEffect(() => {
    if (!user) return;
    fetchWithAuth(`${API_URL}/api/documents`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSavedDocs(data);
          setLoading(false);
        })
        .catch(err => console.error(err));
  }, [user]);

  const handleOpenRenameModal = (e, doc) => {
    e.stopPropagation();
    setDocToRename(doc);
    setRenameTitleInput(doc.title || '');
  };

  const handleConfirmRename = async () => {
    if (!docToRename) return;
    const docId = docToRename.id || docToRename._id;
    const finalTitle = renameTitleInput.trim() || 'Untitled Document';

    try {
      const res = await fetchWithAuth(`${API_URL}/api/documents/${docId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: finalTitle })
      });

      if (res.ok) {
        const updatedDoc = await res.json();
        setSavedDocs(prev => prev.map(doc => {
          if ((doc.id || doc._id) === docId) {
            return { ...doc, title: updatedDoc.title || finalTitle };
          }
          return doc;
        }));
        if (showToast) showToast(t.renameSuccessToast);
      } else {
        if (showToast) showToast(t.renameErrorToast, 'error');
      }
    } catch (err) {
      console.error('Rename error:', err);
      if (showToast) showToast(t.serverErrorToast, 'error');
    } finally {
      setDocToRename(null);
    }
  };

  const handleOpenDeleteModal = (e, doc) => {
    e.stopPropagation();
    setDocToDelete(doc);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    const docId = docToDelete.id || docToDelete._id;

    try {
      const res = await fetchWithAuth(`${API_URL}/api/documents/${docId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSavedDocs(prev => prev.filter(doc => (doc.id || doc._id) !== docId));
        if (showToast) showToast(t.deleteSuccessToast);
      } else {
        if (showToast) showToast(t.deleteErrorToast, 'error');
      }
    } catch (err) {
      console.error('Deleting error:', err);
      if (showToast) showToast(t.serverErrorToast, 'error');
    } finally {
      setDocToDelete(null);
    }
  };

  const handleCreateNew = (templateId) => {
    let initialContent = "";
    let initialTitle = "Untitled Document";

    if (templateId === 'interrogation') {
      initialContent = t.tplInterrogation;
      initialTitle = t.interrogation;
    } else if (templateId === 'medical') {
      initialContent = t.tplMedical;
      initialTitle = t.medical;
    } else if (templateId === 'cargo') {
      initialContent = t.tplCargo;
      initialTitle = t.cargo;
    }

    localStorage.setItem('ss14_paper_save', initialContent);
    navigate('/', { state: { initialTitle } });
  };

  const handleOpenDoc = (docId) => {
    navigate(`/doc/${docId}`);
  };

  if (!user) {
    return (
        <div className="dashboard-container">
          <div className="dashboard-auth-notice">
            <h2>{t.loginRequired}</h2>
            <p>{t.loginPromptDashboard}</p>
          </div>
        </div>
    );
  }

  return (
      <div className="dashboard-container">
        <section className="dash-section">
          <div className="dash-section-header">
            <span className="dash-title">{t.createDocHeader}</span>
          </div>

          <div className="docs-grid templates-grid">
            {templates.map((tpl) => (
                <div
                    key={tpl.id}
                    className={`doc-card template-card ${tpl.isPlus ? 'blank-card' : ''}`}
                    onClick={() => handleCreateNew(tpl.id)}
                >
                  <div className="doc-preview-wrapper">
                    {tpl.isPlus ? (
                        <div className="plus-icon">+</div>
                    ) : (
                        <div className="mini-paper-preview">
                          <pre>{tpl.preview}</pre>
                        </div>
                    )}
                  </div>
                  <div className="doc-card-info">
                    <span className="doc-card-title">{tpl.name}</span>
                  </div>
                </div>
            ))}
          </div>
        </section>

        <div className="dash-divider"></div>

        <section className="dash-section">
          <div className="dash-section-header">
            <span className="dash-title">{t.savedDocsHeader}</span>
            <span className={`dash-count ${savedDocs.length >= 50 ? 'limit-reached' : ''}`}>
              {savedDocs.length} / 50 {t.docCountUnit}
            </span>
          </div>

          {savedDocs.length === 0 ? (
              <div className="empty-docs-msg">{t.emptyDocsMsg}</div>
          ) : (
              <div className="docs-grid saved-grid">
                {savedDocs.map((doc) => {
                  const id = doc.id || doc._id;
                  return (
                      <div
                          key={id}
                          className="doc-card saved-card"
                          onClick={() => handleOpenDoc(id)}
                      >
                        <div className="doc-preview-wrapper">
                          <div className="mini-paper-preview ym-hide-content">
                            <div className="mini-paper-header">NT-DOC</div>
                            <p className="mini-paper-text">{doc.previewText}</p>
                          </div>
                        </div>

                        <div className="doc-card-footer">
                          <div className="doc-meta">
                            <span className="doc-card-title" title={doc.title}>{doc.title}</span>
                            <span className="doc-card-date">🕒 {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : (doc.date || '')}</span>
                          </div>

                          <div className="doc-actions-group">
                            <button
                                className="doc-action-btn"
                                title={t.renameTooltip}
                                onClick={(e) => handleOpenRenameModal(e, doc)}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                              </svg>
                            </button>

                            <button
                                className="doc-action-btn delete-btn"
                                title={t.deleteTooltip}
                                onClick={(e) => handleOpenDeleteModal(e, doc)}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
          )}
        </section>

        {docToRename && (
            <div className="nt-modal-overlay">
              <div className="nt-modal">
                <div className="nt-modal-header">{t.renameModalTitle}</div>
                <div className="nt-modal-body">
                  <label>{t.renameModalPrompt}</label>
                  <input
                      type="text"
                      className="nt-modal-textarea"
                      value={renameTitleInput}
                      onChange={(e) => setRenameTitleInput(e.target.value)}
                      placeholder={t.renameModalPlaceholder}
                      autoFocus
                      style={{ height: '42px', minHeight: '42px', resize: 'none' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename();
                      }}
                  />
                </div>
                <div className="nt-modal-footer">
                  <button className="nt-modal-btn cancel" onClick={() => setDocToRename(null)}>{t.importCancel}</button>
                  <button className="nt-modal-btn submit" onClick={handleConfirmRename}>{t.renameModalSubmit}</button>
                </div>
              </div>
            </div>
        )}

        {docToDelete && (
            <div className="nt-modal-overlay">
              <div className="nt-modal">
                <div className="nt-modal-header warning-header">
                  {t.deleteModalTitle}
                </div>
                <div className="nt-modal-body">
                  <p style={{ margin: '0 0 10px 0', color: '#e0e0e0' }}>
                    {t.deleteModalPrompt}
                  </p>
                  <div className="delete-doc-target">
                    📄 <strong>{docToDelete.title || 'Без названия'}</strong>
                  </div>
                  <p className="nt-modal-subtext">
                    {t.deleteModalSubtext}
                  </p>
                </div>
                <div className="nt-modal-footer">
                  <button
                      className="nt-modal-btn cancel"
                      onClick={() => setDocToDelete(null)}
                  >
                    {t.importCancel}
                  </button>
                  <button
                      className="nt-modal-btn danger"
                      onClick={handleConfirmDelete}
                  >
                    {t.deleteModalSubmit}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

function AuthCallbackView({ t, showToast, setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString || window.location.search);

    const token = params.get('token');
    const username = params.get('username');
    const error = params.get('error');

    if (token) {
      localStorage.setItem('auth_token', token);
      if (username) {
        localStorage.setItem('username', username);
        setUser({ username });
      } else {
        setUser({ username: 'User' });
      }

      showToast(t.authSuccessToast);
      navigate('/dashboard', { replace: true });
    } else if (error) {
      showToast(t.ss14LoginErrorToast, 'error');
      navigate('/', { replace: true });
    }
  }, [navigate, setUser, showToast, t]);

  return (
      <div style={{ padding: '2rem', color: '#fff', textAlign: 'center' }}>
        <h2>{t.authCallbackTitle}</h2>
        <p>{t.authCallbackDesc}</p>
      </div>
  );
}

export default App;