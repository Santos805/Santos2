/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, CheckCircle2, ChevronRight, ChevronLeft, FileText, Send, User, Mail, Briefcase, Target, DollarSign, Star, Loader2, Phone } from 'lucide-react';
import { SUBMISSION_URL } from './config';

/**
 * CÓDIGO PARA GOOGLE APPS SCRIPT (Copia esto en tu Google Sheet > Extensiones > Apps Script)
 * 
 * function doPost(e) {
 *   try {
 *     var data = JSON.parse(e.postData.contents);
 *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *     
 *     // Guardar en Google Sheets
 *     sheet.appendRow([
 *       new Date(),
 *       data.fullName,
 *       data.email,
 *       data.specialty,
 *       data.experience,
 *       data.challenges,
 *       data.salary,
 *       data.whyMe,
 *       data.cvName
 *     ]);
 *     
 *     // Enviar Email con el archivo
 *     var decodedFile = Utilities.base64Decode(data.cvBase64);
 *     var blob = Utilities.newBlob(decodedFile, data.cvType, data.cvName);
 *     
 *     MailApp.sendEmail({
 *       to: "TU_MAIL_AQUI@gmail.com", // CAMBIA ESTO POR TU MAIL
 *       subject: "Nuevo Candidato: " + data.fullName,
 *       body: "Se ha recibido una nueva postulación.\n\n" +
 *             "Nombre: " + data.fullName + "\n" +
 *             "Email: " + data.email + "\n" +
 *             "Especialidad: " + data.specialty + "\n" +
 *             "Experiencia: " + data.experience + "\n" +
 *             "Desafíos: " + data.challenges + "\n" +
 *             "Expectativa: " + data.salary + "\n" +
 *             "Por qué: " + data.whyMe + "\n",
 *       attachments: [blob]
 *     });
 *     
 *     return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *       
 *   } catch (err) {
 *     return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 */

type Step = 'intro' | 'info' | 'questions' | 'cv' | 'success' | 'scratch' | 'scratch_success';

