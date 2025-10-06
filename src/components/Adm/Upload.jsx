import React, { useState } from "react";
import * as XLSX from "xlsx";
import "../styles/Upload.css";
import { FaFileExcel, FaUpload, FaPaperPlane, FaDownload } from "react-icons/fa";

export default function UploadCard({ onDataParsed }) {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dados, setDados] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [produtorSelecionado, setProdutorSelecionado] = useState(true); 

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setSuccess(false);
    if (!file) return setError("Nenhum arquivo selecionado.");
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return setError("Formato inválido. Envie um arquivo .xlsx ou .xls.");
    }

    setFileName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (jsonData.length === 0) {
          return setError("A planilha está vazia.");
        }

        setDados(jsonData);
        onDataParsed(jsonData); 
      } catch (err) {
        setError("Erro ao processar o arquivo.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSendSpreadsheet = async () => {
    try {
      setIsSending(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
      setError("");
    } catch (error) {
      setError("Erro ao enviar a planilha.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="upload-card">
      <div className="upload-container">
      <img src="/imagens/logo3.png" alt="Logo" className="logo-perfil" />

        <h2 className="upload-title">
          <FaFileExcel className="icon-xl" />
          Importar Arquivo Excel
        </h2>

        <label htmlFor="file-upload" className="upload-label">
          <FaUpload className="icon-sm" />
          Escolher arquivo
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden-input"
        />

        {fileName && (
          <p className="file-name">
            📁 Arquivo: <strong>{fileName}</strong>
          </p>
        )}

        {error && <p className="error-alert">⚠️ {error}</p>}
        {success && <p className="success-alert">✅ Planilha enviada!</p>}

        <button
          className="btn-baixar"
          onClick={handleSendSpreadsheet}
          
        >
          {isSending ? "⏳ Baixando..." : (
            <>
            <FaDownload className="icon-sm" />
             Baixar planilha modelo
            </>
          )}
        </button>

        <button
          className="btn-enviar"
          onClick={handleSendSpreadsheet}
          disabled={dados.length === 0 || isSending}
        >
          {isSending ? "⏳ Enviando..." : (
            <>
              <FaPaperPlane className="icon-sm" />
              Enviar Planilha
            </>
          )}
        </button>
       
      </div>
    </section>
  );
}
