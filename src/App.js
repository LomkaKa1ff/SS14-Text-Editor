import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Шаблоны Nanotrasen (без изменений)
const TEMPLATES = {
  empty: "",
  interrogation: "<b>БЛАНК ДОПРОСА</b><br><br><b>Имя подозреваемого:</b><br><b>Должность:</b><br><b>Причина задержания:</b><br><br><b>Ход допроса:</b><br><br><i>Подпись офицера СБ:</i>",
  medical: "<b>МЕДИЦИНСКОЕ ЗАКЛЮЧЕНИЕ</b><br><br><b>Пациент:</b><br><b>Диагноз:</b><br><b>Назначенное лечение:</b><br><br><i>Подпись Главного Врача:</i>",
};

function App() {
  const editorRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const [textColor, setTextColor] = useState('#000000'); // [ДОБАВЛЕНО] Состояние для хранения выбранного цвета
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

  // [ДОБАВЛЕНО] Функция для применения цвета к выделенному тексту
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setTextColor(newColor); // Обновляем цвет в палитре

    // execCommand с 'foreColor' заставляет браузер обернуть текст в <font color="..."> или <span style="color:...">
    // Мы это потом отловим в конвертере.
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

  // [ИЗМЕНЕНО] Обновленный конвертер с поддержкой цветов
  const generateSS14Code = () => {
    if (!editorRef.current) return "";

    // Создаем временный DOM-элемент, чтобы удобно парсить HTML, который нагенерировал браузер
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorRef.current.innerHTML;

    // 1. Сначала обрабатываем цвета.
    // Браузеры при execCommand('foreColor') могут генерировать либо <font color="#..."> (старый стиль),
    // либо <span style="color: rgb(...)"> или <span style="color: #..."> (новый стиль).

    // Обработка старого <font color="...">
    const fontElements = tempDiv.querySelectorAll('font[color]');
    fontElements.forEach(el => {
      const color = el.getAttribute('color');
      el.outerHTML = `[color=${color}]${el.innerHTML}[/color]`;
    });

    // Обработка <span style="color: ...">
    // Это сложнее, т.к. style — это строка. Простой regex тут надежнее.
    let currentHtml = tempDiv.innerHTML;

    // Regex ищет span со стилем color, захватывая и HEX, и RGB
    const spanColorRegex = /<span[^>]+style=["'](?:[^"']*;\s*)?color:\s*([^;"']+)["'][^>]*>(.*?)<\/span>/gi;

    currentHtml = currentHtml.replace(spanColorRegex, (match, colorValue, content) => {
      // Браузеры часто переводят HEX в RGB в стилях. Нам нужно вернуть HEX для SS14.
      let finalColor = colorValue.trim();
      if (finalColor.startsWith('rgb')) {
        finalColor = rgbToHex(finalColor);
      }
      return `[color=${finalColor}]${content}[/color]`;
    });

    // Очищаем tempDiv и загружаем обработанный с цветами HTML для остальных тегов
    tempDiv.innerHTML = currentHtml;

    // 2. Обработка остальных тегов (как было, но через textContent/innerHTML для надежности)
    let processedHtml = tempDiv.innerHTML;

    processedHtml = processedHtml.replace(/<b>(.*?)<\/b>/gi, '[bold]$1[/bold]');
    processedHtml = processedHtml.replace(/<strong>(.*?)<\/strong>/gi, '[bold]$1[/bold]');
    processedHtml = processedHtml.replace(/<i>(.*?)<\/i>/gi, '[italic]$1[/italic]');
    processedHtml = processedHtml.replace(/<em>(.*?)<\/em>/gi, '[italic]$1[/italic]');
    processedHtml = processedHtml.replace(/<u>(.*?)<\/u>/gi, '[underline]$1[/underline]');

    // 3. Обработка переносов строк
    processedHtml = processedHtml.replace(/<div><br><\/div>/gi, '\n');
    processedHtml = processedHtml.replace(/<div>(.*?)<\/div>/gi, '\n$1');
    processedHtml = processedHtml.replace(/<p>(.*?)<\/p>/gi, '\n$1');
    processedHtml = processedHtml.replace(/<br\s*[\/]?>/gi, '\n');

    // 4. Финальная очистка от всех оставшихся HTML тегов
    const finalDiv = document.createElement('div');
    finalDiv.innerHTML = processedHtml;

    // textContent вернет чистый текст, где остались только наши игровые квадратные скобки
    return finalDiv.textContent.trim();
  };

  // [ДОБАВЛЕНО] Вспомогательная функция для конвертации rgb(r, g, b) в #hex
  const rgbToHex = (rgbString) => {
    const rgb = rgbString.match(/\d+/g);
    if (!rgb || rgb.length < 3) return "#000000";
    return "#" + ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1).toUpperCase();
  };

  const copyToClipboard = () => {
    const ss14Code = generateSS14Code();
    navigator.clipboard.writeText(ss14Code);
    // Для отладки можно раскомментировать:
    // console.log("Сгенерированный код:", ss14Code);
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
      <div className="app-container">
        <div className="toolbar">
          <button onClick={() => formatText('bold')} title="Жирный"><b>B</b></button>
          <button onClick={() => formatText('italic')} title="Курсив"><i>I</i></button>
          <button onClick={() => formatText('underline')} title="Подчеркнутый"><u>U</u></button>

          {/* [ДОБАВЛЕНО] Кнопка выбора цвета */}
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

        <div className="footer">
          <span>Статус: Автосохранение активно</span>
          <span className={charCount > MAX_CHARS ? 'warning' : ''}>
          Символы: {charCount} / {MAX_CHARS}
        </span>
        </div>
      </div>
  );
}

export default App;