export default function App() {
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    experience: '',
    challenges: '',
    salary: '',
    whyMe: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo es demasiado grande (máx 5MB)');
        return;
      }
      setCvFile(file);
      setError(null);
    }
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async () => {
    if (!cvFile) {
      setError('Por favor, carga tu CV');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cvBase64 = await toBase64(cvFile);
      
      const payload = {
        ...formData,
        cvBase64,
        cvName: cvFile.name,
        cvType: cvFile.type,
      };

      // Google Apps Script requiere 'no-cors' o enviar como texto plano para evitar problemas de redirección
      await fetch(SUBMISSION_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload),
      });

      // Con 'no-cors' no podemos leer la respuesta, pero si llegamos aquí es que se envió
      setStep('success');
    } catch (err) {
      console.error(err);
      setError('Hubo un problema al enviar tu postulación. Verifica que la URL de Google sea la correcta.');
    } finally {
      setLoading(false);
    }
  };

  const handleScratchSubmit = async () => {
    if (!formData.fullName || !formData.lastName || !formData.email || !formData.phone) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        type: 'scratch',
        fullName: formData.fullName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      };

      await fetch(SUBMISSION_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload),
      });

      setStep('scratch_success');
    } catch (err) {
      console.error(err);
      setError('Hubo un problema al enviar tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8 max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4">
              <Briefcase className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Conectamos <span className="text-indigo-600">Talento Excepcional</span> con Empresas Líderes
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              TALENT CONNECT 
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setStep('scratch')}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                Armar CV desde cero
              </button>
              <button 
                onClick={() => setStep('info')}
                className="w-full sm:w-auto px-8 py-4 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                Optimizar mi CV
              </button>
            </div>
          </motion.div>
        );

      case 'info':
        return (
          <motion.div 
            key="info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-w-md mx-auto"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Datos de contacto</h2>
              <p className="text-slate-500">Contanos quién sos para poder contactarte.</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  name="fullName"
                  placeholder="Nombre Completo"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Correo Electrónico"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setStep('intro')}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all"
              >
                Volver
              </button>
              <button 
                disabled={!formData.fullName || !formData.email}
                onClick={() => setStep('questions')}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        );

      case 'questions':
        return (
          <motion.div 
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 max-w-xl mx-auto"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Cuéntame más sobre ti</h2>
              <p className="text-slate-500">Estas 5 preguntas me ayudarán a entender tu perfil estratégico.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> 1. ¿En que puesto estas buscando trabajar?
                </label>
                <input 
                  type="text" 
                  name="specialty"
                  placeholder="Ej: Publicidad, Marketing Digital, etc."
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Star className="w-4 h-4" /> 2. ¿Tenes disponibildiad full time o part time?
                </label>
                <input 
                  type="text" 
                  name="experience"
                  placeholder=""
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Target className="w-4 h-4" /> 3. ¿De que zona sos?
                </label>
                <textarea 
                  name="challenges"
                  placeholder=""
                  value={formData.challenges}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> 4. ¿Cuál es tu expectativa salarial mensual (opcional)?
                </label>
                <input 
                  type="text" 
                  name="salary"
                  placeholder=""
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4" /> 5. Decime tres empresas en las que te gustaria trabajar
                </label>
                <textarea 
                  name="whyMe"
                  placeholder="Por ejemplo Mercado libre"
                  value={formData.whyMe}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setStep('info')}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all"
              >
                Volver
              </button>
              <button 
                disabled={!formData.specialty || !formData.experience || !formData.challenges || !formData.whyMe}
                onClick={() => setStep('cv')}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        );

      case 'cv':
        return (
          <motion.div 
            key="cv"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 max-w-md mx-auto"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Carga tu CV</h2>
              <p className="text-slate-500">Último paso. Sube tu archivo en formato PDF o Word.</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                cvFile ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              {cvFile ? (
                <div className="space-y-2">
                  <FileText className="w-12 h-12 text-emerald-600 mx-auto" />
                  <p className="font-medium text-emerald-900">{cvFile.name}</p>
                  <p className="text-sm text-emerald-600">Archivo seleccionado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="font-medium text-slate-900">Haz clic para subir tu CV</p>
                  <p className="text-sm text-slate-500">PDF, DOCX (Máx 5MB)</p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium">{error}</p>
            )}

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setStep('questions')}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all"
              >
                Volver
              </button>
              <button 
                disabled={!cvFile || loading}
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {loading ? 'Enviando...' : 'Enviar Postulación'}
              </button>
            </div>
          </motion.div>
        );

      case 'scratch':
        return (
          <motion.div 
            key="scratch"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-w-md mx-auto"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Armar CV desde cero</h2>
              <p className="text-slate-500">Completa tus datos para que podamos ayudarte.</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  name="fullName"
                  placeholder="Nombre"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  name="lastName"
                  placeholder="Apellido"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Mail"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="Celular"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium">{error}</p>
            )}

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setStep('intro')}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all"
              >
                Volver
              </button>
              <button 
                disabled={loading || !formData.fullName || !formData.lastName || !formData.email || !formData.phone}
                onClick={handleScratchSubmit}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {loading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </motion.div>
        );

      case 'scratch_success':
        return (
          <motion.div 
            key="scratch_success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6 max-w-md mx-auto py-12"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900">¡Gracias por contactarnos!</h2>
            <p className="text-xl text-slate-600 font-medium">
              Nos ponemos en acción para armar tu CV, estate atento.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => {
                  setStep('intro');
                  setFormData({
                    fullName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    specialty: '',
                    experience: '',
                    challenges: '',
                    salary: '',
                    whyMe: '',
                  });
                  setError(null);
                }}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Volver al inicio
              </button>
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6 max-w-md mx-auto py-12"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900">Gracias por trabajar con nosotros!</h2>
            <p className="text-xl text-slate-600 font-medium">
              Espere el mensaje para seguir en el proceso.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => {
                  setStep('intro');
                  setFormData({
                    fullName: '',
                    email: '',
                    specialty: '',
                    experience: '',
                    challenges: '',
                    salary: '',
                    whyMe: '',
                  });
                  setCvFile(null);
                  setError(null);
                }}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Volver al inicio
              </button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-600">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">TC</div>
            Talent Connector
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <span className="hover:text-indigo-600 cursor-pointer">Cómo funciona</span>
            <span className="hover:text-indigo-600 cursor-pointer">Empresas</span>
            <span className="hover:text-indigo-600 cursor-pointer">Contacto</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          {step !== 'intro' && step !== 'success' && (
            <div className="mb-12 max-w-md mx-auto">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Información</span>
                <span>Preguntas</span>
                <span>CV</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-600"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: step === 'info' ? '33%' : step === 'questions' ? '66%' : '100%' 
                  }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-top border-slate-100 py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-slate-400 text-sm">
            © 2024 Talent Connector. Todos los derechos reservados.
          </div>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-indigo-600 transition-colors"></a>
            <a href="#" className="hover:text-indigo-600 transition-colors"></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
