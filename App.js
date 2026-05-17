import React, { useState, useEffect, useRef } from 'react';
import './App.css';

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
    empty: "Пустой",
    interrogation: "Допрос (СБ)",
    medical: "Мед. карта",
    importBtn: "📥 ИМПОРТ",
    importTitle: "ВСТАВЬТЕ ВАШ КОД",
    importPrompt: "Вставьте скопированный код SS14 ниже:",
    importCancel: "ОТМЕНА",
    importSubmit: "ЗАГРУЗИТЬ",
    importSuccess: "КОД УСПЕШНО ИМПОРТИРОВАН!",
    copyBtn: "📋 КОПИРОВАТЬ",
    alertCopy: "КОД УСПЕШНО СКОПИРОВАН В БУФЕР!",
    statusStable: "СВЯЗЬ С ЦК: СТАБИЛЬНА",
    autosaveLabel: "АВТОСОХРАНЕНИЕ:",
    autosaveStatus: "АКТИВНО",
    chars: "СИМВОЛЫ",
    tplInterrogation: "<b>БЛАНК ДОПРОСА</b><br><br><b>Имя подозреваемого:</b><br><b>Должность:</b><br><b>Причина задержания:</b><br><br><b>Ход допроса:</b><br><br><i>Подпись офицера СБ:</i>",
    tplMedical: "<b>МЕДИЦИНСКОЕ ЗАКЛЮЧЕНИЕ</b><br><br><b>Пациент:</b><br><b>Диагноз:</b><br><b>Назначенное лечение:</b><br><br><i>Подпись Главного Врача:</i>",
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
    empty: "Blank",
    interrogation: "Interrogation",
    medical: "Medical",
    importBtn: "📥 IMPORT",
    importTitle: "IMPORT YOUR CODE",
    importPrompt: "Paste your SS14 code below:",
    importCancel: "CANCEL",
    importSubmit: "LOAD",
    importSuccess: "CODE SUCCESSFULLY IMPORTED!",
    copyBtn: "📋 COPY",
    alertCopy: "CODE SUCCESSFULLY COPIED TO CLIPBOARD!",
    statusStable: "CC CONNECTION: STABLE",
    autosaveLabel: "AUTOSAVE:",
    autosaveStatus: "ACTIVE",
    chars: "CHARS",
    tplInterrogation: "<b>INTERROGATION FORM</b><br><br><b>Suspect Name:</b><br><b>Job Title:</b><br><b>Reason for Detention:</b><br><br><b>Interrogation Log:</b><br><br><i>Security Officer Signature:</i>",
    tplMedical: "<b>MEDICAL REPORT</b><br><br><b>Patient:</b><br><b>Diagnosis:</b><br><b>Prescribed Treatment:</b><br><br><i>Chief Medical Officer Signature:</i>",
  }
};

