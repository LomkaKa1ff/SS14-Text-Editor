import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const TEMPLATES = {
  empty: "",
  interrogation: "<b>БЛАНК ДОПРОСА</b><br><br><b>Имя подозреваемого:</b><br><b>Должность:</b><br><b>Причина задержания:</b><br><br><b>Ход допроса:</b><br><br><i>Подпись офицера СБ:</i>",
  medical: "<b>МЕДИЦИНСКОЕ ЗАКЛЮЧЕНИЕ</b><br><br><b>Пациент:</b><br><b>Диагноз:</b><br><b>Назначенное лечение:</b><br><br><i>Подпись Главного Врача:</i>",
};

function App() {
  const editorRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const [textColor, setTextColor] = useState('#000000');
  const MAX_CHARS = 4000;

  useEffect(() => {
    const saved = localStorage.getItem('ss14_paper_save');
    if (saved && editorRef.current) {
      editorRef.current.innerHTML = saved;
      updateCount();
    } else if (editorRef.current) {
      editorRef.current.innerHTML = "Начни писать свой отчет здесь...";
    }
  }, []);

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
    alert('Код для SS14 скопирован в буфер обмена!');
  };

  const loadTemplate = (e) => {
    const templateKey = e.target.value;
    if (templateKey && editorRef.current) {
      editorRef.current.innerHTML = TEMPLATES[templateKey];
      saveContent();
    }
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
          <div className="header-right">
            <div className="station-tag">NT-SYSTEM v1.1</div>
          </div>
        </header>

        {/* ОСНОВНОЙ КОНТЕНТ (РЕДАКТОР) */}
        <div className="app-container">
          <div className="toolbar">
            <button onClick={() => formatText('bold')} title="Жирный"><b>B</b></button>
            <button onClick={() => formatText('italic')} title="Курсив"><i>I</i></button>
            <button onClick={() => formatText('underline')} title="Подчеркнутый"><u>U</u></button>

            <div className="color-picker-wrapper" title="Цвет текста">
              <input
                  type="color"
                  value={textColor}
                  onChange={handleColorChange}
                  className="color-picker-input"
              />
              <span className="color-picker-icon" style={{borderBottomColor: textColor}}>A</span>
            </div>

            <select onChange={loadTemplate} defaultValue="">
              <option value="" disabled>Шаблоны...</option>
              <option value="empty">Чистый лист</option>
              <option value="interrogation">Бланк допроса (СБ)</option>
              <option value="medical">Мед. заключение (Медбай)</option>
            </select>

            <button className="btn-copy" onClick={copyToClipboard}>📋 СКОПИРОВАТЬ КОД</button>
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
            <span className="blink-dot"></span> СВЯЗЬ С ЦК: СТАБИЛЬНА
          </div>
          <div className="footer-item">
            АВТОСОХРАНЕНИЕ: <span className="status-green">АКТИВНО</span>
          </div>
          <div className={`footer-item ${charCount > MAX_CHARS ? 'warning' : ''}`}>
            СИМВОЛЫ: {charCount} / {MAX_CHARS}
          </div>
        </footer>
      </div>
  );
}

export default App;