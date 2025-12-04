import React, { useState } from 'react';
import { FileText, Upload, Download, Zap, CheckCircle, AlertCircle, Info } from 'lucide-react';
import '../styles/PdfAutomation.css';

const PdfAutomation = () => {
    const [modelFile, setModelFile] = useState(null);
    const [inputFile, setInputFile] = useState(null);
    const [operation, setOperation] = useState('separar');
    const [renameRule, setRenameRule] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [downloadUrl, setDownloadUrl] = useState(null);

    const resetFeedback = () => {
        setErrorMsg('');
        setSuccessMsg('');
        setDownloadUrl(null);
    };

    const handleModelChange = (e) => {
        setModelFile(e.target.files[0] || null);
        resetFeedback();
    };

    const handleInputChange = (e) => {
        setInputFile(e.target.files[0] || null);
        resetFeedback();
    };

    const handleOperationChange = (value) => {
        setOperation(value);
        setModelFile(null);
        setInputFile(null);
        setRenameRule('');
        resetFeedback();
    };

    const handleRenameRuleChange = (e) => {
        setRenameRule(e.target.value);
        resetFeedback();
    };

    const handleSubmit = () => {
        resetFeedback();

        if (operation === 'separar' && !inputFile) {
            setErrorMsg('Selecione os arquivos para separação.');
            return;
        }

        if (operation === 'renomear') {
            if (!modelFile) {
                setErrorMsg('Selecione o PDF modelo.');
                return;
            }
            if (!inputFile) {
                setErrorMsg('Selecione os arquivos a serem renomeados.');
                return;
            }
            if (!renameRule.trim()) {
                setErrorMsg('Descreva a regra de renomeação.');
                return;
            }
        }

        if (operation === 'ambos') {
            if (!modelFile) {
                setErrorMsg('Selecione o PDF modelo.');
                return;
            }
            if (!inputFile) {
                setErrorMsg('Selecione os arquivos a serem processados.');
                return;
            }
            if (!renameRule.trim()) {
                setErrorMsg('Descreva a regra de renomeação.');
                return;
            }
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setSuccessMsg('Arquivo processado com sucesso! Faça o download abaixo.');
            setDownloadUrl('mock-url');
        }, 2000);
    };

    const handleDownload = () => {
        console.log('Download iniciado');
    };

    const operationOptions = [
        {
            value: 'separar',
            title: 'Separar arquivos',
            description: 'Divide PDFs em arquivos individuais',
            icon: '📄',
        },
        {
            value: 'renomear',
            title: 'Renomear arquivos',
            description: 'Aplica regras de nomenclatura',
            icon: '✏️',
        },
        {
            value: 'ambos',
            title: 'Separar e renomear',
            description: 'Executa ambas as operações',
            icon: '⚡',
        },
    ];

    return (
        <div className="pdf-page">
            <div className="pdf-container">
                {/* Header */}
                <div className="pdf-header">
                    <div className="pdf-header-left">
                        <div className="pdf-header-icon-wrapper">
                            <FileText className="pdf-header-icon" />
                        </div>
                        <div>
                            <h1 className="pdf-header-title">Automação de PDFs</h1>
                            <p className="pdf-header-subtitle">
                                Processe seus documentos de forma rápida e eficiente
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pdf-card pdf-card-main">
                    <div className="pdf-section pdf-section-border">
                        <div className="pdf-step-header">
                            <span className="pdf-step-number">1</span>
                            <h2 className="pdf-step-title">Tipo de operação</h2>
                        </div>

                        <div className="pdf-options-grid">
                            {operationOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleOperationChange(opt.value)}
                                    className={
                                        'pdf-option-card' +
                                        (operation === opt.value ? ' active' : '')
                                    }
                                >
                                    <div className="pdf-option-content">
                                        <span className="pdf-option-emoji">{opt.icon}</span>
                                        <div className="pdf-option-text">
                                            <h3 className="pdf-option-title">{opt.title}</h3>
                                            <p className="pdf-option-description">
                                                {opt.description}
                                            </p>
                                        </div>
                                    </div>
                                    {operation === opt.value && (
                                        <div className="pdf-option-check">
                                            <CheckCircle className="pdf-option-check-icon" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pdf-section pdf-section-body">
                        {(operation === 'renomear' || operation === 'ambos') && (
                            <div className="pdf-field-block">
                                <div className="pdf-step-header">
                                    <span className="pdf-step-number">2</span>
                                    <label className="pdf-step-title">PDF modelo</label>
                                </div>
                                <div
                                    className={
                                        'pdf-upload ' +
                                        (modelFile ? 'pdf-upload-filled' : 'pdf-upload-empty')
                                    }
                                >
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleModelChange}
                                        className="pdf-upload-input"
                                    />
                                    <div className="pdf-upload-content">
                                        <Upload
                                            className={
                                                'pdf-upload-icon ' +
                                                (modelFile ? 'filled' : 'empty')
                                            }
                                        />
                                        {modelFile ? (
                                            <>
                                                <p className="pdf-upload-title">{modelFile.name}</p>
                                                <p className="pdf-upload-subtitle">
                                                    Arquivo selecionado com sucesso
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="pdf-upload-title">
                                                    Clique para selecionar o PDF modelo
                                                </p>
                                                <p className="pdf-upload-subtitle">
                                                    Arquivo de referência para leitura dos campos
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(operation === 'separar' || modelFile) && (
                            <div className="pdf-field-block">
                                <div className="pdf-step-header">
                                    <span className="pdf-step-number">
                                        {operation === 'renomear' || operation === 'ambos'
                                            ? '3'
                                            : '2'}
                                    </span>
                                    <label className="pdf-step-title">
                                        {operation === 'separar' && 'Arquivos para separação'}
                                        {operation === 'renomear' && 'Arquivos para renomear'}
                                        {operation === 'ambos' && 'Arquivos para processamento'}
                                    </label>
                                </div>
                                <div
                                    className={
                                        'pdf-upload ' +
                                        (inputFile ? 'pdf-upload-filled' : 'pdf-upload-empty')
                                    }
                                >
                                    <input
                                        type="file"
                                        accept=".zip,application/pdf"
                                        onChange={handleInputChange}
                                        className="pdf-upload-input"
                                    />
                                    <div className="pdf-upload-content">
                                        <Upload
                                            className={
                                                'pdf-upload-icon ' +
                                                (inputFile ? 'filled' : 'empty')
                                            }
                                        />
                                        {inputFile ? (
                                            <>
                                                <p className="pdf-upload-title">{inputFile.name}</p>
                                                <p className="pdf-upload-subtitle">
                                                    Arquivo selecionado com sucesso
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="pdf-upload-title">
                                                    Clique para selecionar os arquivos
                                                </p>
                                                <p className="pdf-upload-subtitle">
                                                    ZIP contendo PDFs ou um único PDF
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(operation === 'renomear' || operation === 'ambos') && inputFile && (
                            <div className="pdf-field-block">
                                <div className="pdf-step-header">
                                    <span className="pdf-step-number">4</span>
                                    <label className="pdf-step-title">
                                        Regra de renomeação
                                    </label>
                                </div>
                                <textarea
                                    className="pdf-textarea"
                                    rows={4}
                                    value={renameRule}
                                    onChange={handleRenameRuleChange}
                                    placeholder='Exemplo: "Nome do segurado + "_" + CNPJ"'
                                />
                                <div className="pdf-info-box">
                                    <Info className="pdf-info-icon" />
                                    <p className="pdf-info-text">
                                        Descreva como o nome deve ser montado. Ex:{' '}
                                        <strong>Nome do segurado + "_" + CNPJ</strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        {errorMsg && (
                            <div className="pdf-alert pdf-alert-error">
                                <AlertCircle className="pdf-alert-icon pdf-alert-icon-error" />
                                <p className="pdf-alert-text">{errorMsg}</p>
                            </div>
                        )}

                        {successMsg && (
                            <div className="pdf-alert pdf-alert-success">
                                <CheckCircle className="pdf-alert-icon pdf-alert-icon-success" />
                                <p className="pdf-alert-text">{successMsg}</p>
                            </div>
                        )}

                        <div className="pdf-actions">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="pdf-btn pdf-btn-primary"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="pdf-spinner" />
                                        <span>Processando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="pdf-btn-icon" />
                                        <span>Processar arquivos</span>
                                    </>
                                )}
                            </button>

                            {downloadUrl && (
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="pdf-btn pdf-btn-secondary"
                                >
                                    <Download className="pdf-btn-icon" />
                                    <span>Baixar ZIP gerado</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pdf-tips-card">
                    <div className="pdf-tips-header">
                        <Info className="pdf-tips-icon" />
                        <h3 className="pdf-tips-title">Dicas de uso</h3>
                    </div>
                    <ul className="pdf-tips-list">
                        <li>
                            - Para renomear ou ambos, use sempre um PDF modelo com o layout correto.
                        </li>
                        <li>
                            - Verifique se o arquivo contém apenas PDFs válidos.
                        </li>
                        <li>
                            - Documente a regra de renomeação de forma clara.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PdfAutomation;