function App() {
  const editorRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const [textColor, setTextColor] = useState('#000000');
  const [currentFormat, setCurrentFormat] = useState('p');

  // Custom modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importInput, setImportInput] = useState("");

  const [toastMessage, setToastMessage] = useState(null);
  const [showClown, setShowClown] = useState(false);

  const [lang, setLang] = useState(() => localStorage.getItem('ss14_paper_lang') || 'en');
  const t = TRANSLATIONS[lang];
  const MAX_CHARS = 4000;

  useEffect(() => {
    const clownInterval = setInterval(() => {
      setShowClown(true);
      setTimeout(() => setShowClown(false), 8000);
    }, 60000);
    return () => clearInterval(clownInterval);
  }, []);

  useEffect(() => {
    localStorage.setItem('ss14_paper_lang', lang);
  }, [lang]);

  useEffect(() => {
    const saved = localStorage.getItem('ss14_paper_save');
    if (saved && editorRef.current) {
      editorRef.current.innerHTML = saved;
      updateCount();
    } else if (editorRef.current) {
      editorRef.current.innerHTML = t.placeholder;
    }
  }, [lang]);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    saveContent();
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
    saveContent();
  };

  const formatMono = () => {
    document.execCommand('fontName', false, 'monospace');
    editorRef.current.focus();
    saveContent();
  };

  const saveContent = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    localStorage.setItem('ss14_paper_save', html);
    updateCount();
  };

  const updateCount = () => {
    if (editorRef.current) {
      setCharCount(editorRef.current.innerText.length);
    }
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

  const generateSS14Code = () => {
    if (!editorRef.current) return "";
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorRef.current.innerHTML;

    const fontElements = tempDiv.querySelectorAll('font[color]');
    fontElements.forEach(el => {
      const color = el.getAttribute('color');
      el.outerHTML = `[color=${color}]${el.innerHTML}[/color]`;
    });

    let currentHtml = tempDiv.innerHTML;

    const spanColorRegex = /<span[^>]+style=["'](?:[^"']*;\s*)?color:\s*([^;"']+)["'][^>]*>(.*?)<\/span>/gi;
    currentHtml = currentHtml.replace(spanColorRegex, (match, colorValue, content) => {
      let finalColor = colorValue.trim();
      if (finalColor.startsWith('rgb')) finalColor = rgbToHex(finalColor);
      return `[color=${finalColor}]${content}[/color]`;
    });

    currentHtml = currentHtml.replace(/<font[^>]*face=["']?monospace["']?[^>]*>(.*?)<\/font>/gi, '[mono]$1[/mono]');
    currentHtml = currentHtml.replace(/<span[^>]*style=["'][^"']*font-family:\s*monospace[^"']*["'][^>]*>(.*?)<\/span>/gi, '[mono]$1[/mono]');

    currentHtml = currentHtml.replace(/<li[^>]*>(.*?)<\/li>/gi, '\n[bullet]$1[/bullet]');
    currentHtml = currentHtml.replace(/<ul[^>]*>|<\/ul>/gi, '');

    currentHtml = currentHtml.replace(/<h([1-3])[^>]*>(.*?)<\/h\1>/gi, '\n[head=$1]$2[/head]\n');

    tempDiv.innerHTML = currentHtml;
    let processedHtml = tempDiv.innerHTML;

    processedHtml = processedHtml.replace(/<b>(.*?)<\/b>/gi, '[bold]$1[/bold]');
    processedHtml = processedHtml.replace(/<strong>(.*?)<\/strong>/gi, '[bold]$1[/bold]');
    processedHtml = processedHtml.replace(/<i>(.*?)<\/i>/gi, '[italic]$1[/italic]');
    processedHtml = processedHtml.replace(/<em>(.*?)<\/em>/gi, '[italic]$1[/italic]');
    processedHtml = processedHtml.replace(/<u>(.*?)<\/u>/gi, '[underline]$1[/underline]');

    processedHtml = processedHtml.replace(/<div><br><\/div>/gi, '\n');
    processedHtml = processedHtml.replace(/<div>(.*?)<\/div>/gi, '\n$1');
    processedHtml = processedHtml.replace(/<p>(.*?)<\/p>/gi, '\n$1');
    processedHtml = processedHtml.replace(/<br\s*[\/]?>/gi, '\n');

    processedHtml = processedHtml.replace(/\n\s*\n\s*\n/g, '\n\n');

    const finalDiv = document.createElement('div');
    finalDiv.innerHTML = processedHtml;
    return finalDiv.textContent.trim();
  };

  // Custom import window
  const handleImportSubmit = () => {
    if (!importInput.trim()) {
      setShowImportModal(false);
      return;
    }

    let html = importInput.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/\[bold\](.*?)\[\/bold\]/gi, '<b>$1</b>');
    html = html.replace(/\[italic\](.*?)\[\/italic\]/gi, '<i>$1</i>');
    html = html.replace(/\[underline\](.*?)\[\/underline\]/gi, '<u>$1</u>');
    html = html.replace(/\[color=(.*?)\](.*?)\[\/color\]/gi, '<span style="color: $1;">$2</span>');
    html = html.replace(/\[mono\](.*?)\[\/mono\]/gi, '<span style="font-family: monospace;">$1</span>');
    html = html.replace(/\[head=([1-3])\](.*?)\[\/head\]/gi, '<h$1>$2</h$1>');

    html = html.replace(/\[bullet\](.*?)\[\/bullet\]/gi, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gi, '<ul>$1</ul>');

    html = html.replace(/\n/g, '<br>');
    html = html.replace(/<br>\s*<h/gi, '<h');
    html = html.replace(/<\/h([1-3])>\s*<br>/gi, '</h$1>');
    html = html.replace(/<br>\s*<ul/gi, '<ul');
    html = html.replace(/<\/ul>\s*<br>/gi, '</ul>');

    if (editorRef.current) {
      editorRef.current.innerHTML = html;
      saveContent();
      showToast(t.importSuccess);
    }

    // Closing window
    setShowImportModal(false);
    setImportInput("");
  };

  const handleImportCancel = () => {
    setShowImportModal(false);
    setImportInput("");
  };

  const rgbToHex = (rgbString) => {
    const rgb = rgbString.match(/\d+/g);
    if (!rgb || rgb.length < 3) return "#000000";
    return "#" + ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1).toUpperCase();
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
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
    saveContent();
    e.target.value = "";
  };

  return (
      <div className="main-layout">
        <header className="app-header">
          <a href="" className="header-left logo-link">
            <img src="https://spacestation14.com/images/main/icon.png" alt="SS14 Logo" className="app-logo" />
            <div className="brand-text">
              <span className="brand-company">PAPERWORK</span>
              <span className="brand-product">TEXT EDITOR</span>
            </div>
          </a>
          <div className="header-right">
            <select className="station-tag lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
            <div className="station-tag">NT-SYSTEM v1.1</div>
          </div>
        </header>

        <div className="app-container">
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
            </select>

            <div className="action-buttons">
              <button className="btn-import" onClick={() => setShowImportModal(true)}>{t.importBtn}</button>
              <button className="btn-copy" onClick={copyToClipboard}>{t.copyBtn}</button>
            </div>
          </div>

          <div className="paper-container">
            <div
                ref={editorRef}
                className="paper"
                contentEditable="true"
                onInput={saveContent}
                onBlur={saveContent}
                onMouseUp={handleSelectionChange}
                onKeyUp={handleSelectionChange}
            ></div>
          </div>
        </div>

        <footer className="app-footer">
          <div className="footer-item footer-left">
            <span className="blink-dot"></span> {t.statusStable}
          </div>
          <div className="footer-item footer-center">
            {t.autosaveLabel} <span className="status-green" style={{ marginLeft: '5px' }}>{t.autosaveStatus}</span>
          </div>
          <div className={`footer-item footer-right ${charCount > MAX_CHARS ? 'warning' : ''}`}>
            {t.chars}: {charCount} / {MAX_CHARS}
          </div>
        </footer>

        {toastMessage && (
            <div className="nt-toast">
              <div className="nt-toast-text">{toastMessage}</div>
            </div>
        )}

        <div className={`clown-secret-message ${showClown ? 'active' : ''}`}>
          <img src="https://i.redd.it/6j0xclcoqs861.png" alt="Clown" className="clown-sprite" />
          <div className="clown-speech-bubble">
            For feedback write <b>komkalive</b> on Discord! Honk!
          </div>
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
                      placeholder="[head=1]CONFIDENTIAL[/head]&#10;[bold]Subject:[/bold]..."
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

      </div>
  );
}

export default App;