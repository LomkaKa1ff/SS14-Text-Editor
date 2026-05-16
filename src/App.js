import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Словарь локализации
const TRANSLATIONS = {
  ru: {
    placeholder: "Начни писать свой отчет здесь...",
    bold: "Жирный",
    italic: "Курсив",
    underline: "Подчеркнутый",
    colorTitle: "Цвет текста",
    templates: "Шаблоны...",
    empty: "Чистый лист",
    interrogation: "Бланк допроса (СБ)",
    medical: "Мед. заключение (Медбай)",
    copyBtn: "📋 СКОПИРОВАТЬ КОД",
    alertCopy: "Код для SS14 скопирован в буфер обмена!",
    statusStable: "СВЯЗЬ С ЦК: СТАБИЛЬНА",
    autosaveActive: "АВТОСОХРАНЕНИЕ: АКТИВНО",
    chars: "СИМВОЛЫ",
    tplInterrogation: "<b>БЛАНК ДОПРОСА</b><br><br><b>Имя подозреваемого:</b><br><b>Должность:</b><br><b>Причина задержания:</b><br><br><b>Ход допроса:</b><br><br><i>Подпись офицера СБ:</i>",
    tplMedical: "<b>МЕДИЦИНСКОЕ ЗАКЛЮЧЕНИЕ</b><br><br><b>Пациент:</b><br><b>Диагноз:</b><br><b>Назначенное лечение:</b><br><br><i>Подпись Главного Врача:</i>",
  },
  en: {
    placeholder: "Start writing your report here...",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    colorTitle: "Text Color",
    templates: "Templates...",
    empty: "Blank page",
    interrogation: "Interrogation Form (Sec)",
    medical: "Medical Report (Med)",
    copyBtn: "📋 COPY CODE",
    alertCopy: "SS14 code copied to clipboard!",
    statusStable: "CC CONNECTION: STABLE",
    autosaveActive: "AUTOSAVE: ACTIVE",
    chars: "CHARS",
    tplInterrogation: "<b>INTERROGATION FORM</b><br><br><b>Suspect Name:</b><br><b>Job Title:</b><br><b>Reason for Detention:</b><br><br><b>Interrogation Log:</b><br><br><i>Security Officer Signature:</i>",
    tplMedical: "<b>MEDICAL REPORT</b><br><br><b>Patient:</b><br><b>Diagnosis:</b><br><b>Prescribed Treatment:</b><br><br><i>Chief Medical Officer Signature:</i>",
  }
};

function App() {
  const editorRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const [textColor, setTextColor] = useState('#000000');

  // Состояние языка (по умолчанию RU, либо берем из памяти)
  const [lang, setLang] = useState(() => localStorage.getItem('ss14_paper_lang') || 'ru');
  const t = TRANSLATIONS[lang]; // Текущий словарь
  const MAX_CHARS = 4000;

  // Сохраняем язык при его изменении
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
  }, [lang]); // Обновим плейсхолдер при смене языка, если лист пустой

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
      if (finalColor.startsWith('rgb')) {
        finalColor = rgbToHex(finalColor);
      }
      return `[color=${finalColor}]${content}[/color]`;
    });

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

    const finalDiv = document.createElement('div');
    finalDiv.innerHTML = processedHtml;
    return finalDiv.textContent.trim();
  };

  const rgbToHex = (rgbString) => {
    const rgb = rgbString.match(/\d+/g);
    if (!rgb || rgb.length < 3) return "#000000";
    return "#" + ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1).toUpperCase();
  };

  const copyToClipboard = () => {
    const ss14Code = generateSS14Code();
    navigator.clipboard.writeText(ss14Code);
    alert(t.alertCopy);
  };

  const loadTemplate = (e) => {
    const templateKey = e.target.value;
    if (!templateKey || !editorRef.current) return;

    if (templateKey === 'empty') {
      editorRef.current.innerHTML = "";
    } else if (templateKey === 'interrogation') {
      editorRef.current.innerHTML = t.tplInterrogation;
    } else if (templateKey === 'medical') {
      editorRef.current.innerHTML = t.tplMedical;
    }

    saveContent();
    e.target.value = ""; // Сбрасываем селект после выбора
  };

  return (
      <div className="main-layout">
        {/* ХЕДЕР САЙТА */}
        <header className="app-header">
          <div className="header-left">
            <img
                src="https://spacestation14.com/images/main/icon.png"
                alt="SS14 Logo"
                className="app-logo"
            />
            <div className="brand-text">
              <span className="brand-company">NANOTRASEN</span>
              <span className="brand-product">TEXT EDITOR</span>
            </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ ХЕДЕРА */}
          <div className="header-right">
            {/* Кнопка смены языка */}
            <select
                className="station-tag lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
            >
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
            <div className="station-tag">NT-SYSTEM v1.4</div>
          </div>
        </header>

        {/* ОСНОВНОЙ КОНТЕНТ (РЕДАКТОР) */}
        <div className="app-container">
          <div className="toolbar">
            <button onClick={() => formatText('bold')} title={t.bold}><b>B</b></button>
            <button onClick={() => formatText('italic')} title={t.italic}><i>I</i></button>
            <button onClick={() => formatText('underline')} title={t.underline}><u>U</u></button>

            <div className="color-picker-wrapper" title={t.colorTitle}>
              <input
                  type="color"
                  value={textColor}
                  onChange={handleColorChange}
                  className="color-picker-input"
              />
              <span className="color-picker-icon" style={{borderBottomColor: textColor}}>A</span>
            </div>

            <select onChange={loadTemplate} defaultValue="">
              <option value="" disabled>{t.templates}</option>
              <option value="empty">{t.empty}</option>
              <option value="interrogation">{t.interrogation}</option>
              <option value="medical">{t.medical}</option>
            </select>

            <button className="btn-copy" onClick={copyToClipboard}>{t.copyBtn}</button>
          </div>

          <div className="paper-container">
            <div
                ref={editorRef}
                className="paper"
                contentEditable="true"
                onInput={saveContent}
                onBlur={saveContent}
            ></div>
          </div>
        </div>

        {/* ФУТЕР САЙТА */}
        <footer className="app-footer">
          <div className="footer-item">
            <span className="blink-dot"></span> {t.statusStable}
          </div>
          <div className="footer-item">
            {t.autosaveActive}
          </div>
          <div className={`footer-item ${charCount > MAX_CHARS ? 'warning' : ''}`}>
            {t.chars}: {charCount} / {MAX_CHARS}
          </div>
        </footer>
      </div>
  );
}

export default App;